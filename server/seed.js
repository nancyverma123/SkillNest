require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const img = (s) => `https://picsum.photos/seed/${s}/600/400`;
const courses = [
  ['Generative AI Foundations', 'Learn prompt design, LLM workflows and practical ways to use generative AI at work.', 'Aarav Mehta', 'Generative AI', '4 weeks', 'Beginner', 1499],
  ['AI Agents & Automation', 'Build reliable AI-assisted workflows with agent patterns, tool use and business automation.', 'Neha Kapoor', 'Agentic AI', '6 weeks', 'Intermediate', 2499],
  ['Data Analytics: From Excel to Insight', 'Turn business data into confident decisions using Excel, SQL and dashboard thinking.', 'Rohan Verma', 'Data Analytics', '3 weeks', 'Beginner', 999],
  ['Business Analytics Essentials', 'Frame business questions, read performance signals and communicate actionable insights.', 'Sana Khan', 'Business Analytics', '2 weeks', 'Beginner', 1199],
  ['Machine Learning for Career Builders', 'Understand core ML concepts and create a simple predictive model with guided practice.', 'Karan Singh', 'Artificial Intelligence', '5 weeks', 'Intermediate', 2199],
  ['Automate Work with No-Code AI', 'Design practical AI automations for research, content and everyday operational tasks.', 'Ishita Rao', 'AI Automation', '2 days', 'Beginner', 699],
].map(([title, description, instructor, category, duration, level, price]) =>
  ({ title, description, instructor, category, duration, level, price, thumbnail: img(title.replace(/\W/g, '')) }));
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Course.deleteMany(), Enrollment.deleteMany()]);
  await User.create([
    { name: 'Admin', email: 'admin@skillnest.com', password: await bcrypt.hash('Admin@123', 10), role: 'admin' },
    { name: 'Test Student', email: 'student@skillnest.com', password: await bcrypt.hash('Student@123', 10) },
  ]);
  await Course.insertMany(courses);
  console.log('Seeded: admin@skillnest.com / Admin@123, student@skillnest.com / Student@123');
  process.exit(0);
})();
