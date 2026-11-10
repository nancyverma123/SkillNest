// Integration tests for the SkillNest API (node:test + native fetch).
//
// SAFETY
// - By default the suite starts a throwaway in-memory MongoDB 7 (mongodb-memory-server) and stops it afterwards.
// - Optionally TEST_MONGO_URI may point at another LOCAL database whose name contains "test".
// - It never uses MONGO_URI from .env; that variable is removed from the process before any connection.
//
//   npm test
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const MONGO_TEST_VERSION = '7.0.14';
let TEST_URI = process.env.TEST_MONGO_URI;
let memoryServer;

function assertSafeTestUri(uri) {
  if (!uri) throw new Error('TEST_MONGO_URI is not set. Point it at a local, disposable test database.');
  const url = new URL(uri);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const dbName = url.pathname.replace(/^\//, '');
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) throw new Error(`Refusing to test against non-local host "${host}".`);
  if (!/test/i.test(dbName)) throw new Error(`Refusing to test against database "${dbName}" (name must contain "test").`);
}
if (TEST_URI) assertSafeTestUri(TEST_URI);

// Test-only settings, set before the app loads (dotenv never overrides existing variables).
process.env.JWT_SECRET = 'skillnest-test-secret';
process.env.AUTH_RATE_LIMIT_MAX = '40';
process.env.TRUST_PROXY = '0';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../server');
// server.js loads .env; drop the real connection string so nothing here can reach it.
delete process.env.MONGO_URI;
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

let server;
let base;
const tokens = {};
const ids = {};

