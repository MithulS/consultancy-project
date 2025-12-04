// Test Registration via API call
require('dotenv').config();
const axios = require('axios');

async function testApiRegistration() {
  console.log('\n' + '='.repeat(70));
  console.log('🔥 TESTING REGISTRATION VIA API');
  console.log('='.repeat(70));

  const API_URL = 'http://localhost:5000/api/auth/register';
  const testUser = {
    username: `testuser${Date.now()}`,
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@1234'
  };

  console.log('\n📤 Sending registration request...');
  console.log('Email:', testUser.email);
  console.log('Username:', testUser.username);

  try {
    const response = await axios.post(API_URL, testUser);
    
    console.log('\n✅ Registration successful!');
    console.log('Response:', response.data);
    console.log('\n⚠️  NOW CHECK THE BACKEND SERVER CONSOLE');
    console.log('   Look for a message like:');
    console.log('   ============================================================');
    console.log('   📧 OTP EMAIL (DEVELOPMENT MODE)');
    console.log('   OTP CODE: [6-digit code]');
    console.log('   ============================================================');
    console.log('\n   Copy that OTP code to verify the account!\n');

  } catch (error) {
    if (error.response) {
      console.error('\n❌ Registration failed!');
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.data.msg?.includes('Failed to send OTP email')) {
        console.log('\n⚠️  EMAIL SENDING FAILED BUT USER WAS DELETED');
        console.log('   This happens because email cannot be sent.');
        console.log('   However, in development mode, it should show OTP in console.');
      }
    } else if (error.request) {
      console.error('\n❌ Server not responding!');
      console.error('   Make sure backend server is running:');
      console.error('   cd backend && npm run dev');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }
}

testApiRegistration();
