# 📘 User Guide - MERN Authentication System

## Welcome! 👋

This guide will help you understand and use the authentication system effectively.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Registration Process](#registration-process)
3. [Email Verification](#email-verification)
4. [Login](#login)
5. [Password Reset](#password-reset)
6. [Troubleshooting](#troubleshooting)
7. [Security Tips](#security-tips)
8. [FAQ](#faq)

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Valid email address
- Internet connection

### Access the System
1. Open your web browser
2. Navigate to the application URL
3. You'll see the login page

---

## Registration Process

### Step 1: Create Your Account

1. Click **"Create one now"** link on the login page
2. You'll be taken to the registration form

### Step 2: Fill in Your Information

#### Username
- Choose a unique username
- Minimum 3 characters
- Letters and numbers only
- **Example**: `johndoe123`

#### Full Name
- Enter your complete name
- **Example**: `John Doe`

#### Email Address
- Use a valid email you can access
- You'll receive a verification code here
- **Example**: `john@example.com`

#### Password
Create a strong password that includes:
- ✅ At least 8 characters
- ✅ One UPPERCASE letter
- ✅ One lowercase letter
- ✅ One number (0-9)
- ✅ One special character (!@#$%^&*)

**Example**: `MyPass@2025`

### Password Strength Indicator

As you type your password, you'll see a colored bar:
- 🔴 **Red (Weak)**: Missing 3+ requirements
- 🟠 **Orange (Medium)**: Missing 1-2 requirements
- 🟢 **Green (Strong)**: Meets all requirements

### Step 3: Submit Registration

1. Click **"Create Account"** button
2. Wait for confirmation message
3. You'll see: "✅ Success! Check your email for verification code"
4. You'll be automatically redirected to the verification page

---

## Email Verification

### Step 1: Check Your Email

1. Open your email inbox
2. Look for email from the system (check spam folder too)
3. Subject: "Your verification OTP"

### Email Contents
```
Hi [Your Name],

Your verification code is: 123456

This code will expire in 10 minutes.
```

### Step 2: Enter Verification Code

#### Verification Page Features

**Email Field**
- Enter the email you registered with
- Must match exactly

**Verification Code Field**
- Enter the 6-digit code from email
- Numbers only
- Example: `123456`

**Countdown Timer**
Shows time remaining:
- 🟢 **Green** (10-3 minutes): Plenty of time
- 🟠 **Orange** (3-1 minutes): Hurry up!
- 🔴 **Red** (< 1 minute): Almost expired!

**Attempts Counter**
- You have 5 attempts to enter correct code
- Each wrong attempt decreases counter
- Shows: "⚠️ 3 attempts remaining"

### Step 3: Verify Your Email

1. Enter your email address
2. Enter the 6-digit code
3. Click **"✓ Verify Email"** button
4. Success message: "✅ Email verified successfully!"
5. You'll be redirected to login page

### What If Code Expires?

If your code expires (10 minutes passed):

1. Click **"↻ Resend Code"** button
2. Check your email for new code
3. Timer resets to 10 minutes
4. Attempt counter resets to 5

**Note**: You can request a new code only 3 times per 5 minutes.

### What If Account Gets Locked?

After 5 incorrect attempts, your account is temporarily locked for **15 minutes**.

**Options:**
1. **Wait 15 minutes** - Lock automatically expires
2. **Request new code** - Immediately unlocks account

When locked, you'll see:
```
🔒 Too many failed attempts. 
Account locked for 12 more minute(s).
```

---

## Login

### After Successful Verification

1. You'll be on the login page
2. Enter your credentials:
   - **Email**: Your registered email
   - **Password**: Your password

### Login Page Features

**Remember Me Checkbox**
- Check this to stay logged in
- Saves your session for 7 days
- Useful on your personal devices
- ⚠️ Don't use on public computers!

**Show/Hide Password**
- Click the eye icon (👁️) to toggle
- Helps verify you typed correctly

**Forgot Password Link**
- Click if you forgot your password
- See [Password Reset](#password-reset) section

### Successful Login

After clicking **"Sign In"**:
1. System validates credentials
2. You receive a secure token
3. Redirected to your dashboard
4. Welcome message appears

### Login Errors

**"Invalid credentials"**
- Wrong email or password
- Check for typos
- Password is case-sensitive

**"Email not verified"**
- You haven't verified your email yet
- Go back to verification page
- Request new code if needed

**"Too many authentication attempts"**
- You've tried logging in too many times
- Wait 15 minutes and try again
- This protects your account from hackers

---

## Password Reset

### When to Use

- You forgot your password
- You want to change it for security
- Your password was compromised

### Step 1: Request Reset Link

1. On login page, click **"Forgot Password?"**
2. Enter your registered email
3. Click **"Send Reset Link"**
4. Check your email inbox

### Step 2: Open Reset Email

Email will contain:
```
Hi [Your Name],

You requested to reset your password.

[Reset Password Button]

This link expires in 1 hour.

If you didn't request this, ignore this email.
```

### Step 3: Create New Password

1. Click the button in email
2. You'll be taken to reset page
3. Enter your new password
4. Confirm new password
5. Click **"Reset Password"**

**New password requirements:**
- Same as registration (see above)
- Can't be same as old password (recommended)

### Step 4: Login with New Password

1. Success message appears
2. Click to go to login page
3. Use your new password

---

## Troubleshooting

### "Email not received"

**Check these:**
1. ✅ Spam/Junk folder
2. ✅ Promotions tab (Gmail)
3. ✅ Email address spelling
4. ✅ Wait 2-3 minutes (delivery delay)

**Still nothing?**
- Click "Resend Code" button
- Check email server status
- Try different email address
- Contact support

### "Code has expired"

**Solution:**
1. Click "Resend Code" button
2. Wait for new email
3. Enter new code immediately
4. Complete within 10 minutes

### "Account is locked"

**Why it happens:**
- 5 incorrect OTP attempts
- Security protection measure

**Solution:**
1. **Option A**: Wait 15 minutes
2. **Option B**: Request new OTP (unlocks immediately)

### "Page not loading"

**Try these:**
1. Refresh page (F5 or Ctrl+R)
2. Clear browser cache
3. Try different browser
4. Check internet connection
5. Try incognito/private mode

### "Invalid credentials" repeated

**Possible causes:**
- Wrong password
- Caps Lock is ON
- Extra spaces in email
- Account not verified yet

**Solutions:**
- Double-check email spelling
- Verify password (use show/hide)
- Try password reset
- Complete email verification

---

## Security Tips

### Creating Strong Passwords

**DO:**
- ✅ Use minimum 8 characters
- ✅ Mix uppercase and lowercase
- ✅ Include numbers and symbols
- ✅ Use unique password for this site
- ✅ Consider using password manager

**DON'T:**
- ❌ Use personal info (name, birthday)
- ❌ Use common words or patterns
- ❌ Reuse passwords from other sites
- ❌ Share your password with anyone
- ❌ Write it down in plain text

### Protect Your Account

1. **Keep email secure**
   - Use strong email password
   - Enable 2FA on email account

2. **Verify login location**
   - Only login on trusted devices
   - Use private/incognito on public computers
   - Log out after use on shared devices

3. **Monitor activity**
   - Check for suspicious emails
   - Don't click unknown links
   - Report unusual behavior

4. **Update regularly**
   - Change password periodically
   - Update email if it changes
   - Keep browser updated

### Recognize Phishing

**Legitimate emails:**
- From: noreply@yourdomain.com
- Contain OTP code or reset link
- Professional formatting
- No requests for password

**Suspicious emails:**
- From: random email address
- Ask for password directly
- Poor grammar/spelling
- Urgent/threatening language
- Suspicious links

**If unsure:**
- Don't click any links
- Go to site directly (type URL)
- Contact support to verify
- Report suspicious emails

---

## FAQ

### General Questions

**Q: How long does registration take?**
A: About 2-3 minutes total:
- Fill form: 1 minute
- Check email: 30 seconds
- Verify OTP: 30 seconds
- Login: 30 seconds

**Q: Is my data secure?**
A: Yes! We use:
- Encrypted password storage
- Secure HTTPS connection
- Rate limiting protection
- Audit logging
- Industry best practices

**Q: Can I change my username later?**
A: Currently, usernames are permanent. Choose carefully during registration.

**Q: Can I use the same email for multiple accounts?**
A: No, each email can only register one account.

### Registration Questions

**Q: What if my username is taken?**
A: Try these:
- Add numbers: `johndoe` → `johndoe123`
- Add underscores: `john_doe`
- Use middle initial: `john_m_doe`
- Try variations: `jdoe`, `j_doe`

**Q: Can I use a work email?**
A: Yes, any valid email works. But consider:
- You'll need access to verify
- You may lose access if you leave job
- Personal email might be better

**Q: Password requirements too strict?**
A: Requirements ensure security:
- Protects against hackers
- Prevents easy guessing
- Meets industry standards
- Use password manager to help

### Verification Questions

**Q: How many times can I resend OTP?**
A: 3 times per 5 minutes. After that, wait 5 minutes.

**Q: Can I verify later?**
A: No, you must verify before logging in. Your account stays "pending" until verified.

**Q: What if I deleted the email?**
A: Click "Resend Code" button to get a new one.

**Q: OTP in wrong format?**
A: OTP is always 6 digits, like `123456`. Nothing else.

### Login Questions

**Q: How long do I stay logged in?**
A: 7 days if you checked "Remember Me", otherwise until you close browser.

**Q: Can I login from multiple devices?**
A: Yes, you can be logged in on multiple devices simultaneously.

**Q: What if I forgot which email I used?**
A: Try all your email addresses, or contact support for help.

### Password Reset Questions

**Q: How long is reset link valid?**
A: 1 hour. After that, request new link.

**Q: Can I reset without email access?**
A: No, email access is required for security. This ensures only you can reset your password.

**Q: How often can I reset password?**
A: As needed, but rate limited to 5 times per 15 minutes to prevent abuse.

---

## Need More Help?

### Resources
- 📖 **Full Documentation**: See API_DOCUMENTATION.md
- 🔐 **Security Guide**: See SECURITY_DEPLOYMENT.md
- 🚀 **Quick Start**: See QUICKSTART.md
- 💻 **Technical Details**: See README.md

### Contact Support
- **Email**: support@yourdomain.com
- **Response Time**: Within 24 hours
- **Include**: 
  - Your email (for account lookup)
  - Description of issue
  - Screenshots (if applicable)
  - Browser and device info

### Report Security Issues
- **Email**: security@yourdomain.com
- **Urgency**: Immediate response
- **Confidential**: Handled privately

---

## Glossary

**Authentication**: Process of verifying you are who you say you are

**OTP (One-Time Password)**: Temporary code sent to verify identity

**JWT (JSON Web Token)**: Secure token for maintaining login session

**Rate Limiting**: Temporary restrictions after too many attempts

**2FA (Two-Factor Authentication)**: Extra security layer (future feature)

**Bcrypt**: Secure method for password encryption

**Session**: Period of time you're logged in

---

## Quick Reference Card

### Registration Checklist
- [ ] Choose unique username (3+ chars)
- [ ] Enter full name
- [ ] Use valid email you can access
- [ ] Create strong password (8+ chars, mixed case, number, symbol)
- [ ] Check email within 10 minutes
- [ ] Enter 6-digit code
- [ ] Login with credentials

### Password Requirements
- Minimum 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character

### Time Limits
- **OTP Validity**: 10 minutes
- **Account Lock**: 15 minutes
- **Reset Link**: 1 hour
- **Login Session**: 7 days (with Remember Me)

### Rate Limits
- **Registration**: 3 per hour
- **OTP Verification**: 10 per 15 minutes
- **OTP Resend**: 3 per 5 minutes
- **Login Attempts**: 5 per 15 minutes

### Important Links
- Login: `#login`
- Register: `#register`
- Verify: `#verify-otp`
- Forgot Password: `#forgot-password`
- Dashboard: `#dashboard`

---

**Last Updated**: November 30, 2025  
**Version**: 2.0.0

---

Thank you for using our authentication system! We're committed to keeping your account secure while providing a smooth user experience. 🔐✨
