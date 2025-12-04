/**
 * Quick Registration Test Script
 * 
 * This script tests the registration flow to verify OTP display.
 * Run this AFTER starting the server (npm run dev).
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testRegistration() {
  console.log('\n🧪 QUICK REGISTRATION TEST\n');
  console.log('=' .repeat(70));
  
  // Generate unique test data
  const timestamp = Date.now();
  const testUser = {
    username: `testuser${timestamp}`,
    name: 'Test User',
    email: `test${timestamp}@example.com`,
    password: 'Test@1234'
  };
  
  console.log('\n📝 Test User Data:');
  console.log(`   Username: ${testUser.username}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Password: ${testUser.password}`);
  console.log('\n' + '='.repeat(70));
  
  try {
    console.log('\n🚀 Sending registration request...');
    
    const response = await axios.post(`${API_URL}/register`, testUser, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('\n✅ REGISTRATION SUCCESS!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.data.msg}`);
    console.log(`   Email: ${response.data.email}`);
    
    console.log('\n' + '█'.repeat(70));
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█  🔍 CHECK THE SERVER TERMINAL NOW!                                █');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█  You should see a BOX with the OTP code inside.                  █');
    console.log('█  It will look like this:                                         █');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█    ████████████████████████████████████████                      █');
    console.log('█    █  📧 OTP EMAIL (DEVELOPMENT MODE)   █                        █');
    console.log('█    █  🔑 OTP CODE: 123456               █                        █');
    console.log('█    ████████████████████████████████████████                      █');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█'.repeat(70));
    
    console.log('\n✅ Test completed successfully!\n');
    
  } catch (error) {
    console.log('\n❌ REGISTRATION FAILED!');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Cannot connect to server!');
      console.log('   Make sure the backend server is running:');
      console.log('   cd D:\\consultancy\\backend');
      console.log('   npm run dev');
      console.log('\n   Then run this test again:\n   node scripts/quickTest.js\n');
    } else if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.msg || error.response.data}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n❌ Test failed!\n');
    process.exit(1);
  }
}

// Run the test
testRegistration();
