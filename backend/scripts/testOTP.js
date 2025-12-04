// OTP Troubleshooting Script
require('dotenv').config();
const nodemailer = require('nodemailer');

// Test OTP Generation
function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

console.log('\n' + '='.repeat(60));
console.log('🔍 OTP GENERATION & EMAIL TROUBLESHOOTING');
console.log('='.repeat(60));

// Test 1: OTP Generation
console.log('\n✅ TEST 1: OTP Generation');
const testOTPs = [];
for (let i = 0; i < 10; i++) {
  const otp = genOTP();
  testOTPs.push(otp);
  console.log(`  OTP ${i + 1}: ${otp}`);
  
  // Validate OTP format
  if (!/^\d{6}$/.test(otp)) {
    console.error(`  ❌ Invalid OTP format: ${otp}`);
  }
}

// Check uniqueness
const uniqueOTPs = new Set(testOTPs);
console.log(`  Generated: ${testOTPs.length}, Unique: ${uniqueOTPs.size}`);
if (uniqueOTPs.size === testOTPs.length) {
  console.log('  ✅ All OTPs are unique');
} else {
  console.log('  ⚠️  Some OTPs are duplicates');
}

// Test 2: Email Configuration
console.log('\n✅ TEST 2: Email Configuration');
console.log(`  EMAIL_USER: ${process.env.EMAIL_USER || '❌ NOT SET'}`);
console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : '❌ NOT SET'}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development (default)'}`);

// Test 3: Email Transporter
console.log('\n✅ TEST 3: Email Transporter Setup');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: false,
  debug: false,
  tls: {
    rejectUnauthorized: false
  }
});

console.log('  Transporter created');

// Test 4: Connection Test
console.log('\n✅ TEST 4: SMTP Connection Test');
console.log('  Testing connection to smtp.gmail.com:587...');

transporter.verify((err, success) => {
  if (err) {
    console.error('  ❌ Connection FAILED:', err.message);
    console.error('\n📋 Common Issues:');
    console.error('  1. Check if Gmail "App Password" is correct');
    console.error('  2. Ensure 2-Factor Authentication is enabled on Gmail');
    console.error('  3. Verify firewall/network allows SMTP on port 587');
    console.error('  4. Check if Gmail account is not locked/suspended');
    console.error('  5. Try accessing https://accounts.google.com/DisplayUnlockCaptcha');
  } else {
    console.log('  ✅ Connection SUCCESSFUL');
    
    // Test 5: Send Test Email
    console.log('\n✅ TEST 5: Sending Test Email');
    const testOTP = genOTP();
    const mailOptions = {
      from: `"Test OTP System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'OTP Test - DO NOT SHARE',
      html: `
        <h2>OTP Troubleshooting Test</h2>
        <p>This is a test email to verify OTP sending functionality.</p>
        <p>Your test OTP is: <strong style="font-size: 24px; color: #5b21b6;">${testOTP}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <hr>
        <small>This is an automated test email. If you received this, OTP system is working correctly.</small>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('  ❌ Email sending FAILED:', error.message);
      } else {
        console.log('  ✅ Email sent SUCCESSFULLY');
        console.log('  Message ID:', info.messageId);
        console.log('  Response:', info.response);
        console.log(`\n  📧 Check inbox of ${process.env.EMAIL_USER} for test OTP: ${testOTP}`);
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('🏁 TROUBLESHOOTING COMPLETE');
      console.log('='.repeat(60) + '\n');
      
      process.exit(error ? 1 : 0);
    });
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\n⏱️  TEST TIMEOUT: Email test took too long (>30s)');
  console.error('  This usually indicates network connectivity issues.');
  process.exit(1);
}, 30000);
