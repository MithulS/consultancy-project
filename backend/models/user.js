// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String }, // hashed OTP
  otpExpiresAt: { type: Date },
  otpAttempts: { type: Number, default: 0 }, // Track failed OTP attempts
  otpLockedUntil: { type: Date }, // Lock account after too many failed attempts
  resetPasswordToken: { type: String }, // hashed reset token
  resetPasswordExpiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