async function call(method, path, { token, body, raw } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined || raw !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${base}${path}`, { method, headers, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
  return { status: res.status, body: json, headers: res.headers };
}
const expectError = (res, status) => {
  assert.equal(res.status, status, JSON.stringify(res.body));
  assert.equal(typeof res.body?.message, 'string', 'error responses must be { message }');
};

before(async () => {
  if (!TEST_URI) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({ binary: { version: MONGO_TEST_VERSION }, instance: { launchTimeout: 60000 } });
    TEST_URI = memoryServer.getUri('skillnest_test');
  }
  assertSafeTestUri(TEST_URI);
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all([User.init(), Course.init(), Enrollment.init()]);
  const hash = await bcrypt.hash('Admin@123', 10);
  await User.create({ name: 'Test Admin', email: 'admin@test.local', password: hash, role: 'admin' });
  const [a, b, c] = await Course.create([
    { title: 'Prompt Basics', description: 'Intro to prompts', instructor: 'Asha Rao', category: 'Generative AI', duration: '2 weeks', level: 'Beginner', price: 500 },
    { title: 'Agents in Practice', description: 'Agent patterns', instructor: 'Vik Shah', category: 'Agentic AI', duration: '4 weeks', level: 'Intermediate', price: 2500 },
    { title: 'SQL for Analysts', description: 'Query data', instructor: 'Asha Rao', category: 'Data Analytics', duration: '3 weeks', level: 'Advanced', price: 1200 },
  ]);
  ids.courseA = String(a._id); ids.courseB = String(b._id); ids.courseC = String(c._id);
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

// Runs even when tests or the before() hook fail, so the temporary database is always cleaned up.
after(async () => {
  server?.close();
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  } finally {
    await memoryServer?.stop();
  }
});

describe('platform', () => {
  it('health check responds', async () => {
    const res = await call('GET', '/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });
  it('sets helmet security headers', async () => {
    const res = await call('GET', '/health');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
  });
  it('unknown API routes return 404 { message }', async () => expectError(await call('GET', '/nope'), 404));
  it('malformed JSON returns 400 { message }', async () => expectError(await call('POST', '/auth/login', { raw: '{bad json' }), 400));
});

describe('auth', () => {
  it('rejects invalid registration input', async () => {
    expectError(await call('POST', '/auth/register', { body: { name: 'A', email: 'a@b.co', password: 'secret1' } }), 400);
    expectError(await call('POST', '/auth/register', { body: { name: 'Alice', email: 'not-an-email', password: 'secret1' } }), 400);
    expectError(await call('POST', '/auth/register', { body: { name: 'Alice', email: 'alice@test.local', password: '123' } }), 400);
    expectError(await call('POST', '/auth/register', { body: { name: 'Alice', email: 'alice@test.local', password: { $gt: '' } } }), 400);
  });
  it('registers students (role in the body is ignored)', async () => {
    const res = await call('POST', '/auth/register', { body: { name: 'Alice Student', email: 'Alice@Test.local', password: 'secret1', role: 'admin' } });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'student');
    assert.equal(res.body.user.email, 'alice@test.local');
    assert.equal(res.body.user.password, undefined);
    tokens.alice = res.body.token;
    const bob = await call('POST', '/auth/register', { body: { name: 'Bob Student', email: 'bob@test.local', password: 'secret2' } });
    tokens.bob = bob.body.token;
  });
  it('blocks duplicate emails with 409', async () => {
    expectError(await call('POST', '/auth/register', { body: { name: 'Alice Again', email: 'alice@test.local', password: 'secret1' } }), 409);
  });
  it('rejects bad logins with 400/401', async () => {
    expectError(await call('POST', '/auth/login', { body: {} }), 400);
    expectError(await call('POST', '/auth/login', { body: { email: 'alice@test.local', password: 'wrong-pass' } }), 401);
    expectError(await call('POST', '/auth/login', { body: { email: { $ne: '' }, password: 'x' } }), 400);
  });
  it('logs in admin and student', async () => {
    const admin = await call('POST', '/auth/login', { body: { email: 'admin@test.local', password: 'Admin@123' } });
    assert.equal(admin.status, 200);
    assert.equal(admin.body.user.role, 'admin');
    tokens.admin = admin.body.token;
    const alice = await call('POST', '/auth/login', { body: { email: 'alice@test.local', password: 'secret1' } });
    assert.equal(alice.status, 200);
  });
  it('/auth/me requires a valid token', async () => {
    expectError(await call('GET', '/auth/me'), 401);
    expectError(await call('GET', '/auth/me', { token: 'garbage' }), 401);
    const me = await call('GET', '/auth/me', { token: tokens.alice });
    assert.equal(me.status, 200);
    assert.equal(me.body.user.name, 'Alice Student');
    assert.ok(me.body.user.createdAt);
  });
});

describe('courses', () => {
  it('lists courses newest first by default', async () => {
    const res = await call('GET', '/courses');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 3);
  });
  it('searches by title, instructor and topic', async () => {
    assert.equal((await call('GET', '/courses?search=agents')).body.length, 1);
    assert.equal((await call('GET', '/courses?search=asha')).body.length, 2);
    assert.equal((await call('GET', '/courses?search=analytics')).body.length, 1);
    assert.equal((await call('GET', '/courses?search=(.*')).status, 200);
  });
  it('filters by category and level (legacy category=All still works)', async () => {
    assert.equal((await call('GET', '/courses?category=Agentic%20AI')).body.length, 1);
    assert.equal((await call('GET', '/courses?category=All')).body.length, 3);
    assert.equal((await call('GET', '/courses?level=Advanced')).body[0].title, 'SQL for Analysts');
    assert.equal((await call('GET', '/courses?category[$ne]=x')).body.length, 3, 'operator objects are ignored');
  });
  it('sorts by price both ways', async () => {
    assert.deepEqual((await call('GET', '/courses?sort=price_asc')).body.map((c) => c.price), [500, 1200, 2500]);
    assert.deepEqual((await call('GET', '/courses?sort=price_desc')).body.map((c) => c.price), [2500, 1200, 500]);
  });
  it('returns categories with counts', async () => {
    const res = await call('GET', '/courses/categories');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.find((c) => c.name === 'Agentic AI'), { name: 'Agentic AI', count: 1 });
  });
  it('gets one course; 404 for missing or malformed ids', async () => {
    assert.equal((await call('GET', `/courses/${ids.courseA}`)).body.title, 'Prompt Basics');
    expectError(await call('GET', '/courses/64b000000000000000000000'), 404);
    expectError(await call('GET', '/courses/not-an-id'), 404);
  });
  it('only admins can create, update and delete', async () => {
    const body = { title: 'X', description: 'Y', instructor: 'Z', category: 'C', duration: '1 day', price: 10 };
    expectError(await call('POST', '/courses', { body }), 401);
    expectError(await call('POST', '/courses', { body, token: tokens.alice }), 403);
    expectError(await call('PUT', `/courses/${ids.courseA}`, { body: { price: 1 }, token: tokens.alice }), 403);
    expectError(await call('DELETE', `/courses/${ids.courseA}`, { token: tokens.alice }), 403);
  });
  it('validates course input and strips unknown fields', async () => {
    expectError(await call('POST', '/courses', { token: tokens.admin, body: { title: 'Missing fields' } }), 400);
    expectError(await call('POST', '/courses', { token: tokens.admin, body: { title: 'T', description: 'D', instructor: 'I', category: 'C', duration: '1w', price: -5 } }), 400);
    expectError(await call('POST', '/courses', { token: tokens.admin, body: { title: 'T', description: 'D', instructor: 'I', category: 'C', duration: '1w', price: 5, level: 'Expert' } }), 400);
    expectError(await call('POST', '/courses', { token: tokens.admin, body: { title: 'T', description: 'D', instructor: 'I', category: 'C', duration: '1w', price: 5, thumbnail: 'javascript:alert(1)' } }), 400);
    const res = await call('POST', '/courses', {
      token: tokens.admin,
      body: { title: 'New Course', description: 'Desc', instructor: 'Inst', category: 'Generative AI', duration: '1 week', price: '750', level: 'Beginner', outcomes: ['One', ' ', 'Two'], curriculum: ['M1'], _id: '64b000000000000000000001', createdAt: '2000-01-01' },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.price, 750);
    assert.deepEqual(res.body.outcomes, ['One', 'Two']);
    assert.notEqual(res.body._id, '64b000000000000000000001');
    assert.notEqual(new Date(res.body.createdAt).getFullYear(), 2000);
    ids.newCourse = res.body._id;
  });
  it('admin updates a course (partial PUT)', async () => {
    const res = await call('PUT', `/courses/${ids.newCourse}`, { token: tokens.admin, body: { price: 999, curriculum: ['M1', 'M2'] } });
    assert.equal(res.status, 200);
    assert.equal(res.body.price, 999);
    assert.equal(res.body.title, 'New Course');
    assert.deepEqual(res.body.curriculum, ['M1', 'M2']);
    expectError(await call('PUT', `/courses/${ids.newCourse}`, { token: tokens.admin, body: { unknown: 1 } }), 400);
    expectError(await call('PUT', '/courses/64b000000000000000000000', { token: tokens.admin, body: { price: 1 } }), 404);
  });
});

describe('enrollments', () => {
  it('requires auth and a valid courseId', async () => {
    expectError(await call('POST', '/enrollments', { body: { courseId: ids.courseA } }), 401);
    expectError(await call('POST', '/enrollments', { token: tokens.alice, body: { courseId: 'abc' } }), 400);
    expectError(await call('POST', '/enrollments', { token: tokens.alice, body: { courseId: '64b000000000000000000000' } }), 404);
  });
  it('enrolls and blocks duplicates with 409', async () => {
    const res = await call('POST', '/enrollments', { token: tokens.alice, body: { courseId: ids.courseA } });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'active');
    ids.aliceEnrollment = res.body._id;
    expectError(await call('POST', '/enrollments', { token: tokens.alice, body: { courseId: ids.courseA } }), 409);
    const bob = await call('POST', '/enrollments', { token: tokens.bob, body: { courseId: ids.courseB } });
    ids.bobEnrollment = bob.body._id;
    await call('POST', '/enrollments', { token: tokens.alice, body: { courseId: ids.newCourse } });
  });
  it('lists only the caller’s enrollments with populated courses', async () => {
    const res = await call('GET', '/enrollments/my-courses', { token: tokens.alice });
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
    assert.ok(res.body.every((e) => e.course?.title));
  });
  it('student can mark their own enrollment completed', async () => {
    const res = await call('PATCH', `/enrollments/${ids.aliceEnrollment}`, { token: tokens.alice, body: { status: 'completed' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'completed');
    assert.ok(res.body.completedAt);
    assert.equal(res.body.course.title, 'Prompt Basics');
  });
  it('PATCH validates status and ownership', async () => {
    expectError(await call('PATCH', `/enrollments/${ids.aliceEnrollment}`, { token: tokens.alice, body: { status: 'paused' } }), 400);
    expectError(await call('PATCH', `/enrollments/${ids.bobEnrollment}`, { token: tokens.alice, body: { status: 'completed' } }), 403);
    expectError(await call('PATCH', `/enrollments/${ids.bobEnrollment}`, { token: tokens.admin, body: { status: 'completed' } }), 403);
    expectError(await call('PATCH', `/enrollments/${ids.bobEnrollment}`, { body: { status: 'completed' } }), 401);
    expectError(await call('PATCH', '/enrollments/64b000000000000000000000', { token: tokens.alice }), 404);
    const bob = await Enrollment.findById(ids.bobEnrollment);
    assert.equal(bob.status, 'active', 'forbidden request must not change data');
  });
  it('DELETE enforces ownership and removes own enrollment', async () => {
    expectError(await call('DELETE', `/enrollments/${ids.bobEnrollment}`, { token: tokens.alice }), 403);
    assert.ok(await Enrollment.findById(ids.bobEnrollment), 'forbidden delete must not remove data');
    const res = await call('DELETE', `/enrollments/${ids.bobEnrollment}`, { token: tokens.bob });
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.message, 'string');
    expectError(await call('DELETE', `/enrollments/${ids.bobEnrollment}`, { token: tokens.bob }), 404);
  });
  it('student can re-enroll after unenrolling', async () => {
    const res = await call('POST', '/enrollments', { token: tokens.bob, body: { courseId: ids.courseB } });
    assert.equal(res.status, 201);
  });
});

describe('admin-only endpoints', () => {
  it('students get 403 and anonymous users 401', async () => {
    for (const path of ['/stats', '/users', '/enrollments']) {
      expectError(await call('GET', path, { token: tokens.alice }), 403);
      expectError(await call('GET', path), 401);
    }
  });
  it('lists users without passwords', async () => {
    const res = await call('GET', '/users', { token: tokens.admin });
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 3);
    assert.ok(res.body.every((u) => u.password === undefined));
  });
  it('lists all enrollments with user and course', async () => {
    const res = await call('GET', '/enrollments', { token: tokens.admin });
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 3);
    assert.ok(res.body[0].user.email && res.body[0].course.title);
  });
  it('returns accurate stats including zero-enrollment courses', async () => {
    const res = await call('GET', '/stats', { token: tokens.admin });
    assert.equal(res.status, 200);
    assert.equal(res.body.totalCourses, 4);
    assert.equal(res.body.totalUsers, 3);
    assert.equal(res.body.totalEnrollments, 3);
    assert.deepEqual(res.body.enrollmentsByStatus, { active: 2, completed: 1 });
    const per = Object.fromEntries(res.body.enrollmentsPerCourse.map((c) => [c.title, c.count]));
    assert.deepEqual(per, { 'Prompt Basics': 1, 'Agents in Practice': 1, 'New Course': 1, 'SQL for Analysts': 0 });
  });
  it('deleting a course cascades its enrollments', async () => {
    const res = await call('DELETE', `/courses/${ids.newCourse}`, { token: tokens.admin });
    assert.equal(res.status, 200);
    assert.equal(await Enrollment.countDocuments({ course: ids.newCourse }), 0);
    expectError(await call('DELETE', `/courses/${ids.newCourse}`, { token: tokens.admin }), 404);
  });
});

describe('rate limiting', () => {
  it('throttles repeated login attempts with 429 { message }', async () => {
    let last;
    for (let i = 0; i < 45; i++) {
      last = await call('POST', '/auth/login', { body: { email: 'nobody@test.local', password: 'x' } });
      if (last.status === 429) break;
    }
    expectError(last, 429);
  });
});
