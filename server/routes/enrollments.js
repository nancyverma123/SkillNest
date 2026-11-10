const r = require('express').Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');
const { isId, validId } = require('../middleware/validate');
const STATUSES = ['active', 'completed'];

r.post('/', protect, async (req, res, next) => {
  try {
    const { courseId } = req.body || {};
    if (!isId(courseId)) return res.status(400).json({ message: 'A valid courseId is required' });
    const course = await Course.findById(courseId);
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

// Loads the enrollment and enforces ownership. Sends 404/403 itself and returns null on failure.
async function loadOwnEnrollment(req, res) {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    res.status(404).json({ message: 'Enrollment not found' });
    return null;
  }
  if (!enrollment.user.equals(req.user._id)) {
    res.status(403).json({ message: 'You can only change your own enrollments' });
    return null;
  }
  return enrollment;
}

// PATCH /api/enrollments/:id  { status?: 'completed' | 'active' }  (defaults to 'completed')
r.patch('/:id', protect, validId('Enrollment'), async (req, res, next) => {
  try {
    const status = req.body?.status ?? 'completed';
    if (!STATUSES.includes(status)) return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
    const enrollment = await loadOwnEnrollment(req, res);
    if (!enrollment) return;
    enrollment.status = status;
    enrollment.completedAt = status === 'completed' ? enrollment.completedAt || new Date() : null;
    await enrollment.save();
    await enrollment.populate('course');
    res.json(enrollment);
  } catch (e) { next(e); }
});

r.delete('/:id', protect, validId('Enrollment'), async (req, res, next) => {
  try {
    const enrollment = await loadOwnEnrollment(req, res);
    if (!enrollment) return;
    await enrollment.deleteOne();
    res.json({ message: 'You have been unenrolled from this course', id: enrollment._id });
  } catch (e) { next(e); }
});
module.exports = r;
