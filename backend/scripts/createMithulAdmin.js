// Script to create admin user with specific credentials
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = 'mithuld321@gmail.com';
    const password = 'Mithul@d321';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('📧 User already exists with email:', email);
      
      // Update existing user to admin with new password
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      existingUser.isAdmin = true;
      existingUser.isVerified = true;
      await existingUser.save();
      
      console.log('✅ Updated existing user to admin with new password\n');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newAdmin = new User({
        name: 'Mithul D',
        email: email,
        password: hashedPassword,
        isAdmin: true,
        isVerified: true,
        phoneNumber: '+91-XXXXXXXXXX'
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created successfully!\n');
    }

    console.log('==========================================');
    console.log('🎉 ADMIN ACCOUNT READY');
    console.log('==========================================');
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);
    console.log('👑 Role: Admin');
    console.log('✅ Verified: Yes');
    console.log('==========================================\n');
    console.log('🌐 Login at: http://localhost:5173/#secret-admin-login\n');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
