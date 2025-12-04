// scripts/verifyUser.js
// Usage: node scripts/verifyUser.js user@example.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const connectDB = require('../config/db');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/verifyUser.js <email>');
  process.exit(1);
}

async function run() {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error('User not found:', email);
      process.exit(2);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;

    await user.save();
    console.log('User verified successfully:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error verifying user:', err);
    process.exit(3);
  }
}

run();
