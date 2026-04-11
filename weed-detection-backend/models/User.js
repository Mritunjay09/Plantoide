const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // This acts as the Login ID
  password: { type: String, required: true }, // In a real app, we hash this!
  fullName: String,
  farmLocation: String,
  profileImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
