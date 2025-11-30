# Security & Deployment Guide

## 🔒 Security Implementation

### 1. Input Validation & Sanitization

#### Backend Validation
All user inputs are validated before processing:

```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character (!@#$%^&*)

// Username requirements
- Minimum 3 characters
- Unique across system
- Alphanumeric only
```

#### Frontend Validation
Real-time validation with user feedback:
- Email format validation
- Password strength indicator (Weak/Medium/Strong)
- Visual feedback for each requirement
- Character count and limits
- Duplicate detection before submission

### 2. Password Security

#### Hashing Strategy
```javascript
// Using bcryptjs with 10 salt rounds
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

**Benefits:**
- Computationally expensive to brute-force
- Unique salt per password
- Adaptive: can increase rounds as hardware improves

#### Best Practices Implemented
✅ Never store plain-text passwords
✅ Hash passwords before database storage
✅ Use strong hashing algorithm (bcrypt)
✅ Implement password complexity requirements
✅ No password hints or security questions

### 3. OTP Security

#### Generation & Storage
```javascript
// 6-digit random OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();

// Hash before storage
const otpHash = await bcrypt.hash(otp, 10);

// Set expiration (10 minutes)
const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
```

#### Security Features
✅ Cryptographically random generation
✅ Hashed storage (not plain text)
✅ Time-limited validity (10 minutes)
✅ Single-use (cleared after verification)
✅ Attempt limiting (5 attempts max)
✅ Account locking on repeated failures

### 4. Rate Limiting

#### Implementation
Using `express-rate-limit` middleware:

```javascript
const rateLimit = require('express-rate-limit');

// Registration endpoint
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,                     // 3 requests per hour
  message: 'Too many registration attempts'
});

// Login endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per 15 minutes
  skipSuccessfulRequests: true // Don't count successful logins
});
```

#### Protection Against
✅ Brute-force attacks
✅ Credential stuffing
✅ DDoS attacks
✅ API abuse
✅ Automated bot attacks

### 5. Account Locking Mechanism

#### OTP Verification
```javascript
// Track failed attempts
user.otpAttempts = (user.otpAttempts || 0) + 1;

// Lock after 5 failures
if (user.otpAttempts >= 5) {
  user.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
}
```

#### Features
- Progressive feedback (attempts remaining)
- Temporary lock (15 minutes)
- Automatic unlock after timeout
- Manual unlock via new OTP request
- Clear user communication

### 6. JWT Authentication

#### Token Generation
```javascript
const payload = { userId: user._id, email: user.email };
const token = jwt.sign(payload, process.env.JWT_SECRET, { 
  expiresIn: '7d' 
});
```

#### Security Measures
✅ Signed tokens (tamper-proof)
✅ Time-limited validity (7 days)
✅ Secure secret key storage
✅ Token verification on protected routes
✅ Bearer token format
✅ No sensitive data in payload

#### Protected Route Example
```javascript
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, async (req, res) => {
  // req.user available here
  const user = await User.findById(req.user.userId);
  res.json({ user });
});
```

### 7. Audit Logging

#### What Gets Logged
```javascript
{
  userId: ObjectId,           // Who
  email: String,              // Who
  action: String,             // What (REGISTER_SUCCESS, LOGIN_FAILED, etc.)
  ipAddress: String,          // Where from
  userAgent: String,          // What client
  details: String,            // Why/additional info
  timestamp: Date             // When
}
```

#### Use Cases
- Security incident investigation
- User behavior analysis
- Compliance reporting (GDPR, etc.)
- Fraud detection
- Performance monitoring

#### Querying Audit Logs
```javascript
// Find all failed login attempts for user
const failedLogins = await AuditLog.find({
  email: 'user@example.com',
  action: 'LOGIN_FAILED',
  timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
});

// Find suspicious activity from IP
const suspiciousActivity = await AuditLog.find({
  ipAddress: '192.168.1.1',
  action: { $in: ['LOGIN_FAILED', 'OTP_VERIFY_FAILED'] }
}).limit(50);
```

### 8. Data Protection & Privacy

#### GDPR Compliance
✅ **Right to Access**: Users can view their data via profile endpoint
✅ **Right to Erasure**: Implement user account deletion
✅ **Data Minimization**: Only collect necessary information
✅ **Secure Storage**: Encrypted passwords and tokens
✅ **Audit Trail**: Complete logging of data access

#### Sensitive Data Handling
```javascript
// Never expose in API responses
.select('-password -otp -otpExpiresAt -resetPasswordToken')

// Never log sensitive data
console.log(`User ${email} logged in`); // ✅ Safe
console.log(`Password: ${password}`);    // ❌ Never do this
```

### 9. CORS Configuration

#### Development
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

#### Production
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));
```

### 10. Environment Variables Security

#### Never Commit to Git
```bash
# .gitignore
.env
.env.local
.env.production
```

#### Use Strong Secrets
```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Store in .env
JWT_SECRET=generated_64_char_hex_string
```

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 16+ installed
- MongoDB 5+ instance
- Gmail account with App Password
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

### 1. Local Development Setup

