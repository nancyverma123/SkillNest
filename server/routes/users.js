const r = require('express').Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
r.get('/', protect, adminOnly, async (req, res, next) => {
  try { res.json(await User.find().sort('-createdAt')); } catch (e) { next(e); }
});
module.exports = r;
