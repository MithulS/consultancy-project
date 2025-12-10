// Script to manually generate and display OTP
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function generateOTP() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const admin = await User.findOne({ 
      email: 'admin@example.com',
      isAdmin: true 
    });

    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash it
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    
    // Save to database
    admin.otp = hashedOTP;
    admin.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    admin.otpAttempts = 0;
    await admin.save();

    console.log('==============================================');
    console.log('🔐 NEW OTP GENERATED FOR TESTING');
    console.log('==============================================');
    console.log('📧 Email: admin@example.com');
    console.log('🔢 OTP CODE: ' + otpCode);
    console.log('⏰ Valid until:', admin.otpExpiresAt.toLocaleString());
    console.log('==============================================');
    console.log('\n✅ OTP saved to database');
    console.log('ℹ️  Use this OTP in the frontend to test password reset\n');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateOTP();
