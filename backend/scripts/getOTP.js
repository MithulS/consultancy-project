// Script to get current OTP for admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function getOTP() {
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

    console.log('📊 Admin User Info:');
    console.log('==========================================');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('');
    
    if (admin.otp && admin.otpExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(admin.otpExpiresAt);
      const isExpired = expiresAt < now;
      const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      const minutesLeft = Math.floor(timeLeft / 60);
      const secondsLeft = timeLeft % 60;

      console.log('🔐 OTP Status:');
      console.log('==========================================');
      console.log('✅ OTP Exists: Yes');
      console.log('🔒 OTP Hash:', admin.otp.substring(0, 20) + '...');
      console.log('⏰ Expires At:', expiresAt.toLocaleString());
      console.log('⌛ Time Left:', isExpired ? 'EXPIRED' : `${minutesLeft}m ${secondsLeft}s`);
      console.log('🚫 Attempts:', admin.otpAttempts || 0, '/ 3');
      console.log('');
      
      if (isExpired) {
        console.log('⚠️  OTP has expired. Request a new one.');
      } else {
        console.log('ℹ️  Note: OTP is hashed in database for security.');
        console.log('ℹ️  The actual OTP was sent to your email or logged in console during generation.');
        console.log('ℹ️  To get the plain OTP, request a new one and check the backend console.');
      }
    } else {
      console.log('⚠️  No OTP found for this admin user');
      console.log('ℹ️  Request an OTP through the forgot password page');
    }

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

getOTP();
