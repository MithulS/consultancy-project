// Quick Google OAuth Configuration Tester
// Run this to verify your credentials without waiting for login flow

const https = require('https');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

console.log('🔍 Google OAuth Configuration Checker\n');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('  Value:', CLIENT_ID ? CLIENT_ID.substring(0, 30) + '...' : 'N/A');
console.log('GOOGLE_CLIENT_SECRET:', CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('  Value:', CLIENT_SECRET ? CLIENT_SECRET.substring(0, 15) + '...' : 'N/A');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'Using default');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');

// Validate format
console.log('\n🔍 Format Validation:');
if (CLIENT_ID) {
  const validFormat = CLIENT_ID.endsWith('.apps.googleusercontent.com');
  console.log('Client ID format:', validFormat ? '✅ Valid' : '❌ Invalid');
  console.log('  Should end with: .apps.googleusercontent.com');
  console.log('  Actual ending:', CLIENT_ID.slice(-30));
}

if (CLIENT_SECRET) {
  const validFormat = CLIENT_SECRET.startsWith('GOCSPX-');
  console.log('Client Secret format:', validFormat ? '✅ Valid' : '❌ Invalid (should start with GOCSPX-)');
}

// Check if credentials work by making a test request
console.log('\n🌐 Testing Credentials with Google:');
console.log('Attempting to validate Client ID with Google...\n');

const testUrl = `https://oauth2.googleapis.com/token`;
const postData = JSON.stringify({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  code: 'test_code', // This will fail but tells us if credentials are recognized
  grant_type: 'authorization_code',
  redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = https.request(testUrl, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('Response Status:', res.statusCode);
      
      if (response.error === 'invalid_grant') {
        console.log('✅ SUCCESS! Credentials are VALID!');
        console.log('   (invalid_grant is expected - it means Google recognizes your credentials)');
      } else if (response.error === 'invalid_client') {
        console.log('❌ FAILED! Credentials are INVALID!');
        console.log('   Error: invalid_client');
        console.log('   This means:');
        console.log('   - Client ID or Secret is wrong');
        console.log('   - The OAuth client was deleted');
        console.log('   - Credentials don\'t match Google Cloud Console');
        console.log('\n   📝 ACTION REQUIRED:');
        console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
        console.log('   2. Click "Web client 1"');
        console.log('   3. Copy the FULL Client ID and Secret');
        console.log('   4. Update backend/.env file');
        console.log('   5. Restart the backend server');
      } else if (response.error === 'redirect_uri_mismatch') {
        console.log('⚠️  Redirect URI Mismatch!');
        console.log('   Your Client ID is valid, but redirect URI is wrong.');
        console.log('   Check: https://console.cloud.google.com/apis/credentials');
        console.log('   Add: http://localhost:5000/api/auth/google/callback');
      } else {
        console.log('Response:', response);
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('🔗 Useful Links:');
      console.log('   Google Cloud Console: https://console.cloud.google.com/apis/credentials');
      console.log('   OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent');
      console.log('   Fix Guide: D:\\consultancy\\GOOGLE_OAUTH_FIX_GUIDE.md');
      console.log('='.repeat(60));
      
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Network Error:', error.message);
  console.log('   Check your internet connection');
});

req.write(postData);
req.end();
