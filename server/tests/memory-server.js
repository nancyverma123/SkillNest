// Runs the API against a throwaway in-memory MongoDB 7, pre-filled with the sample catalogue
// and two test accounts. Used for manual/UI testing without touching any real database.
// Everything is discarded when the process exits.
//
//   npm run dev:memory            (API on http://localhost:5055/api)
//   then in client/: set VITE_API_URL=http://localhost:5055/api and run npm run dev -- --port 5174
process.env.JWT_SECRET = process.env.JWT_SECRET_MEMORY || 'skillnest-memory-dev-secret';
process.env.CLIENT_URL = process.env.MEMORY_CLIENT_URL || 'http://localhost:5174';
process.env.AUTH_RATE_LIMIT_MAX = '200';
process.env.TRUST_PROXY = '0';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const sampleCourses = require('../data/sampleCourses');

delete process.env.MONGO_URI;
const PORT = Number(process.env.MEMORY_PORT) || 5055;

(async () => {
  const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.14' }, instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri('skillnest_memory'));
  await Promise.all([User.init(), Course.init(), Enrollment.init()]);

  const [, student] = await User.create([
    { name: 'Admin', email: 'admin@skillnest.com', password: await bcrypt.hash('Admin@123', 10), role: 'admin' },
    { name: 'Test Student', email: 'student@skillnest.com', password: await bcrypt.hash('Student@123', 10) },
  ]);
  const courses = await Course.insertMany(sampleCourses.map((c) => ({ ...c, thumbnail: '' })));
  // One course without outcomes/curriculum, to exercise the "not published yet" states.
  await Course.updateOne({ _id: courses[5]._id }, { $unset: { outcomes: '', curriculum: '' } });
  await Enrollment.create([
    { user: student._id, course: courses[0]._id },
    { user: student._id, course: courses[2]._id, status: 'completed', completedAt: new Date() },
  ]);

  const server = app.listen(PORT, () => console.log(`In-memory API ready on http://localhost:${PORT}/api`));
  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((e) => { console.error(e); process.exit(1); });