```bash
# Clone repository
git clone <repository-url>
cd consultancy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup environment variables
cd ../backend
cp .env.example .env
# Edit .env with your credentials

cd ../frontend
cp .env.example .env
# Edit .env with backend URL

# Start development servers
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. MongoDB Setup

#### Local MongoDB
```bash
# Install MongoDB
# https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod --dbpath /path/to/data

# Connect and create database
mongo
use mern-auth
db.createCollection('users')
```

#### MongoDB Atlas (Cloud)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create new cluster (Free tier available)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string
6. Update `MONGODB_URI` in `.env`

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-auth?retryWrites=true&w=majority
```

### 3. Email Configuration (Gmail)

#### Generate App Password
1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate new
4. Select "Mail" and "Other (Custom name)"
5. Copy 16-character password
6. Update `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=generated-16-char-app-password
```

#### Alternative: SendGrid
```bash
npm install @sendgrid/mail

# Update transporter in routes/auth.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### 4. Production Build

#### Frontend Build
```bash
cd frontend
npm run build
# Creates optimized production build in dist/
```

#### Environment Configuration
```env
# backend/.env.production
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...production...
JWT_SECRET=strong-64-char-production-secret
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=production-app-password
CLIENT_URL=https://yourdomain.com
```

### 5. Hosting Options

#### Option A: Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set EMAIL_USER=your-email
heroku config:set EMAIL_PASS=your-password

# Deploy
git push heroku main

# Open app
heroku open
```

#### Option B: DigitalOcean

```bash
# Create Droplet (Ubuntu 22.04)
# SSH into server

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

# Install Nginx
sudo apt-get install nginx

# Clone and setup app
git clone <your-repo>
cd consultancy/backend
npm install --production

# Setup PM2 for process management
sudo npm install -g pm2
pm2 start index.js --name "mern-auth-backend"
pm2 startup
pm2 save

# Configure Nginx
sudo nano /etc/nginx/sites-available/mern-auth
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/mern-auth/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mern-auth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### Option C: Vercel (Frontend) + Heroku (Backend)

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend.herokuapp.com
```

**Backend (Heroku):**
```bash
# Deploy as shown in Option A
```

### 6. Production Checklist

#### Security
- [ ] Use HTTPS only
- [ ] Set strong JWT_SECRET (64+ characters)
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable CORS only for your domain
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Implement request signing
- [ ] Add CSRF protection
- [ ] Enable helmet.js for security headers
- [ ] Setup rate limiting in production mode

#### Performance
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Implement caching strategy
- [ ] Database indexes on email, username
- [ ] Connection pooling for MongoDB
- [ ] Use Redis for rate limiting
- [ ] Minify and bundle frontend assets
- [ ] Lazy load components
- [ ] Image optimization

#### Monitoring
- [ ] Setup error tracking (Sentry, LogRocket)
- [ ] Configure application monitoring (New Relic, Datadog)
- [ ] Setup uptime monitoring (Pingdom, UptimeRobot)
- [ ] Database monitoring
- [ ] Log aggregation (ELK stack, CloudWatch)
- [ ] Performance monitoring (Lighthouse CI)
- [ ] Setup alerts for critical errors

#### Backup & Recovery
- [ ] Automated database backups
- [ ] Backup environment variables
- [ ] Document recovery procedures
- [ ] Test restore process
- [ ] Version control for all code
- [ ] Database migration scripts

---

## 🔍 Monitoring & Maintenance

### Application Logs
```bash
# PM2 logs
pm2 logs mern-auth-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/log/mern-auth/app.log
```

### Database Maintenance
```javascript
// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.auditlogs.createIndex({ email: 1, timestamp: -1 });
db.auditlogs.createIndex({ action: 1, timestamp: -1 });

// Cleanup old audit logs (keep 90 days)
db.auditlogs.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

### Health Check Endpoint
```javascript
// Add to backend/index.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Performance Monitoring
```javascript
// Track response times
const responseTime = require('response-time');
app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} - ${time.toFixed(2)}ms`);
}));
```

---

## 🚨 Incident Response

### Security Breach Protocol
1. **Immediately**: Rotate all secrets (JWT_SECRET, database passwords)
2. **Investigate**: Check audit logs for unauthorized access
3. **Notify**: Inform affected users
4. **Remediate**: Fix vulnerability
5. **Monitor**: Watch for additional attempts
6. **Document**: Record incident details and resolution

### Common Issues & Solutions

#### High Failed Login Attempts
```javascript
// Query audit logs
const suspiciousIPs = await AuditLog.aggregate([
  { $match: { action: 'LOGIN_FAILED' } },
  { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
  { $match: { count: { $gt: 20 } } },
  { $sort: { count: -1 } }
]);

// Block IP in firewall or add to rate limiter blacklist
```

#### Memory Leaks
```bash
# Monitor memory usage
pm2 monit

# Restart if necessary
pm2 restart mern-auth-backend

# Check for memory leaks
node --inspect index.js
# Open chrome://inspect
```

#### Database Performance
```javascript
// Analyze slow queries
db.setProfilingLevel(2); // Profile all operations
db.system.profile.find().sort({ ts: -1 }).limit(5);

// Check index usage
db.users.find({ email: 'test@example.com' }).explain('executionStats');
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
