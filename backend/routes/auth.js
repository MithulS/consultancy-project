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
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 60000, // 60 seconds timeout
  greetingTimeout: 30000,
  socketTimeout: 60000,
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
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
    let { username, name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    // Auto-generate username from email if not provided
    if (!username) {
      username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 6);
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Email already registered' });
      return res.status(400).json({ msg: 'Email already registered' });
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
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Profile error:', err && err.message ? err.message : err);
    return res.status(500).json({ msg: 'Server error', error: err && err.message ? err.message : String(err) });
  }
});

// Update Profile
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    if (!name || !email) {
      return res.status(400).json({ msg: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiresAt');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await logAuditEvent({ userId, email, action: 'PROFILE_UPDATED', req, details: 'Profile updated' });

    return res.json({
      success: true,
      msg: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Change Password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      await logAuditEvent({ userId, action: 'PASSWORD_CHANGE_FAILED', req, details: 'Invalid current password' });
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await logAuditEvent({ userId, action: 'PASSWORD_CHANGED', req, details: 'Password changed successfully' });

    return res.json({
      success: true,
      msg: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// --------------------- Admin Login ---------------------
router.post('/admin-login', authLimiter, async (req, res) => {
  console.log('🔥🔥🔥 ADMIN LOGIN ROUTE HIT! 🔥🔥🔥');
  try {
    const { email, password } = req.body;
    console.log('🔐 ADMIN LOGIN ATTEMPT:', { email, passwordLength: password?.length });
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      await logAuditEvent({ email, action: 'ADMIN_LOGIN_FAILED', req, details: 'Missing credentials' });
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Find user and verify credentials
    const user = await User.findOne({ email });
    console.log('👤 User lookup:', user ? { found: true, email: user.email, isVerified: user.isVerified, isAdmin: user.isAdmin } : { found: false });
    
    if (!user) {
      console.log('❌ User not found');
      await logAuditEvent({ email, action: 'ADMIN_LOGIN_FAILED', req, details: 'User not found' });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      console.log('❌ User not verified');
      await logAuditEvent({ userId: user._id, email, action: 'ADMIN_LOGIN_FAILED', req, details: 'Email not verified' });
      return res.status(400).json({ msg: 'Please verify your email first' });
    }

    console.log('🔑 Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      await logAuditEvent({ userId: user._id, email, action: 'ADMIN_LOGIN_FAILED', req, details: 'Invalid password' });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if user has admin privileges
    if (!user.isAdmin) {
      await logAuditEvent({ userId: user._id, email, action: 'ADMIN_LOGIN_FAILED', req, details: 'User is not an admin' });
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
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

// --------------------- Google OAuth Routes ---------------------

// Initiate Google OAuth flow
router.get('/google', (req, res) => {
  // Store the original URL for redirect after auth
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.error('❌ GOOGLE_CLIENT_ID not configured in environment variables');
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/#/login?error=Google login not configured`);
  }
  
  const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  console.log('🔄 Redirecting to Google OAuth...');
  res.redirect(googleAuthUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  
  if (error) {
    console.error('❌ Google OAuth error:', error);
    await logAuditEvent({ action: 'GOOGLE_LOGIN_FAILED', req, details: `OAuth error: ${error}` });
    return res.redirect(`${frontendUrl}/#login?error=${encodeURIComponent(error)}`);
  }
  
  if (!code) {
    console.error('❌ No authorization code received from Google');
    await logAuditEvent({ action: 'GOOGLE_LOGIN_FAILED', req, details: 'No authorization code' });
    return res.redirect(`${frontendUrl}/#login?error=No authorization code received`);
  }
  
  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }
    
    // Fetch user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    const googleUser = await userInfoResponse.json();
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    
    console.log('✅ Google user info received:', googleUser.email);
    
    // Check if user exists in database
    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      // Create new user from Google profile
      const username = googleUser.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 6);
      
      user = new User({
        username,
        name: googleUser.name,
        email: googleUser.email,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        isVerified: true, // Google accounts are pre-verified
        googleId: googleUser.id,
        profilePicture: googleUser.picture
      });
      
      await user.save();
      await logAuditEvent({ userId: user._id, email: user.email, action: 'GOOGLE_REGISTER_SUCCESS', req, details: 'New user via Google OAuth' });
      console.log(`✅ New user created via Google: ${user.email}`);
    } else {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleUser.id;
      }
      if (!user.profilePicture && googleUser.picture) {
        user.profilePicture = googleUser.picture;
      }
      if (!user.isVerified) {
        user.isVerified = true; // Auto-verify if logging in with Google
      }
      await user.save();
      await logAuditEvent({ userId: user._id, email: user.email, action: 'GOOGLE_LOGIN_SUCCESS', req });
      console.log(`✅ Existing user logged in via Google: ${user.email}`);
    }
    
    // Generate JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/#login?token=${token}`);
  } catch (err) {
    console.error('❌ Google OAuth callback error:', err);
    await logAuditEvent({ action: 'GOOGLE_LOGIN_FAILED', req, details: err.message });
    res.redirect(`${frontendUrl}/#login?error=${encodeURIComponent(err.message)}`);
  }
});

// Get current user info (for OAuth callback)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password -otp');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error('Get user info error:', err);
    res.status(401).json({ msg: 'Invalid token' });
  }
});

// ============================================================
// ADMIN PASSWORD RESET ROUTES
// ============================================================

/**
 * @route   POST /api/auth/admin-forgot-password
 * @desc    Request password reset for admin account
 * @access  Public (with rate limiting)
 */
router.post('/admin-forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Email address is required' 
      });
    }

    // Find admin user
    const admin = await User.findOne({ 
      email: email.trim().toLowerCase(), 
      isAdmin: true 
    });

    // Always return success (security: don't reveal if email exists)
    // But only send email if admin exists
    if (admin) {
      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { userId: admin._id, type: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token in user document (for additional validation)
      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpiresAt = new Date(Date.now() + 3600000); // 1 hour
      await admin.save();

      // Create reset URL
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/#admin-reset-password?token=${resetToken}`;

      // Send email
      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
            .security-tips { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .security-tips h4 { margin: 0 0 10px 0; color: #1e40af; }
            .security-tips ul { margin: 0; padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Admin Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${admin.name || 'Admin'}</strong>,</p>
              
              <p>We received a request to reset your admin account password. If you made this request, click the button below to reset your password:</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 12px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li><strong>This link will expire in 1 hour</strong> for your security</li>
                  <li>The link can only be used <strong>once</strong></li>
                  <li>If you didn't request this reset, <strong>please ignore this email</strong> or contact support immediately</li>
                </ul>
              </div>
              
              <div class="security-tips">
                <h4>🛡️ Security Tips</h4>
                <ul>
                  <li>Never share your password reset link with anyone</li>
                  <li>Create a strong password with at least 8 characters</li>
                  <li>Include uppercase, lowercase, numbers, and special characters</li>
                  <li>Don't reuse passwords from other accounts</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280;">If you're having trouble clicking the button, copy and paste the URL into your web browser.</p>
            </div>
            <div class="footer">
              <p><strong>This is an automated security message</strong></p>
              <p>Request Time: ${new Date().toLocaleString()}</p>
              <p>IP Address: ${req.ip || 'Unknown'}</p>
              <p style="margin-top: 15px;">If you didn't request a password reset, your account is still secure. No changes have been made.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Admin Security" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: '🔐 Admin Password Reset Request',
        html: emailTemplate
      });

      console.log(`✅ Password reset email sent to: ${admin.email}`);

      // Log audit event
      await logAuditEvent({
        adminId: null,
        action: 'admin_password_reset_requested',
        target: 'admin',
        targetId: admin._id,
        details: { email: admin.email }
      });
    } else {
      console.log(`⚠️ Password reset requested for non-existent admin: ${email}`);
    }

    // Always return success (security best practice)
    res.json({
      success: true,
      msg: 'If an admin account exists with this email, a password reset link has been sent.'
    });

  } catch (err) {
    console.error('❌ Admin forgot password error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to process password reset request' 
    });
  }
});

