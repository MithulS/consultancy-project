// Script to check and create admin user if needed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const admins = await User.find({ isAdmin: true });
    console.log(`\n📊 Found ${admins.length} admin user(s):\n`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Verified: ${admin.isVerified}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No admin users found in database!');
      console.log('\n🔧 Creating a default admin user...\n');
      
      // Create default admin
      const defaultPassword = 'Admin@123456';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      const newAdmin = new User({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true,
        isVerified: true,
        phoneNumber: '+1234567890'
      });
      
      await newAdmin.save();
      
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Email: admin@example.com');
      console.log('🔐 Password: Admin@123456');
      console.log('\n⚠️  Please change this password after first login!\n');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminUser();
