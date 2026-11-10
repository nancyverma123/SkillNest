const r = require('express').Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, adminOnly } = require('../middleware/auth');
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

r.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const f = {};
    if (category && category !== 'All') f.category = category;
    if (search) { const re = new RegExp(esc(search), 'i'); f.$or = [{ title: re }, { instructor: re }, { description: re }]; }
    res.json(await Course.find(f).sort('-createdAt'));
  } catch (e) { next(e); }
});
r.get('/:id', async (req, res, next) => {
  try {
    const c = await Course.findById(req.params.id);
    c ? res.json(c) : res.status(404).json({ message: 'Course not found' });
  } catch (e) { next(e); }
});
r.post('/', protect, adminOnly, async (req, res, next) => {
  try { res.status(201).json(await Course.create(req.body)); } catch (e) { next(e); }
});
r.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const c = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    c ? res.json(c) : res.status(404).json({ message: 'Course not found' });
  } catch (e) { next(e); }
});
r.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const c = await Course.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ message: 'Course not found' });
    await Enrollment.deleteMany({ course: c._id });
    res.json({ message: 'Course deleted' });
  } catch (e) { next(e); }
});
module.exports = r;
