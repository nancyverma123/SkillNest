const r = require('express').Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

r.post('/', protect, async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(201).json(await Enrollment.create({ user: req.user._id, course: course._id }));
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'You are already enrolled in this course' });
    next(e);
  }
});
r.get('/my-courses', protect, async (req, res, next) => {
  try { res.json(await Enrollment.find({ user: req.user._id }).populate('course').sort('-createdAt')); } catch (e) { next(e); }
});
r.get('/', protect, adminOnly, async (req, res, next) => {
  try { res.json(await Enrollment.find().populate('user', 'name email').populate('course', 'title').sort('-createdAt')); } catch (e) { next(e); }
});
module.exports = r;
