// Non-destructive migration: adds sample `outcomes` and `curriculum` to EXISTING courses
// whose title matches data/sampleCourses.js. It never deletes documents, never creates
// courses, and never overwrites fields that already have content.
//
//   npm run content:preview                 dry run (default) — prints what would change
//   npm run content:apply                   backs up affected courses to backups/, then updates
//   node scripts/addCourseContent.js --restore backups/<file>.json   undo using a backup
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const sampleCourses = require('../data/sampleCourses');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const restoreIdx = args.indexOf('--restore');
const FIELDS = ['outcomes', 'curriculum'];
const isEmpty = (v) => !Array.isArray(v) || v.length === 0;

async function restore(file) {
  const backup = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  for (const doc of backup.courses) {
    const set = {};
    const unset = {};
    for (const f of FIELDS) {
      if (doc[f] === undefined) unset[f] = ''; else set[f] = doc[f];
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    await Course.updateOne({ _id: doc._id }, update);
    console.log(`Restored: ${doc.title}`);
  }
}

async function migrate() {
  const plan = [];
  for (const sample of sampleCourses) {
    const course = await Course.findOne({ title: sample.title }).lean();
    if (!course) { console.log(`skip     ${sample.title} (not in this database)`); continue; }
    const set = Object.fromEntries(FIELDS.filter((f) => isEmpty(course[f])).map((f) => [f, sample[f]]));
    if (!Object.keys(set).length) { console.log(`skip     ${sample.title} (already has content)`); continue; }
    plan.push({ course, set });
    console.log(`${APPLY ? 'update' : 'would update'}  ${sample.title}: ${Object.keys(set).join(', ')}`);
  }

  if (!plan.length) { console.log('\nNothing to change.'); return; }
  if (!APPLY) { console.log(`\nDry run only. ${plan.length} course(s) would be updated. Re-run with --apply to write changes.`); return; }

  const dir = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `course-content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  const backup = { createdAt: new Date().toISOString(), courses: plan.map((p) => ({ _id: p.course._id, title: p.course.title, outcomes: p.course.outcomes, curriculum: p.course.curriculum })) };
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nBackup written: ${path.relative(process.cwd(), file)}`);

  for (const { course, set } of plan) await Course.updateOne({ _id: course._id }, { $set: set });
  console.log(`Updated ${plan.length} course(s). Undo with: node scripts/addCourseContent.js --restore ${path.relative(process.cwd(), file)}`);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    if (restoreIdx !== -1) await restore(args[restoreIdx + 1]);
    else await migrate();
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
