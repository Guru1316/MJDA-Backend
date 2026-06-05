const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  color: { type: String, required: true, default: '#C9A84C' },
  emoji: { type: String, required: true, default: '🩰' },
  desc: { type: String, required: true },
  students: { type: Number, default: 0 } // Random/Static number to match your UI
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);