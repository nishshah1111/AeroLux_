const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  user_name: { type: String, required: true },
  user_email: { type: String, required: true },
  subject: String,
  message: { type: String, required: true },
  aircraft_id: Number,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
