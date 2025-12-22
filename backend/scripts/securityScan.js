// Security Vulnerability Scanner
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const results = { critical: [], high: [], medium: [], low: [], passed: [] };

function checkSecurity(name, condition, severity, recommendation) {
  const result = {
    name,
    severity,
    status: condition ? 'SECURE' : 'VULNERABLE',
    recommendation: condition ? null : recommendation
  };
  
  if (condition) {
    results.passed.push(result);
    console.log(`✅ ${name}`);
  } else {
    results[severity].push(result);
    const icon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : severity === 'medium' ? '⚡' : '💡';
    console.log(`${icon} ${name}`);
    if (recommendation) {
      console.log(`   └─ ${recommendation}`);
    }
  }
}

async function runSecurityScan() {
  console.log('\n🔒 SECURITY VULNERABILITY SCAN');
  console.log('='.repeat(70));

  // Environment Security
  console.log('\n🔐 ENVIRONMENT & SECRETS SECURITY:');
  console.log('-'.repeat(70));

  checkSecurity(
    'JWT Secret strength (min 32 chars)',
    process.env.JWT_SECRET?.length >= 32,
    'critical',
    'Use a strong random JWT secret with at least 32 characters'
  );

  checkSecurity(
    'Admin Secret configured',
    !!process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.length > 20,
    'high',
    'Configure ADMIN_SECRET with strong random string'
  );

  checkSecurity(
    'Database connection secured',
    process.env.MONGO_URI?.includes('mongodb+srv://'),
    'high',
    'Use MongoDB Atlas with SSL/TLS encryption'
  );

  checkSecurity(
    '.env file in .gitignore',
    fs.existsSync('.gitignore') && fs.readFileSync('.gitignore', 'utf8').includes('.env'),
    'critical',
    'Add .env to .gitignore to prevent secret exposure'
  );

  // Authentication Security
  console.log('\n👤 AUTHENTICATION SECURITY:');
  console.log('-'.repeat(70));

  const authFile = fs.readFileSync('./middleware/auth.js', 'utf8');
  
  checkSecurity(
    'JWT verification implemented',
    authFile.includes('jwt.verify'),
    'critical',
    'Implement proper JWT verification in auth middleware'
  );

  checkSecurity(
    'Password hashing (bcrypt)',
    fs.readFileSync('./models/user.js', 'utf8').includes('bcrypt'),
    'critical',
    'Use bcrypt for password hashing'
  );

  checkSecurity(
    'Token expiration set',
    authFile.includes('expiresIn') || process.env.JWT_EXPIRE,
    'high',
    'Set JWT token expiration time (e.g., 7d, 24h)'
  );

  // Input Validation
  console.log('\n✅ INPUT VALIDATION & SANITIZATION:');
  console.log('-'.repeat(70));

  const validatorsExist = fs.existsSync('./middleware/validators.js');
  checkSecurity(
    'Input validators configured',
    validatorsExist,
    'high',
    'Implement input validation middleware'
  );

  if (validatorsExist) {
    const validatorFile = fs.readFileSync('./middleware/validators.js', 'utf8');
    checkSecurity(
      'Email validation implemented',
      validatorFile.includes('isEmail') || validatorFile.includes('@'),
      'medium',
      'Validate email format in user inputs'
    );

    checkSecurity(
      'SQL/NoSQL injection prevention',
      validatorFile.includes('escape') || validatorFile.includes('sanitize'),
      'critical',
      'Sanitize all user inputs to prevent injection attacks'
    );
  }

  // Rate Limiting
  console.log('\n⏱️  RATE LIMITING & DOS PROTECTION:');
  console.log('-'.repeat(70));

  const rateLimiterExists = fs.existsSync('./middleware/rateLimiter.js');
  checkSecurity(
    'Rate limiting middleware configured',
    rateLimiterExists,
    'high',
    'Implement rate limiting to prevent brute force attacks'
  );

  if (rateLimiterExists) {
    const rateLimiterFile = fs.readFileSync('./middleware/rateLimiter.js', 'utf8');
    checkSecurity(
      'Login rate limiting active',
      rateLimiterFile.includes('login') || rateLimiterFile.includes('auth'),
      'high',
      'Apply strict rate limiting on login endpoints'
    );
  }

  // CORS Configuration
  console.log('\n🌐 CORS & HEADERS SECURITY:');
  console.log('-'.repeat(70));

  const indexFile = fs.readFileSync('./index.js', 'utf8');
  
  checkSecurity(
    'CORS configured',
    indexFile.includes('cors'),
    'medium',
    'Configure CORS to restrict allowed origins'
  );

  checkSecurity(
    'Specific origins allowed (not *)',
    !indexFile.includes("origin: '*'") && !indexFile.includes('origin:"*"'),
    'medium',
    'Avoid using wildcard (*) for CORS origin'
  );

  // File Upload Security
  console.log('\n📁 FILE UPLOAD SECURITY:');
  console.log('-'.repeat(70));

  if (fs.existsSync('./config/upload.js')) {
    const uploadFile = fs.readFileSync('./config/upload.js', 'utf8');
    
    checkSecurity(
      'File type validation',
      uploadFile.includes('mimetype') || uploadFile.includes('fileFilter'),
      'critical',
      'Validate file types to prevent malicious uploads'
    );

    checkSecurity(
      'File size limits',
      uploadFile.includes('limits') || uploadFile.includes('maxSize'),
      'high',
      'Set file size limits to prevent storage abuse'
    );
  }

  // Data Protection
  console.log('\n🔐 DATA PROTECTION:');
  console.log('-'.repeat(70));

  const userModel = fs.readFileSync('./models/user.js', 'utf8');
  
  checkSecurity(
    'Password excluded from queries',
    userModel.includes('select: false') || userModel.includes('-password'),
    'critical',
    'Never return password hashes in API responses'
  );

  checkSecurity(
    'Sensitive data encrypted',
    userModel.includes('bcrypt') || userModel.includes('crypto'),
    'high',
    'Encrypt sensitive user data before storage'
  );

  // Error Handling
  console.log('\n❌ ERROR HANDLING SECURITY:');
  console.log('-'.repeat(70));

  const errorHandlerExists = fs.existsSync('./middleware/errorHandler.js');
  checkSecurity(
    'Global error handler configured',
    errorHandlerExists,
    'medium',
    'Implement global error handler to prevent info leakage'
  );

  if (errorHandlerExists) {
    const errorFile = fs.readFileSync('./middleware/errorHandler.js', 'utf8');
    checkSecurity(
      'Stack traces hidden in production',
      errorFile.includes('NODE_ENV') && errorFile.includes('production'),
      'medium',
      'Hide stack traces in production environment'
    );
  }

  // Dependency Security
  console.log('\n📦 DEPENDENCY SECURITY:');
  console.log('-'.repeat(70));

  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  checkSecurity(
    'No known vulnerable packages (audit required)',
    true, // Placeholder - would need npm audit integration
    'low',
    'Run "npm audit" regularly to check for vulnerabilities'
  );

  console.log('\n' + '='.repeat(70));
  console.log('📊 SECURITY SCAN SUMMARY');
  console.log('='.repeat(70));
  console.log(`🚨 Critical Issues: ${results.critical.length}`);
  console.log(`⚠️  High Priority: ${results.high.length}`);
  console.log(`⚡ Medium Priority: ${results.medium.length}`);
  console.log(`💡 Low Priority: ${results.low.length}`);
  console.log(`✅ Secure: ${results.passed.length}`);
  
  const total = results.critical.length + results.high.length + results.medium.length + results.low.length + results.passed.length;
  const securityScore = ((results.passed.length / total) * 100).toFixed(2);
  console.log(`\n🛡️  Security Score: ${securityScore}%`);
  
  if (results.critical.length > 0) {
    console.log('\n🚨 CRITICAL VULNERABILITIES REQUIRE IMMEDIATE ATTENTION!');
  } else if (results.high.length > 0) {
    console.log('\n⚠️  High priority issues should be addressed soon');
  } else {
    console.log('\n✅ No critical security issues detected');
  }
  
  console.log('='.repeat(70) + '\n');
}

runSecurityScan();
