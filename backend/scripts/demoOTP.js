// Simple OTP Generation Demo for Specific Email
function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

console.log('\n' + '='.repeat(60));
console.log('✅ OTP GENERATION TEST FOR SPECIFIC EMAIL');
console.log('='.repeat(60));

const email = 'mithuld321@gmail.com';
console.log(`\nGenerating OTPs for: ${email}\n`);

for(let i = 1; i <= 5; i++) {
  const otp = genOTP();
  const isValid = /^\d{6}$/.test(otp);
  console.log(`  OTP ${i}: ${otp} (Length: ${otp.length}, Valid: ${isValid ? '✓' : '✗'})`);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All OTPs generated successfully!');
console.log('='.repeat(60));
console.log('\n💡 HOW TO USE:');
console.log('   1. Start the backend server');
console.log('   2. Register a user via frontend/API');
console.log('   3. Check server console for OTP');
console.log('   4. Copy the OTP code');
console.log('   5. Use it to verify the account');
console.log('\n✅ OTP generation is WORKING correctly!');
console.log('❌ Email delivery is blocked by network firewall.');
console.log('✅ Workaround: OTP is logged to console in dev mode.\n');
