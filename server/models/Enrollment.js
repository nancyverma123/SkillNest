const mongoose = require('mongoose');
const s = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });
s.index({ user: 1, course: 1 }, { unique: true });
module.exports = mongoose.model('Enrollment', s);
