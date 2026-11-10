const r = require('express').Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/stats — admin-only platform totals and enrollments per course (courses with 0 included).
r.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const [totalCourses, totalUsers, totalEnrollments, byStatus, byCourse, courses] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Enrollment.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]),
      Course.find({}, 'title').lean(),
    ]);
    const status = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
    const counts = Object.fromEntries(byCourse.map((c) => [String(c._id), c.count]));
    const enrollmentsPerCourse = courses
      .map((c) => ({ courseId: c._id, title: c.title, count: counts[String(c._id)] || 0 }))
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));

    res.json({
      totalCourses,
      totalUsers,
      totalEnrollments,
      enrollmentsByStatus: { active: status.active || 0, completed: status.completed || 0 },
      enrollmentsPerCourse,
    });
  } catch (e) { next(e); }
});

module.exports = r;
