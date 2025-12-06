// Script to set up admin user with phone number
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

async function setupAdminWithPhone() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => readline.question(query, resolve));

    console.log('📋 Admin User Setup');
    console.log('━'.repeat(60));
    
    const email = await question('Enter admin email: ');
    const phoneNumber = await question('Enter admin phone number (e.g., +91-9876543210): ');
    
    // Check if user exists
    let admin = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (admin) {
      console.log('\n✅ Admin user found:', admin.email);
      
      // Update phone number and admin flag
      admin.phoneNumber = phoneNumber.trim();
      admin.isAdmin = true;
      await admin.save();
      
      console.log('✅ Updated admin user with phone number');
    } else {
      console.log('\n⚠️  User not found. Creating new admin user...\n');
      
      const name = await question('Enter admin name: ');
      const password = await question('Enter admin password: ');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      admin = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phoneNumber: phoneNumber.trim(),
        isAdmin: true,
        isVerified: true
      });
      
      await admin.save();
      console.log('✅ Created new admin user');
    }

    console.log('\n' + '━'.repeat(60));
    console.log('✅ Admin Setup Complete!');
    console.log('━'.repeat(60));
    console.log('📋 Admin Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phoneNumber}`);
    console.log(`   Admin: ${admin.isAdmin}`);
    console.log(`   Verified: ${admin.isVerified}`);
    console.log('━'.repeat(60));

    readline.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdminWithPhone();
