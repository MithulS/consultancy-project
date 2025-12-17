# 📧 OTP Email System - Quick Reference

## 🚀 Quick Start

### 1. Setup Email Credentials

**For Gmail:**
```bash
# 1. Enable 2FA: https://myaccount.google.com/security
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Update .env:
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-16-char-app-password
```

**For SendGrid:**
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
EMAIL_USER=noreply@yourdomain.com
```

### 2. Test Configuration
```bash
npm run test:email
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test1234"}'
```

---

## 🔍 Diagnostics & Testing

| Command | Purpose |
|---------|---------|
| `npm run test:email` | Run email configuration diagnostics |
| `curl http://localhost:5000/api/email/health` | Quick health check |
| `curl -X POST http://localhost:5000/api/email/diagnostics` | Full diagnostics report |
| `curl -X POST http://localhost:5000/api/email/test -d '{"email":"test@example.com"}'` | Send test email |

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `OTP_EMAIL_SETUP_GUIDE.md` | **Complete setup guide** - Read this first! |
| `MIGRATION_GUIDE.md` | Migration from old to new OTP system |
| `README_OTP_QUICK.md` | This quick reference guide |

---

## 🛠️ Key Files

### Core Services
- `services/otpService.js` - OTP generation, email sending, verification
- `utils/emailDiagnostics.js` - Email configuration diagnostics

### Routes
- `routes/auth.js` - Current authentication routes (existing)
- `routes/auth_enhanced.js` - Enhanced authentication routes (new, optional)
- `routes/emailMonitoring.js` - Email health & diagnostics endpoints

### Scripts
- `scripts/testEmail.js` - Quick email configuration test

---

## 🔑 Environment Variables

### Required
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=development
```

### Optional
```env
EMAIL_PROVIDER=gmail              # gmail, sendgrid, mailgun, custom
EMAIL_FROM_NAME=Your App Name
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
VERIFY_EMAIL_ON_STARTUP=true
```

---

## 🔥 Common Issues & Quick Fixes

### ❌ "EAUTH - Authentication failed"
**Fix:** Use App Password, not regular password
```bash
# Gmail: https://myaccount.google.com/apppasswords
# Update EMAIL_PASS in .env
```

### ❌ "ETIMEDOUT - Connection timeout"
**Fix:** Firewall blocking SMTP port
```bash
# Try port 587 instead of 465
SMTP_PORT=587
SMTP_SECURE=false
# Or use SendGrid (API-based, no firewall issues)
```

### ❌ "OTP not received in inbox"
**Fix Options:**
1. Check spam/junk folder
2. Check server console for OTP (development mode)
3. Run diagnostics: `npm run test:email`
4. Try different email provider

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user & send OTP
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login (requires verified email)

### Email Monitoring
- `GET /api/email/health` - Quick health check
- `POST /api/email/diagnostics` - Full diagnostics
- `POST /api/email/test` - Send test email
- `GET /api/email/config` - Get current config

---

## 🔒 Security Features

- ✅ 6-digit random OTP
- ✅ 10-minute expiration
- ✅ Hashed storage (bcrypt)
- ✅ Rate limiting (10 attempts/15min)
- ✅ Account lockout after 5 failed attempts
- ✅ Audit logging
- ✅ WCAG-compliant email templates

---

## 🎯 Development Mode

In development (`NODE_ENV=development`):
- OTP is logged to console (in big box)
- Email failures don't block registration
- Debug endpoints available
- Detailed error messages

Console Output Example:
```
█████████████████████████████████████████████████████████████████████
█  📧 OTP EMAIL (DEVELOPMENT MODE)                                   █
█  🔑 OTP CODE: 123456                                               █
█  ⏰ Expires: 10 minutes                                            █
█████████████████████████████████████████████████████████████████████
```

---

## 🏭 Production Checklist

Before deploying:
- [ ] Set `NODE_ENV=production`
- [ ] Use SendGrid or Mailgun (better deliverability)
- [ ] Verify sender domain
- [ ] Enable SSL/TLS
- [ ] Strong JWT_SECRET (64+ chars)
- [ ] Configure rate limits
- [ ] Set up monitoring alerts
- [ ] Test email deliverability
- [ ] Configure SPF/DKIM/DMARC records

---

## 💡 Tips & Best Practices

### Email Provider Recommendations
- **Development:** Gmail with App Password
- **Production:** SendGrid or Mailgun (better deliverability, analytics)

### Testing Strategy
1. Run diagnostics first: `npm run test:email`
2. Fix any configuration issues
3. Test with real email address
4. Check spam folder initially
5. Monitor server logs

### Monitoring
```bash
# Check email service health
curl http://localhost:5000/api/email/health

# View detailed status
curl -X POST http://localhost:5000/api/email/diagnostics
```

---

## 🆘 Need Help?

1. **Run diagnostics:** `npm run test:email`
2. **Read full guide:** `OTP_EMAIL_SETUP_GUIDE.md`
3. **Check server logs** for error details
4. **Try alternative provider** (SendGrid if Gmail fails)

---

## 📝 Example Usage

### Complete Registration Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# 2. Check console for OTP (dev mode)

# 3. Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'

# 4. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

## 📈 Success Indicators

✅ Server logs show:
```
✅ Mail transporter verified successfully
✅ User created: user@example.com
✅ OTP email sent to user@example.com (1234ms)
```

✅ Health check returns:
```json
{
  "status": "healthy",
  "configured": true
}
```

✅ User receives OTP email in inbox (or console in dev mode)

---

**Version:** 1.0.0  
**Last Updated:** December 11, 2024

For detailed information, see `OTP_EMAIL_SETUP_GUIDE.md`
