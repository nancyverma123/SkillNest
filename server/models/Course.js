const mongoose = require('mongoose');
module.exports = mongoose.model('Course', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  duration: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  price: { type: Number, required: true, min: 0 },
  thumbnail: { type: String, default: '' },
  // Optional, additive fields: existing documents without them read back as empty arrays.
  outcomes: { type: [String], default: undefined },
  curriculum: { type: [String], default: undefined },
}, { timestamps: true }));