/**
 * @route   POST /api/auth/admin-validate-reset-token
 * @desc    Validate password reset token
 * @access  Public
 */
router.post('/admin-validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Reset token is required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid token type' 
      });
    }

    // Check if user exists and token matches
    const admin = await User.findOne({
      _id: decoded.userId,
      isAdmin: true,
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid or expired reset token' 
      });
    }

    res.json({
      success: true,
      msg: 'Token is valid'
    });

  } catch (err) {
    console.error('❌ Token validation error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Reset link has expired. Please request a new one.' 
      });
    }
    
    res.status(400).json({ 
      success: false, 
      msg: 'Invalid reset token' 
    });
  }
});

/**
 * @route   POST /api/auth/admin-reset-password
 * @desc    Reset admin password using valid token
 * @access  Public (with valid token)
 */
router.post('/admin-reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Password must be at least 8 characters long' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid token type' 
      });
    }

    // Find admin with valid token
    const admin = await User.findOne({
      _id: decoded.userId,
      isAdmin: true,
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpiresAt = undefined;
    await admin.save();

    console.log(`✅ Admin password reset successful: ${admin.email}`);

    // Send confirmation email
    const confirmationEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Password Reset Successful</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${admin.name || 'Admin'}</strong>,</p>
            
            <div class="success">
              <p style="margin: 0;"><strong>✅ Your admin password has been successfully changed</strong></p>
            </div>
            
            <p>Your admin account password has been updated. You can now log in with your new password.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/#secret-admin-login" class="button">Go to Admin Login</a>
            </p>
            
            <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <strong>⚠️ If you didn't make this change:</strong><br>
              Your account may be compromised. Please contact support immediately at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
            </p>
          </div>
          <div class="footer">
            <p><strong>Password Changed Successfully</strong></p>
            <p>Change Time: ${new Date().toLocaleString()}</p>
            <p>IP Address: ${req.ip || 'Unknown'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Admin Security" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: '✅ Admin Password Changed Successfully',
      html: confirmationEmail
    });

    // Log audit event
    await logAuditEvent({
      adminId: admin._id,
      action: 'admin_password_reset_completed',
      target: 'admin',
      targetId: admin._id,
      details: { email: admin.email }
    });

    res.json({
      success: true,
      msg: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (err) {
    console.error('❌ Admin reset password error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        msg: 'Reset link has expired. Please request a new one.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to reset password' 
    });
  }
});

