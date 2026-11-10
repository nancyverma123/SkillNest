const r = require('express').Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, adminOnly } = require('../middleware/auth');
const { LEVELS, isStr, validId, validateCourse } = require('../middleware/validate');
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = { newest: '-createdAt', price_asc: 'price -createdAt', price_desc: '-price -createdAt' };

// GET /api/courses?search=&category=&level=&sort=newest|price_asc|price_desc
// Non-string query values (e.g. category[$ne]=x) are ignored to prevent operator injection.
r.get('/', async (req, res, next) => {
  try {
    const { search, category, level, sort } = req.query;
    const f = {};
    if (isStr(category) && category && category !== 'All') f.category = category;
    if (isStr(level) && LEVELS.includes(level)) f.level = level;
    if (isStr(search) && search.trim()) {
      const re = new RegExp(esc(search.trim().slice(0, 100)), 'i');
      f.$or = [{ title: re }, { instructor: re }, { category: re }, { description: re }];
    }
    res.json(await Course.find(f).sort(SORTS[sort] || SORTS.newest));
  } catch (e) { next(e); }
});

// Registered before /:id so "categories" is not treated as a course id.
r.get('/categories', async (req, res, next) => {
  try {
    const rows = await Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    res.json(rows.map((row) => ({ name: row._id, count: row.count })));
  } catch (e) { next(e); }
});

r.get('/:id', validId('Course'), async (req, res, next) => {
  try {
    const c = await Course.findById(req.params.id);
    c ? res.json(c) : res.status(404).json({ message: 'Course not found' });
  } catch (e) { next(e); }
});
r.post('/', protect, adminOnly, validateCourse(false), async (req, res, next) => {
  try { res.status(201).json(await Course.create(req.body)); } catch (e) { next(e); }
});
r.put('/:id', protect, adminOnly, validId('Course'), validateCourse(true), async (req, res, next) => {
  try {
    const c = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    c ? res.json(c) : res.status(404).json({ message: 'Course not found' });
  } catch (e) { next(e); }
});
r.delete('/:id', protect, adminOnly, validId('Course'), async (req, res, next) => {
  try {
    const c = await Course.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ message: 'Course not found' });
    await Enrollment.deleteMany({ course: c._id });
    res.json({ message: 'Course deleted' });
  } catch (e) { next(e); }
});
module.exports = r;
