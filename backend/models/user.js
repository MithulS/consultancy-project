// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true, trim: true, minlength: 3 },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { 
    type: String, 
    required: function() { return !this.googleId; }, // Not required for Google OAuth users
    select: false 
  },
  phoneNumber: { type: String, trim: true }, // Admin contact phone number
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false }, // Admin flag
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false }, // hashed OTP
  otpExpiresAt: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false }, // Track failed OTP attempts
  otpLockedUntil: { type: Date, select: false }, // Lock account after too many failed attempts
  resetPasswordToken: { type: String, select: false }, // hashed reset token
  resetPasswordExpiresAt: { type: Date, select: false },
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  // Loyalty & Referral System
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' }
}, { timestamps: true });

// Indexes
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Also hash password on findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }
  if (update.$set && update.$set.password) {
    const salt = await bcrypt.genSalt(10);
    update.$set.password = await bcrypt.hash(update.$set.password, salt);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