/**
 * @route   POST /api/auth/admin-send-reset-otp
 * @desc    Generate and send OTP for admin password reset
 * @access  Public (Rate Limited)
 */
router.post('/admin-send-reset-otp', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        msg: 'Email is required'
      });
    }

    // Find admin user
    console.log('🔍 Searching for admin with email:', email.toLowerCase().trim());
    const admin = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isAdmin: true
    });

    console.log('🔍 Admin found:', admin ? `Yes (${admin.email})` : 'No');

    // Security: Don't reveal whether account exists
    if (!admin) {
      console.log('⚠️ No admin found with email:', email);
      return res.json({
        success: true,
        msg: 'If an admin account with that email exists, an OTP has been sent.'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated OTP for', admin.email, ':', otpCode);
    
    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    
    // Store OTP with 10-minute expiry
    admin.otp = hashedOTP;
    admin.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    admin.otpAttempts = 0; // Reset attempts
    await admin.save();
    console.log('✅ OTP saved to database for', admin.email);

    // Send OTP email
    const otpEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            padding: 40px 20px;
            border-radius: 16px;
          }
          .card {
            background: white;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .title {
            color: #0f172a;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
          }
          .subtitle {
            color: #64748b;
            font-size: 14px;
          }
          .otp-box {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            font-size: 48px;
            font-weight: 800;
            letter-spacing: 12px;
            text-align: center;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
          }
          .info-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .warning-box {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          ul {
            margin: 12px 0;
            padding-left: 20px;
          }
          li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="icon">🔐</div>
              <h1 class="title">Admin Password Reset</h1>
              <p class="subtitle">Your One-Time Password</p>
            </div>
            
            <p>Hello <strong>${admin.name || 'Admin'}</strong>,</p>
            
            <p>You requested to reset your admin password. Use the OTP code below to continue:</p>
            
            <div class="otp-box">
              ${otpCode}
            </div>
            
            <div class="info-box">
              <strong>⏱️ This OTP will expire in 10 minutes</strong><br>
              <small>Requested at: ${new Date().toLocaleString()}</small>
            </div>
            
            <div class="info-box">
              <strong>📋 Next Steps:</strong>
              <ul>
                <li>Go back to the admin password reset page</li>
                <li>Enter this 6-digit OTP code</li>
                <li>Create your new password</li>
              </ul>
            </div>
            
            <div class="warning-box">
              <strong>⚠️ Security Alert:</strong>
              <ul>
                <li>Never share this OTP with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>If you didn't request this, contact support immediately</li>
                <li>Request IP: ${req.ip || 'Unknown'}</li>
              </ul>
            </div>
            
            <div class="footer">
              <p><strong>Admin Security System</strong></p>
              <p>This is an automated message. Please do not reply.</p>
              <p>If you need assistance, contact: ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // In development, log OTP to console
    if (process.env.NODE_ENV !== 'production') {
      const otpMessage = `
==============================================
🔐 DEVELOPMENT MODE - OTP CODE
==============================================
📧 Email: ${email}
🔢 OTP: ${otpCode}
⏰ Valid until: ${admin.otpExpiresAt.toLocaleString()}
==============================================
`;
      console.log(otpMessage);
      process.stdout.write(otpMessage + '\n');
    }

    // Try to send email, but don't fail if it doesn't work in development
    try {
      console.log('📧 Attempting to send email to:', admin.email);
      await transporter.sendMail({
        from: `"Admin Security" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: '🔐 Your Admin Password Reset OTP',
        html: otpEmail
      });
      console.log('✅ Email sent successfully to:', admin.email);
    } catch (emailError) {
      console.error('⚠️  Email send failed:', emailError.message);
      if (process.env.NODE_ENV === 'production') {
        throw emailError; // In production, fail if email doesn't send
      }
      console.log('📝 Continuing in development mode - OTP logged to console');
    }

    // Log audit event
    await logAuditEvent({
      adminId: admin._id,
      action: 'admin_password_reset_otp_sent',
      target: 'admin',
      targetId: admin._id,
      details: { email: admin.email, ip: req.ip }
    });

    console.log('✅ OTP request completed successfully for:', admin.email);
    res.json({
      success: true,
      msg: 'OTP has been sent to your email address'
    });

  } catch (err) {
    console.error('❌ Send reset OTP error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to send OTP. Please try again later.'
    });
  }
});

/**
 * @route   POST /api/auth/admin-verify-reset-otp
 * @desc    Verify OTP for admin password reset (optional validation step)
 * @access  Public (Rate Limited)
 */
router.post('/admin-verify-reset-otp', otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        msg: 'Email and OTP are required'
      });
    }

    // Find admin user
    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      isAdmin: true
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or OTP'
      });
    }

    // Check if OTP exists
    if (!admin.otp) {
      return res.status(400).json({
        success: false,
        msg: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP has expired
    if (!admin.otpExpiresAt || admin.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        msg: 'OTP has expired. Please request a new one.'
      });
    }

    // Check failed attempts
    if (admin.otpAttempts >= 3) {
      return res.status(429).json({
        success: false,
        msg: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp.trim(), admin.otp);

    if (!isValidOTP) {
      // Increment failed attempts
      admin.otpAttempts = (admin.otpAttempts || 0) + 1;
      await admin.save();

      return res.status(400).json({
        success: false,
        msg: `Invalid OTP. ${3 - admin.otpAttempts} attempts remaining.`
      });
    }

    // OTP is valid
    res.json({
      success: true,
      msg: 'OTP verified successfully'
    });

  } catch (err) {
    console.error('❌ Verify reset OTP error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to verify OTP'
    });
  }
});

/**
 * @route   POST /api/auth/admin-reset-password-with-otp
 * @desc    Reset admin password using OTP
 * @access  Public (Rate Limited)
 */
router.post('/admin-reset-password-with-otp', otpLimiter, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        msg: 'Password must be at least 8 characters long'
      });
    }

    // Find admin user
    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      isAdmin: true
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or OTP'
      });
    }

    // Check if OTP exists
    if (!admin.otp) {
      return res.status(400).json({
        success: false,
        msg: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP has expired
    if (!admin.otpExpiresAt || admin.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        msg: 'OTP has expired. Please request a new one.'
      });
    }

    // Check failed attempts
    if (admin.otpAttempts >= 3) {
      return res.status(429).json({
        success: false,
        msg: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp.trim(), admin.otp);

    if (!isValidOTP) {
      // Increment failed attempts
      admin.otpAttempts = (admin.otpAttempts || 0) + 1;
      await admin.save();

      return res.status(400).json({
        success: false,
        msg: `Invalid OTP. ${3 - admin.otpAttempts} attempts remaining.`
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    admin.password = hashedPassword;
    admin.otp = undefined;
    admin.otpExpiresAt = undefined;
    admin.otpAttempts = 0;
    await admin.save();

    // Send confirmation email
    const confirmationEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 20px;
            border-radius: 16px;
          }
          .card {
            background: white;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 16px;
          }
          .title {
            color: #0f172a;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
          }
          .success-box {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            margin: 16px 0;
          }
          .footer {
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="icon">✅</div>
              <h1 class="title">Password Changed Successfully</h1>
            </div>
            
            <p>Hello <strong>${admin.name || 'Admin'}</strong>,</p>
            
            <div class="success-box">
              <strong>🔒 Your admin password has been successfully changed</strong><br>
              <small>Changed at: ${new Date().toLocaleString()}</small>
            </div>
            
            <p>You can now log in to your admin account with your new password.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/#secret-admin-login" class="button">
                Go to Admin Login
              </a>
            </p>
            
            <div class="warning-box">
              <strong>⚠️ If you didn't make this change:</strong><br>
              Your account may be compromised. Please contact support immediately at 
              <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
              <br><br>
              <strong>Change Details:</strong><br>
              • Time: ${new Date().toLocaleString()}<br>
              • IP Address: ${req.ip || 'Unknown'}
            </div>
            
            <div class="footer">
              <p><strong>Admin Security System</strong></p>
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Admin Security" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: '✅ Admin Password Changed Successfully',
      html: confirmationEmail
    });

    // Log audit event
    await logAuditEvent({
      adminId: admin._id,
      action: 'admin_password_reset_with_otp_completed',
      target: 'admin',
      targetId: admin._id,
      details: { email: admin.email, ip: req.ip }
    });

    res.json({
      success: true,
      msg: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (err) {
    console.error('❌ Reset password with OTP error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to reset password. Please try again.'
    });
  }
});

module.exports = router;
