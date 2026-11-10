const mongoose = require('mongoose');
const s = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  completedAt: { type: Date, default: null },
}, { timestamps: true });
// One enrollment per user per course, enforced by the database itself (not just app logic).
s.index({ user: 1, course: 1 }, { unique: true });
module.exports = mongoose.model('Enrollment', s);
