// Verify admin credentials
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function verifyAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'mithuld321@gmail.com';
    const adminPassword = 'Admin@321';

    console.log('\n🔍 Verifying admin credentials...');
    console.log('━'.repeat(60));
    
    const admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!admin) {
      console.log('❌ Admin user not found in database');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ Admin user found in database');
    console.log('\n📋 Admin Account Details:');
    console.log('━'.repeat(60));
    console.log('🆔 User ID:', admin._id);
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('🔐 Is Admin:', admin.isAdmin ? '✅ YES' : '❌ NO');
    console.log('✅ Is Verified:', admin.isVerified ? '✅ YES' : '❌ NO');
    console.log('👥 Username:', admin.username || 'Not set');
    console.log('━'.repeat(60));

    // Verify password
    console.log('\n🔑 Testing password verification...');
    const isPasswordCorrect = await bcrypt.compare(adminPassword, admin.password);
    
    if (isPasswordCorrect) {
      console.log('✅ Password verification: SUCCESS');
    } else {
      console.log('❌ Password verification: FAILED');
    }

    console.log('\n━'.repeat(60));
    console.log('🎯 LOGIN REQUIREMENTS CHECK:');
    console.log('━'.repeat(60));
    
    const checks = [
      { name: 'Email exists', status: !!admin.email, value: admin.email },
      { name: 'Password correct', status: isPasswordCorrect, value: '***' },
      { name: 'Is Admin', status: admin.isAdmin, value: admin.isAdmin },
      { name: 'Is Verified', status: admin.isVerified, value: admin.isVerified },
      { name: 'Account not locked', status: !admin.otpLockedUntil || admin.otpLockedUntil < new Date(), value: 'OK' }
    ];

    let allPassed = true;
    checks.forEach(check => {
      const icon = check.status ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${check.value}`);
      if (!check.status) allPassed = false;
    });

    console.log('━'.repeat(60));
    
    if (allPassed) {
      console.log('\n🎉 ALL CHECKS PASSED! Admin can log in successfully.');
      console.log('\n🌐 Login Details:');
      console.log('━'.repeat(60));
      console.log('📧 Email: mithuld321@gmail.com');
      console.log('🔑 Password: Admin@321');
      console.log('🔗 Admin Panel URL: http://localhost:5173/#admin');
      console.log('🔗 API Endpoint: http://localhost:5000/api/auth/admin-login');
      console.log('━'.repeat(60));
    } else {
      console.log('\n⚠️  Some checks failed. Please review the issues above.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error verifying admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

verifyAdmin();
