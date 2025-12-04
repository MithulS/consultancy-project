// Enhanced OTP Email Handler with Fallback Options
require('dotenv').config();
const nodemailer = require('nodemailer');

// Alternative SMTP configurations to try
const emailConfigs = [
  {
    name: 'Gmail SMTP (Port 587 - TLS)',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  {
    name: 'Gmail SMTP (Port 465 - SSL)',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  {
    name: 'Gmail SMTP (Port 25 - Plain)',
    config: {
      host: 'smtp.gmail.com',
      port: 25,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  }
];

async function testEmailConfig(config) {
  return new Promise((resolve) => {
    const transporter = nodemailer.createTransport({
      ...config.config,
      connectionTimeout: 10000, // 10 second timeout
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    transporter.verify((err, success) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

async function findWorkingEmailConfig() {
  console.log('\n🔍 Testing Email Configurations...\n');
  
  for (const config of emailConfigs) {
    console.log(`Testing: ${config.name}...`);
    const result = await testEmailConfig(config);
    
    if (result.success) {
      console.log(`✅ ${config.name} - WORKING!\n`);
      return config;
    } else {
      console.log(`❌ ${config.name} - FAILED: ${result.error}\n`);
    }
  }
  
  return null;
}

// Run the test
(async () => {
  const workingConfig = await findWorkingEmailConfig();
  
  if (workingConfig) {
    console.log('✅ Found working configuration!');
    console.log('Update your auth.js with this configuration:\n');
    console.log(JSON.stringify(workingConfig.config, null, 2));
  } else {
    console.log('❌ No working email configuration found.');
    console.log('\n💡 WORKAROUND FOR DEVELOPMENT:');
    console.log('   Since email is blocked, the system is already configured to:');
    console.log('   1. Log OTP to console in development mode');
    console.log('   2. Continue without failing');
    console.log('   3. Check console output for OTP codes\n');
    console.log('📋 To fix email in production:');
    console.log('   1. Contact IT to unblock SMTP ports (587, 465, or 25)');
    console.log('   2. Verify Gmail App Password is correct');
    console.log('   3. Enable "Less secure app access" if needed');
    console.log('   4. Check firewall rules');
    console.log('   5. Try using a VPN or different network');
  }
  
  process.exit(0);
})();
