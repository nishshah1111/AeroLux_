const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  manufacturer: String,
  model: String,
  year: Number,
  price: Number,
  ttaf: Number,
  location: String,
  image_url: String,
  description: String,
  serial_number: String,
  engine_model: String,
  avionics_suite: String,
  interior_desc: String
});

module.exports = mongoose.models.Aircraft || mongoose.model('Aircraft', aircraftSchema);
