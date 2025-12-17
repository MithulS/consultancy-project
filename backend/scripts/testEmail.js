/**
 * Quick Email Diagnostics Script
 * Run this to quickly test your email configuration
 * 
 * Usage: node scripts/testEmail.js
 */

require('dotenv').config();
const { OTPService } = require('../services/otpService');
const EmailDiagnostics = require('../utils/emailDiagnostics');

async function runDiagnostics() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 QUICK EMAIL DIAGNOSTICS');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Check environment variables
    console.log('1️⃣  Checking environment variables...');
    const requiredVars = ['EMAIL_USER', 'EMAIL_PASS'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.log('   ❌ Missing required variables:', missing.join(', '));
      console.log('   → Update your .env file\n');
      process.exit(1);
    } else {
      console.log('   ✅ All required variables set');
      console.log(`   → EMAIL_USER: ${process.env.EMAIL_USER}`);
      console.log(`   → EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'gmail (default)'}\n`);
    }

    // 2. Run full diagnostics
    console.log('2️⃣  Running comprehensive diagnostics...\n');
    const results = await EmailDiagnostics.runFullDiagnostics();

    // 3. Check overall status
    const allPassed = Object.values(results.checks)
      .filter(check => check && check.name)
      .every(check => check.status === 'passed' || check.status === 'skipped');

    if (allPassed) {
      console.log('✅ All diagnostics passed!\n');
    } else {
      console.log('⚠️  Some checks failed. Review recommendations above.\n');
    }

    // 4. Test OTP generation
    console.log('3️⃣  Testing OTP generation...');
    const testOTP = OTPService.generateOTP();
    console.log(`   ✅ Generated OTP: ${testOTP}`);
    console.log(`   → Length: ${testOTP.length} digits`);
    console.log(`   → Format: ${/^\d{6}$/.test(testOTP) ? 'Valid' : 'Invalid'}\n`);

    // 5. Offer to send test email
    if (results.checks.authentication?.status === 'passed') {
      console.log('4️⃣  Test Email');
      console.log('   → To send a test email, run:');
      console.log(`   → curl -X POST http://localhost:${process.env.PORT || 5000}/api/email/test \\`);
      console.log('         -H "Content-Type: application/json" \\');
      console.log(`         -d '{"email": "${process.env.EMAIL_USER}"}'`);
      console.log('');
    }

    // 6. Summary
    console.log('='.repeat(70));
    console.log('📋 SUMMARY');
    console.log('='.repeat(70));
    
    if (allPassed && results.checks.authentication?.status === 'passed') {
      console.log('✅ Email configuration is working correctly!');
      console.log('✅ You can now use the OTP system.');
      console.log('');
      console.log('Next steps:');
      console.log('1. Start your server: npm run dev');
      console.log('2. Test registration: POST /api/auth/register');
      console.log('3. Check console for OTP (development mode)');
      console.log('');
    } else {
      console.log('⚠️  Email configuration needs attention.');
      console.log('');
      console.log('Quick fixes:');
      
      if (results.checks.envVariables?.status === 'failed') {
        console.log('1. Update .env with valid EMAIL_USER and EMAIL_PASS');
      }
      if (results.checks.authentication?.status === 'failed') {
        console.log('2. For Gmail: Generate App Password at');
        console.log('   https://myaccount.google.com/apppasswords');
      }
      if (results.checks.smtpConnection?.status === 'failed') {
        console.log('3. Check firewall settings or try different port (587)');
        console.log('4. Consider using SendGrid or Mailgun (API-based)');
      }
      console.log('');
      console.log('📖 Full guide: backend/OTP_EMAIL_SETUP_GUIDE.md');
      console.log('');
    }

    console.log('='.repeat(70) + '\n');

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Error running diagnostics:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run diagnostics
runDiagnostics();
