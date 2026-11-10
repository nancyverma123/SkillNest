// DESTRUCTIVE: wipes ALL users, courses and enrollments, then inserts sample data.
// Only for brand-new or disposable databases. To add course content to an existing
// database without deleting anything, use `npm run content:preview` instead.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const sampleCourses = require('./data/sampleCourses');

if (!process.argv.includes('--reset')) {
  console.error([
    'Refusing to run: seed.js DELETES every user, course and enrollment in the target database.',
    'If this is a new or disposable database, run:  npm run seed:reset',
    'To add outcomes/curriculum to existing courses safely, run:  npm run content:preview',
  ].join('\n'));
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run seed.js with NODE_ENV=production.');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Course.deleteMany(), Enrollment.deleteMany()]);
  await User.create([
    { name: 'Admin', email: 'admin@skillnest.com', password: await bcrypt.hash('Admin@123', 10), role: 'admin' },
    { name: 'Test Student', email: 'student@skillnest.com', password: await bcrypt.hash('Student@123', 10) },
  ]);
  // Empty thumbnail = the UI shows a category illustration instead of an unrelated stock photo.
  await Course.insertMany(sampleCourses.map((c) => ({ ...c, thumbnail: '' })));
  console.log('Seeded: admin@skillnest.com / Admin@123, student@skillnest.com / Student@123');
  process.exit(0);
})();
