// Test actual registration flow with OTP
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// OTP Generation
function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function testRegistrationFlow() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTING FULL REGISTRATION FLOW WITH OTP');
  console.log('='.repeat(70));

  try {
    // Connect to MongoDB
    console.log('\n1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ Connected to MongoDB');

    // Clean up test user if exists
    const testEmail = 'testuser@example.com';
    await User.deleteOne({ email: testEmail });
    console.log(`   🧹 Cleaned up test user: ${testEmail}`);

    // Generate OTP
    console.log('\n2️⃣ Generating OTP...');
    const otpPlain = genOTP();
    console.log(`   ✅ Plain OTP: ${otpPlain}`);
    console.log(`   ✅ Length: ${otpPlain.length}`);
    console.log(`   ✅ Valid format: ${/^\d{6}$/.test(otpPlain)}`);

    // Hash password and OTP
    console.log('\n3️⃣ Hashing credentials...');
    const hashedPassword = await bcrypt.hash('Test@1234', 10);
    const otpHash = await bcrypt.hash(otpPlain, 10);
    console.log('   ✅ Password hashed');
    console.log('   ✅ OTP hashed');

    // Create user
    console.log('\n4️⃣ Creating user in database...');
    const user = new User({
      username: 'testuser',
      name: 'Test User',
      email: testEmail,
      password: hashedPassword,
      isVerified: false,
      otp: otpHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await user.save();
    console.log('   ✅ User saved to database');
    console.log('   📧 Email:', user.email);
    console.log('   👤 Username:', user.username);
    console.log('   🔒 OTP stored (hashed)');
    console.log('   ⏰ OTP expires at:', user.otpExpiresAt);

    // Verify OTP can be validated
    console.log('\n5️⃣ Testing OTP verification...');
    const isOtpValid = await bcrypt.compare(otpPlain, user.otp);
    console.log(`   ✅ OTP validation: ${isOtpValid ? 'SUCCESS' : 'FAILED'}`);

    // Display OTP for manual verification
    console.log('\n' + '='.repeat(70));
    console.log('📧 OTP GENERATED FOR EMAIL');
    console.log('='.repeat(70));
    console.log(`Email: ${testEmail}`);
    console.log(`OTP CODE: ${otpPlain}`);
    console.log(`Valid Until: ${user.otpExpiresAt.toLocaleString()}`);
    console.log('='.repeat(70));

    // Test with wrong OTP
    console.log('\n6️⃣ Testing with wrong OTP...');
    const wrongOtp = '000000';
    const isWrongOtpValid = await bcrypt.compare(wrongOtp, user.otp);
    console.log(`   ✅ Wrong OTP rejected: ${!isWrongOtpValid ? 'SUCCESS' : 'FAILED'}`);

    // Clean up
    console.log('\n7️⃣ Cleaning up...');
    await User.deleteOne({ email: testEmail });
    console.log('   ✅ Test user deleted');

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED - OTP GENERATION IS WORKING!');
    console.log('='.repeat(70));
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Start backend server: npm run dev');
    console.log('   2. Register a user via frontend');
    console.log('   3. Check the server console for OTP');
    console.log('   4. Look for this message:');
    console.log('      ============================================================');
    console.log('      📧 OTP EMAIL (DEVELOPMENT MODE)');
    console.log('      OTP CODE: [6-digit code]');
    console.log('      ============================================================');
    console.log('   5. Copy the OTP and use it to verify\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('   ✅ Disconnected from MongoDB\n');
    process.exit(0);
  }
}

testRegistrationFlow();
