const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profession: String,
  experience: String,
  city: String,
  pincode: String,
  mobile: String,
  email: String,
  latitude: Number,
  longitude: Number,
  panCard: String,
  aadharCard: String,
  voterId: String,
  status: { type: String, enum: ['pending', 'verified'], default: 'pending' }
});

module.exports = mongoose.model('AdminProfile', adminSchema);
