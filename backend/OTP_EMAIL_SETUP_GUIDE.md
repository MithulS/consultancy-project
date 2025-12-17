# 📧 OTP Email System - Complete Setup & Troubleshooting Guide

## 🎯 Overview

This guide provides comprehensive instructions for setting up, configuring, and troubleshooting the OTP (One-Time Password) email verification system.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Email Provider Setup](#email-provider-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing & Diagnostics](#testing--diagnostics)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)
6. [Security Best Practices](#security-best-practices)
7. [API Documentation](#api-documentation)
8. [Monitoring & Logging](#monitoring--logging)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create/update `.env` file:
```env
# Email Configuration
EMAIL_PROVIDER=gmail                    # Options: gmail, sendgrid, mailgun, custom
EMAIL_USER=your-email@gmail.com        # Your email address
EMAIL_PASS=your-app-password           # App password (NOT regular password)
EMAIL_FROM_NAME=Your App Name          # Sender name

# Optional: Custom SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# Other Required Variables
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/your_db
JWT_SECRET=your-secret-key
PORT=5000
```

### 3. Run Diagnostics
```bash
# Start server
npm run dev

# Run diagnostics (in another terminal)
curl -X POST http://localhost:5000/api/email/diagnostics
```

---

## 📧 Email Provider Setup

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. Visit [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Enter name: "OTP Email Service"
4. Click **Generate**
5. Copy the 16-character password (remove spaces)

#### Step 3: Update .env
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop    # 16-character app password
```

**⚠️ Common Gmail Issues:**
- ❌ Using regular password instead of App Password → Won't work
- ❌ 2FA not enabled → Cannot create App Password
- ❌ "Less secure apps" setting → Deprecated, use App Password instead

---

### Option 2: SendGrid (Recommended for Production)

#### Step 1: Sign Up
1. Create account at [SendGrid](https://sendgrid.com/)
2. Verify your email address
3. Complete sender verification

#### Step 2: Generate API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: "OTP Service"
4. Permissions: **Full Access** or **Mail Send**
5. Copy the API key (shown only once)

#### Step 3: Update .env
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
EMAIL_USER=noreply@yourdomain.com  # Your verified sender
```

**Benefits:**
- ✅ 100 emails/day free tier
- ✅ Better deliverability
- ✅ Detailed analytics
- ✅ No firewall issues

---

### Option 3: Mailgun

#### Setup Steps:
1. Create account at [Mailgun](https://www.mailgun.com/)
2. Verify domain (or use sandbox domain for testing)
3. Get SMTP credentials from **Sending** → **Domain Settings**

#### Update .env:
```env
EMAIL_PROVIDER=mailgun
MAILGUN_SMTP_HOST=smtp.mailgun.org
MAILGUN_SMTP_USER=postmaster@yourdomain.mailgun.org
MAILGUN_SMTP_PASS=your-smtp-password
EMAIL_USER=noreply@yourdomain.com
```

---

### Option 4: Custom SMTP

For any other email provider:

```env
EMAIL_PROVIDER=custom
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587                      # or 465 for SSL
SMTP_SECURE=false                  # true for port 465
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_USER=noreply@yourdomain.com
```

---

## 🔧 Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_PROVIDER` | Email service provider | `gmail`, `sendgrid`, `mailgun`, `custom` |
| `EMAIL_USER` | Sender email address | `noreply@example.com` |
| `EMAIL_PASS` | Password or API key | App Password or API key |
| `NODE_ENV` | Environment | `development` or `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_FROM_NAME` | Sender display name | `"No-Reply"` |
| `SMTP_HOST` | SMTP server hostname | Based on provider |
| `SMTP_PORT` | SMTP port | `465` (Gmail), `587` (others) |
| `SMTP_SECURE` | Use SSL/TLS | `true` for port 465 |
| `VERIFY_EMAIL_ON_STARTUP` | Verify transporter on startup | `true` |

---

## 🧪 Testing & Diagnostics

### 1. Health Check
```bash
curl http://localhost:5000/api/email/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "configured": true,
  "checks": {
    "environment": "passed",
    "authentication": "passed"
  },
  "service": {
    "configured": true,
    "isVerified": true
  }
}
```

### 2. Full Diagnostics
```bash
curl -X POST http://localhost:5000/api/email/diagnostics
```

**Checks Performed:**
- ✅ Environment variables validation
- ✅ SMTP connection test
- ✅ DNS resolution check
- ✅ Authentication verification
- ✅ Configuration recommendations

### 3. Send Test Email
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### 4. Test Registration Flow
```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'

# 2. Check server console for OTP (development mode)

# 3. Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

---

## 🔍 Troubleshooting Common Issues

### Issue 1: "EAUTH - Authentication failed"

**Cause:** Invalid credentials

**Solutions:**
1. **For Gmail:** Use App Password, NOT regular password
   - Go to https://myaccount.google.com/apppasswords
   - Generate new App Password
   - Enable 2-Factor Authentication first

2. **For Other Providers:**
   - Verify username/password are correct
   - Check if account is active
   - Some providers require API keys instead of passwords

**Test:**
```bash
curl -X POST http://localhost:5000/api/email/verify-transporter
```

---

### Issue 2: "ETIMEDOUT - Connection timeout"

**Cause:** Cannot connect to SMTP server (firewall/network issue)

**Solutions:**
1. **Check Firewall:**
   ```powershell
   # Windows: Test SMTP port
   Test-NetConnection -ComputerName smtp.gmail.com -Port 465
   Test-NetConnection -ComputerName smtp.gmail.com -Port 587
   ```

2. **Try Different Port:**
   - Gmail: Try port 587 instead of 465
   - Update `.env`: `SMTP_PORT=587` and `SMTP_SECURE=false`

3. **Use Mobile Hotspot:**
   - Corporate/public WiFi often blocks SMTP ports
   - Try connecting via mobile hotspot

4. **Switch to API-Based Service:**
   - Use SendGrid or Mailgun (no firewall issues)
   - API-based, not SMTP-based

---

### Issue 3: "OTP not received in inbox"

**Possible Causes & Solutions:**

1. **Check Spam/Junk Folder**
   - OTP emails often land in spam initially
   - Mark as "Not Spam" to train filter

2. **Email Delivery Delay**
   - Can take 1-5 minutes depending on provider
   - Check server logs for "Email sent successfully"

3. **Development Mode:**
   - In development, OTP is logged to console
   - Check terminal output for OTP box

4. **Provider Rate Limits:**
   - Gmail: 500 emails/day for free accounts
   - SendGrid: 100 emails/day on free tier
   - Check provider dashboard for quota

5. **Sender Reputation:**
   - New email accounts may have low reputation
   - Warm up sender by starting with few emails
   - Verify domain for better deliverability

**Debug:**
```bash
# Check if email was actually sent
curl http://localhost:5000/api/email/health

# View server logs
# Look for: "✅ OTP email sent to..."
```

---

### Issue 4: "Email configuration not working"

**Step-by-Step Debug:**

1. **Run Full Diagnostics:**
   ```bash
   curl -X POST http://localhost:5000/api/email/diagnostics
   ```

2. **Check Environment Variables:**
   ```bash
   curl http://localhost:5000/api/email/config
   ```

3. **Verify .env File:**
   - Ensure no extra spaces in values
   - No quotes around values (unless they contain spaces)
   - File is named exactly `.env` (not `.env.txt`)

4. **Restart Server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

5. **Check Logs:**
   - Look for "✅ Mail transporter ready" on startup
   - Or "⚠️ Mail transporter error"

---

### Issue 5: "Rate limit exceeded"

**Cause:** Too many requests from same IP

**Rate Limits:**
- Registration: 3 per hour per IP
- OTP Verification: 10 per 15 minutes
- OTP Resend: 3 per 5 minutes
- Login: 5 per 15 minutes

**Solutions:**
1. Wait for cooldown period
2. For testing, modify `backend/middleware/rateLimiter.js`
3. Use different IP address or clear browser cookies

---

## 🔒 Security Best Practices

### 1. OTP Security

✅ **Implemented Features:**
- 6-digit random OTP
- 10-minute expiration
- Hashed storage (bcrypt)
- Rate limiting (10 attempts per 15 min)
- Account lockout after 5 failed attempts (15 min)
- Secure email templates

### 2. Email Security

✅ **Best Practices:**
- Use App Passwords, never store regular passwords
- Use environment variables, never hardcode credentials
- Enable 2FA on email accounts
- Use dedicated email for transactional emails
- Monitor for suspicious activity

### 3. Production Checklist

Before deploying to production:

- [ ] Use production email service (SendGrid/Mailgun)
- [ ] Verify sender domain for better deliverability
- [ ] Enable SSL/TLS for SMTP connections
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable audit logging
- [ ] Set up email monitoring/alerts
- [ ] Configure rate limits appropriately
- [ ] Test email deliverability
- [ ] Set up SPF, DKIM, DMARC records

### 4. Prevent Abuse

✅ **Implemented Protections:**
- Rate limiting on all endpoints
- Account lockout mechanism
- OTP expiration
- Email validation
- Audit logging
- Request ID tracking

---

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register new user and send OTP.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "username": "johndoe"  // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "msg": "Registration successful. Please check your email for OTP.",
  "email": "john@example.com",
  "otpExpiresIn": 600
}
```

**Response (Error):**
```json
{
  "success": false,
  "msg": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

---

#### POST /api/auth/verify-otp
Verify OTP and activate account.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "msg": "Email verified successfully. You can now login.",
  "verified": true
}
```

**Response (Invalid OTP):**
```json
{
  "success": false,
  "msg": "Invalid OTP. 4 attempt(s) remaining.",
  "attemptsRemaining": 4
}
```

**Response (Account Locked):**
```json
{
  "success": false,
  "msg": "Account locked due to too many failed attempts. Try again in 15 minute(s).",
  "locked": true,
  "minutesRemaining": 15
}
```

---

#### POST /api/auth/resend-otp
Resend OTP to user's email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "OTP resent to your email",
  "otpExpiresIn": 600
}
```

---

#### POST /api/auth/login
Login with verified credentials.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60a7c3e7f4b5c8001f9e5a3d",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false
  }
}
```

**Response (Not Verified):**
```json
{
  "msg": "Please verify your email before logging in",
  "code": "EMAIL_NOT_VERIFIED",
  "email": "john@example.com"
}
```

---

### Monitoring Endpoints

#### GET /api/email/health
Quick health check for email service.

**Response:**
```json
{
  "status": "healthy",
  "configured": true,
  "checks": {
    "environment": "passed",
    "authentication": "passed"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### POST /api/email/diagnostics
Run full email diagnostics (admin/dev only).

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "checks": {
    "envVariables": { "status": "passed", "details": {...} },
    "smtpConnection": { "status": "passed", "details": {...} },
    "dnsResolution": { "status": "passed", "details": {...} },
    "authentication": { "status": "passed", "details": {...} }
  },
  "recommendations": [...]
}
```

---

#### POST /api/email/test
Send test email (dev only).

**Request:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "details": {
    "recipient": "test@example.com",
    "messageId": "<abc123@gmail.com>"
  }
}
```

---

## 📊 Monitoring & Logging

### Server Logs

**Development Mode:**
```
✅ Mail transporter verified successfully
✅ User created: test@example.com (ID: 60a7c3e7f4b5c8001f9e5a3d)
✅ OTP email sent to test@example.com (1234ms)
✅ Registration complete for test@example.com (1567ms)

█████████████████████████████████████████████████████████████████████
█                                                                     █
█  📧 OTP EMAIL (DEVELOPMENT MODE)                                   █
█                                                                     █
█████████████████████████████████████████████████████████████████████
█  To: test@example.com                                              █
█  Name: Test User                                                   █
█                                                                     █
█  🔑 OTP CODE: 123456                                               █
█                                                                     █
█  ⏰ Expires: 10 minutes                                            █
█                                                                     █
█████████████████████████████████████████████████████████████████████
```

**Production Mode:**
```
✅ OTP email sent to user@example.com (847ms)
⚠️  Email sending failed: ETIMEDOUT
❌ Failed to send OTP to user@example.com: Authentication failed
```

### Audit Events

All authentication events are logged:
- `REGISTER_SUCCESS` / `REGISTER_FAILED`
- `OTP_EMAIL_SENT` / `OTP_EMAIL_FAILED`
- `OTP_VERIFY_SUCCESS` / `OTP_VERIFY_FAILED`
- `OTP_RESEND_SUCCESS` / `OTP_RESEND_FAILED`
- `ACCOUNT_LOCKED`
- `LOGIN_SUCCESS` / `LOGIN_FAILED`

### Monitoring Dashboard

For production, integrate with:
- **SendGrid Analytics**: Email delivery rates, opens, clicks
- **Application Logs**: Structured logging with Winston/Bunyan
- **APM Tools**: New Relic, Datadog, or Sentry for error tracking
- **Custom Metrics**: OTP success rate, email delivery time

---

## 🎓 Additional Resources

### Email Provider Documentation
- [Gmail SMTP Setup](https://support.google.com/mail/answer/7126229)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [Nodemailer Documentation](https://nodemailer.com/)

### Security Resources
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Email Deliverability Best Practices](https://postmarkapp.com/guides/email-deliverability)

---

## 🆘 Support

If you're still experiencing issues after following this guide:

1. **Run Full Diagnostics:**
   ```bash
   curl -X POST http://localhost:5000/api/email/diagnostics
   ```

2. **Check Server Logs** for detailed error messages

3. **Try Alternative Provider:**
   - If Gmail fails, try SendGrid
   - If firewall blocks SMTP, use API-based service

4. **Development Workaround:**
   - Set `NODE_ENV=development`
   - OTP will be logged to console
   - Email failure won't block registration

---

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Enhanced OTP service module
- ✅ Comprehensive email diagnostics
- ✅ Multiple email provider support
- ✅ Rate limiting and security features
- ✅ Development mode with console OTP
- ✅ Detailed error handling and logging
- ✅ Health check and monitoring endpoints

---

**Last Updated:** December 11, 2024
**Version:** 1.0.0
