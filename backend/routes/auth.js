// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ensure filename matches (User.js)
const nodemailer = require('nodemailer');
const { registrationLimiter, authLimiter, otpLimiter, resendOtpLimiter } = require('../middleware/rateLimiter');
const { logAuditEvent } = require('../utils/auditLogger');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Nodemailer transporter (Gmail App Password recommended)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Use port 587 (TLS) instead of 465 (SSL) - less likely to be blocked
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true,
  tls: {
    // for local dev only; remove rejectUnauthorized:false in production
    rejectUnauthorized: false
  }
});

// DEBUG ROUTE - Remove in production
router.get('/debug-env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment: process.env.NODE_ENV !== 'production',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET'
  });
});

// verify transporter on startup (non-blocking, with timeout)
setTimeout(() => {
  transporter.verify((err, success) => {
    if (err) {
      console.error('⚠️  Mail transporter error (verify):', err && err.message ? err.message : err);
      console.log('📧 Email delivery unavailable - using console OTP in development mode');
    } else {
      console.log('✅ Mail transporter ready');
    }
  });
}, 1000); // Verify after 1 second, don't block startup

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(toEmail, name, otpPlain) {
  // DEVELOPMENT MODE: Log OTP to console if email fails
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  console.log('🔍 DEBUG: sendOtpEmail called with:', { toEmail, name, otpPlain, isDevelopment, NODE_ENV: process.env.NODE_ENV });
  
  if (isDevelopment) {
    console.log('\n' + '█'.repeat(70));
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█  📧 OTP EMAIL (DEVELOPMENT MODE)' + ' '.repeat(33) + '█');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█'.repeat(70));
    console.log('█  To: ' + toEmail + ' '.repeat(Math.max(0, 61 - toEmail.length)) + '█');
    console.log('█  Name: ' + (name || '') + ' '.repeat(Math.max(0, 59 - (name || '').length)) + '█');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█  🔑 OTP CODE: ' + otpPlain + ' '.repeat(49) + '█');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█  ⏰ Expires: 10 minutes' + ' '.repeat(43) + '█');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█'.repeat(70) + '\n');
    
    // Try to send email in background, but don't wait for it
    // Set a very short timeout so we don't block registration
    setTimeout(async () => {
      try {
        const html = `
          <p>Hi ${name || ''},</p>
          <p>Your verification code is: <b>${otpPlain}</b></p>
          <p>This code will expire in 10 minutes.</p>
        `;
        const mailOptions = {
          from: `"No-Reply" <${process.env.EMAIL_USER}>`,
          to: toEmail,
          subject: 'Your verification OTP',
          html
        };
        
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to', toEmail);
      } catch (emailError) {
        console.log('⚠️  Email sending failed (using console OTP instead):', emailError.message);
      }
    }, 100); // Try in background, don't block
    
    // Always succeed immediately in development mode
    return Promise.resolve({ accepted: [toEmail], response: 'DEV MODE - Check console for OTP' });
  } else {
    // PRODUCTION MODE: Must send email successfully
    const html = `
      <p>Hi ${name || ''},</p>
      <p>Your verification code is: <b>${otpPlain}</b></p>
      <p>This code will expire in 10 minutes.</p>
    `;
    const mailOptions = {
      from: `"No-Reply" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Your verification OTP',
      html
    };
    return transporter.sendMail(mailOptions);
  }
}

// --------------------- TEST ROUTE (Remove in production) ---------------------
router.post('/test-otp-display', async (req, res) => {
  try {
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    const testOTP = genOTP();
    
    console.log('\n🧪 TEST ROUTE: Manually triggering OTP display...\n');
    await sendOtpEmail(testEmail, testName, testOTP);
    
    res.json({ 
      msg: 'OTP display test complete. Check server console for OTP box.',
      otp: testOTP  // Only for testing
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ msg: 'Test failed', error: error.message });
  }
});

// --------------------- Register ---------------------
router.post('/register', registrationLimiter, async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Email already registered' });
      return res.status(400).json({ msg: 'Email already registered' });
    }
    
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Username already taken' });
      return res.status(400).json({ msg: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpPlain = genOTP();
    const otpHash = await bcrypt.hash(otpPlain, 10);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    // create user
    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp: otpHash,
      otpExpiresAt
    });

    await user.save();

    // try to send OTP email; if sending fails, remove user and return error
    try {
      await sendOtpEmail(email, name, otpPlain);
      await logAuditEvent({ userId: user._id, email, action: 'REGISTER_SUCCESS', req, details: 'OTP sent to email' });
      await logAuditEvent({ userId: user._id, email, action: 'OTP_SENT', req });
      console.log(`Registered user ${email} - OTP sent`);
      return res.status(201).json({ msg: 'User registered. OTP sent to email.', email: user.email });
    } catch (mailErr) {
      console.error('sendMail error during register:', mailErr && mailErr.message ? mailErr.message : mailErr);
      // rollback (delete created user) so client can try again after fixing EMAIL settings
      await User.deleteOne({ _id: user._id });
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Failed to send OTP email' });
      return res.status(500).json({ msg: 'Failed to send OTP email. Check EMAIL config.', error: mailErr && mailErr.message ? mailErr.message : String(mailErr) });
    }
  } catch (err) {
    console.error('Register error:', err && err.message ? err.message : err);
    await logAuditEvent({ email: req.body.email, action: 'REGISTER_FAILED', req, details: err.message });
    return res.status(500).json({ msg: 'Server error', error: err && err.message ? err.message : String(err) });
  }
});

// --------------------- Verify OTP ---------------------
router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ msg: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) {
      await logAuditEvent({ email, action: 'OTP_VERIFY_FAILED', req, details: 'User not found' });
      return res.status(400).json({ msg: 'No user found with this email' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ msg: 'User already verified' });
    }

    // Check if account is locked due to too many failed attempts
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.otpLockedUntil - new Date()) / 60000);
      await logAuditEvent({ userId: user._id, email, action: 'OTP_VERIFY_FAILED', req, details: `Account locked - ${minutesRemaining} minutes remaining` });
      return res.status(429).json({ 
        msg: `Too many failed attempts. Account locked for ${minutesRemaining} more minute(s).`,
        lockedUntil: user.otpLockedUntil
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      await logAuditEvent({ userId: user._id, email, action: 'OTP_VERIFY_FAILED', req, details: 'OTP expired' });
      return res.status(400).json({ msg: 'OTP expired or not set. Please request a new OTP.' });
    }

    // Verify OTP
    const match = await bcrypt.compare(otp, user.otp);
    
    if (!match) {
      // Increment failed attempts
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        await logAuditEvent({ userId: user._id, email, action: 'ACCOUNT_LOCKED', req, details: 'Too many failed OTP attempts' });
        await logAuditEvent({ userId: user._id, email, action: 'OTP_VERIFY_FAILED', req, details: `Failed attempt ${user.otpAttempts} - Account locked` });
        return res.status(429).json({ 
          msg: 'Too many failed attempts. Account locked for 15 minutes.',
          lockedUntil: user.otpLockedUntil
        });
      }
      
      await user.save();
      const attemptsRemaining = 5 - user.otpAttempts;
      await logAuditEvent({ userId: user._id, email, action: 'OTP_VERIFY_FAILED', req, details: `Invalid OTP - ${attemptsRemaining} attempts remaining` });
      
      return res.status(400).json({ 
        msg: `Invalid OTP. ${attemptsRemaining} attempt(s) remaining before account lock.`,
        attemptsRemaining
      });
    }

    // OTP is valid - verify user and reset attempts
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    await user.save();

    await logAuditEvent({ userId: user._id, email, action: 'OTP_VERIFY_SUCCESS', req, details: 'Email verified successfully' });
    console.log(`User ${email} verified`);
    return res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify-OTP error:', err && err.message ? err.message : err);
    await logAuditEvent({ email: req.body.email, action: 'OTP_VERIFY_FAILED', req, details: err.message });
    return res.status(500).json({ msg: 'Server error', error: err && err.message ? err.message : String(err) });
  }
});

// --------------------- Resend OTP ---------------------
router.post('/resend-otp', resendOtpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Missing email' });

    const user = await User.findOne({ email });
    if (!user) {
      await logAuditEvent({ email, action: 'OTP_RESEND', req, details: 'User not found' });
      return res.status(400).json({ msg: 'No user found' });
    }
    if (user.isVerified) return res.status(400).json({ msg: 'User already verified' });

    const otpPlain = genOTP();
    const otpHash = await bcrypt.hash(otpPlain, 10);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    // save old values to rollback in case of mail failure
    const oldOtp = user.otp;
    const oldOtpExpires = user.otpExpiresAt;

    user.otp = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0; // Reset failed attempts on new OTP
    user.otpLockedUntil = undefined; // Clear any existing lock
    await user.save();

    try {
      await sendOtpEmail(email, user.name, otpPlain);
      await logAuditEvent({ userId: user._id, email, action: 'OTP_RESEND', req, details: 'OTP resent successfully' });
      await logAuditEvent({ userId: user._id, email, action: 'OTP_SENT', req });
      console.log(`Resent OTP to ${email}`);
      return res.json({ msg: 'OTP resent to email' });
    } catch (mailErr) {
      console.error('sendMail error during resend-otp:', mailErr && mailErr.message ? mailErr.message : mailErr);
      // rollback OTP fields
      user.otp = oldOtp;
      user.otpExpiresAt = oldOtpExpires;
      await user.save();
      return res.status(500).json({ msg: 'Failed to send OTP email. Check EMAIL config.', error: mailErr && mailErr.message ? mailErr.message : String(mailErr) });
    }
  } catch (err) {
    console.error('Resend-OTP error:', err && err.message ? err.message : err);
    return res.status(500).json({ msg: 'Server error', error: err && err.message ? err.message : String(err) });
  }
});

// --------------------- Check Verification Status ---------------------
router.post('/check-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email required' });
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ isVerified: false, exists: false });
    }
    
    return res.json({ 
      isVerified: user.isVerified,
      exists: true
    });
  } catch (err) {
    console.error('Check verification error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// --------------------- Login ---------------------
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) {
      await logAuditEvent({ email, action: 'LOGIN_FAILED', req, details: 'User not found' });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({ userId: user._id, email, action: 'LOGIN_FAILED', req, details: 'Invalid password' });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      await logAuditEvent({ userId: user._id, email, action: 'LOGIN_FAILED', req, details: 'Email not verified' });
      return res.status(403).json({ msg: 'Email not verified' });
    }

    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    await logAuditEvent({ userId: user._id, email, action: 'LOGIN_SUCCESS', req });
    console.log(`User ${email} logged in`);
    return res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err && err.message ? err.message : err);
    await logAuditEvent({ email: req.body.email, action: 'LOGIN_FAILED', req, details: err.message });
    return res.status(500).json({ msg: 'Server error', error: err && err.message ? err.message : String(err) });
  }
});

// --------------------- Forgot Password ---------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ msg: 'If that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
    const html = `
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetUrl}" style="background-color: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await transporter.sendMail({
        from: `"No-Reply" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html
      });
      console.log(`Password reset email sent to ${email}`);
      return res.json({ msg: 'If that email exists, a password reset link has been sent.' });
    } catch (mailErr) {
      console.error('sendMail error during forgot-password:', mailErr.message);
      // Rollback
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();
      return res.status(500).json({ msg: 'Failed to send reset email. Please try again later.' });
    }
  } catch (err) {
    console.error('Forgot-password error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// --------------------- Reset Password ---------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ msg: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired reset link' });

    if (!user.resetPasswordToken || !user.resetPasswordExpiresAt) {
      return res.status(400).json({ msg: 'Invalid or expired reset link' });
    }

    if (user.resetPasswordExpiresAt < new Date()) {
      return res.status(400).json({ msg: 'Reset link has expired. Please request a new one.' });
    }

    const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValidToken) return res.status(400).json({ msg: 'Invalid or expired reset link' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    console.log(`Password reset successful for ${email}`);
    return res.json({ msg: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Reset-password error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// --------------------- Protected Route Example ---------------------
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpiresAt');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json({ 
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Profile error:', err && err.message ? err.message : err);
    return res.status(500).json({ msg: 'Server error', error: err && err.message ? err.message : String(err) });
  }
});

// --------------------- Admin Login ---------------------
router.post('/admin-login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      await logAuditEvent({ email, action: 'ADMIN_LOGIN_FAILED', req, details: 'Missing credentials' });
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Find user and verify credentials
    const user = await User.findOne({ email });
    if (!user) {
      await logAuditEvent({ email, action: 'ADMIN_LOGIN_FAILED', req, details: 'User not found' });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      await logAuditEvent({ userId: user._id, email, action: 'ADMIN_LOGIN_FAILED', req, details: 'Email not verified' });
      return res.status(400).json({ msg: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({ userId: user._id, email, action: 'ADMIN_LOGIN_FAILED', req, details: 'Invalid password' });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token with admin flag
    const payload = { 
      userId: user._id,
      isAdmin: true 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    await logAuditEvent({ userId: user._id, email, action: 'ADMIN_LOGIN_SUCCESS', req, details: 'Admin logged in successfully' });
    console.log(`✅ Admin logged in: ${email}`);

    return res.json({ 
      msg: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        isAdmin: true
      }
    });
  } catch (err) {
    console.error('Admin login error:', err && err.message ? err.message : err);
    await logAuditEvent({ email: req.body.email, action: 'ADMIN_LOGIN_FAILED', req, details: err.message });
    return res.status(500).json({ msg: 'Server error', error: err && err.message ? err.message : String(err) });
  }
});

module.exports = router;
