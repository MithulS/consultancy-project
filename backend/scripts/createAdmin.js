// Create admin user with specific credentials
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'mithuld321@gmail.com';
    const adminPassword = 'Admin@123';
    const adminName = 'Admin';

    console.log('\n🔍 Checking if admin user already exists...');
    
    // Check if user already exists
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (admin) {
      console.log('✅ Admin user found in database');
      console.log('📝 Current admin details:');
      console.log({
        id: admin._id,
        email: admin.email,
        name: admin.name,
        isAdmin: admin.isAdmin,
        isVerified: admin.isVerified
      });

      // Update admin properties
      console.log('\n🔄 Updating admin account...');
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin.password = hashedPassword;
      admin.isAdmin = true;
      admin.isVerified = true;
      admin.name = adminName;
      
      // Clear OTP fields if they exist
      admin.otp = undefined;
      admin.otpExpiresAt = undefined;
      admin.otpAttempts = 0;
      admin.otpLockedUntil = undefined;
      
      await admin.save();
      console.log('✅ Admin account updated successfully!');
    } else {
      console.log('❌ Admin user not found');
      console.log('🆕 Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      admin = new User({
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        name: adminName,
        isAdmin: true,
        isVerified: true,
        username: 'admin',
        otpAttempts: 0
      });
      
      await admin.save();
      console.log('✅ New admin user created successfully!');
    }

    console.log('\n✨ Admin credentials configured:');
    console.log('━'.repeat(50));
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', adminName);
    console.log('🔐 Admin Access:', admin.isAdmin);
    console.log('✅ Verified:', admin.isVerified);
    console.log('🆔 User ID:', admin._id);
    console.log('━'.repeat(50));
    console.log('\n🎉 You can now log in to the admin panel!');
    console.log('🌐 Admin URL: http://localhost:5173/#admin');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
