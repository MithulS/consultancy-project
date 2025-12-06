// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true, trim: true, minlength: 3 },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, trim: true }, // Admin contact phone number
  isAdmin: { type: Boolean, default: false }, // Admin flag
  isVerified: { type: Boolean, default: false },
  otp: { type: String }, // hashed OTP
  otpExpiresAt: { type: Date },
  otpAttempts: { type: Number, default: 0 }, // Track failed OTP attempts
  otpLockedUntil: { type: Date }, // Lock account after too many failed attempts
  resetPasswordToken: { type: String }, // hashed reset token
  resetPasswordExpiresAt: { type: Date },
  // Loyalty & Referral System
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
