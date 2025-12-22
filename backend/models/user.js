// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true, trim: true, minlength: 3 },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phoneNumber: { type: String, trim: true }, // Admin contact phone number
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false }, // Admin flag
  isVerified: { type: Boolean, default: false },
  otp: { type: String }, // hashed OTP
  otpExpiresAt: { type: Date },
  otpAttempts: { type: Number, default: 0 }, // Track failed OTP attempts
  otpLockedUntil: { type: Date }, // Lock account after too many failed attempts
  resetPasswordToken: { type: String }, // hashed reset token
  resetPasswordExpiresAt: { type: Date },
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  // Loyalty & Referral System
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
