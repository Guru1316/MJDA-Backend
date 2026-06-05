const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  newsletter: { type: Boolean, default: false },
  status: { type: String, enum: ['New', 'Replied'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);