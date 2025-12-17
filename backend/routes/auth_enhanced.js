/**
 * Enhanced Authentication Routes
 * Secure OTP-based authentication with comprehensive error handling
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { OTPService, OTP_CONFIG } = require('../services/otpService');
const { registrationLimiter, authLimiter, otpLimiter, resendOtpLimiter } = require('../middleware/rateLimiter');
const { logAuditEvent } = require('../utils/auditLogger');

// ==================== REGISTRATION ====================

/**
 * POST /api/auth/register
 * Register new user with OTP verification
 */
router.post('/register', registrationLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    let { username, name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Missing required fields' });
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Invalid email format' });
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Password too short' });
      return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
    }

    // Auto-generate username if not provided
    if (!username) {
      username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 6);
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Email already registered' });
      return res.status(400).json({ 
        msg: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      await logAuditEvent({ email, action: 'REGISTER_FAILED', req, details: 'Username already taken' });
      return res.status(400).json({ 
        msg: 'Username already taken',
        code: 'USERNAME_EXISTS'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otpPlain = OTPService.generateOTP();
    const otpHash = await OTPService.hashOTP(otpPlain);
    const otpExpiresAt = new Date(Date.now() + OTP_CONFIG.TTL_MS);

    // Create user
    const user = new User({
      username,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      otp: otpHash,
      otpExpiresAt,
      otpAttempts: 0
    });

    await user.save();
    console.log(`✅ User created: ${email} (ID: ${user._id})`);

    // Send OTP email
    try {
      const emailResult = await OTPService.sendOTPEmail(email, name, otpPlain, req);
      
      await logAuditEvent({ 
        userId: user._id, 
        email, 
        action: 'REGISTER_SUCCESS', 
        req, 
        details: `User registered, OTP sent (${emailResult.duration || 0}ms)` 
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Registration complete for ${email} (${duration}ms)`);

      return res.status(201).json({
        success: true,
        msg: 'Registration successful. Please check your email for OTP.',
        email: user.email,
        otpExpiresIn: OTP_CONFIG.TTL_MS / 1000, // seconds
        devMode: emailResult.devMode || false
      });

    } catch (emailError) {
      console.error(`❌ Failed to send OTP to ${email}:`, emailError.message);

      // Rollback: Delete user if email fails in production
      if (process.env.NODE_ENV === 'production') {
        await User.deleteOne({ _id: user._id });
        await logAuditEvent({ 
          email, 
          action: 'REGISTER_FAILED', 
          req, 
          details: `Email send failed: ${emailError.message}` 
        });

        return res.status(500).json({
          success: false,
          msg: 'Failed to send verification email. Please try again later.',
          error: 'EMAIL_SEND_FAILED',
          details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        });
      } else {
        // Development: Allow registration without email
        await logAuditEvent({ 
          userId: user._id, 
          email, 
          action: 'REGISTER_SUCCESS', 
          req, 
          details: 'Development mode - OTP logged to console' 
        });
        
        return res.status(201).json({
          success: true,
          msg: 'Registration successful (DEV MODE - check server console for OTP)',
          email: user.email,
          devMode: true,
          warning: 'Email sending failed - OTP logged to console'
        });
      }
    }

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    await logAuditEvent({ 
      email: req.body.email, 
      action: 'REGISTER_FAILED', 
      req, 
      details: error.message 
    });

    return res.status(500).json({
      success: false,
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ==================== OTP VERIFICATION ====================

/**
 * POST /api/auth/verify-otp
 * Verify OTP and activate user account
 */
router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ msg: 'Email and OTP are required' });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ msg: 'Invalid OTP format. Must be 6 digits' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await logAuditEvent({ email, action: 'OTP_VERIFY_FAILED', req, details: 'User not found' });
      return res.status(400).json({ msg: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        msg: 'User already verified',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Validate OTP attempt (check lockout, expiration)
    const validation = OTPService.validateOTPAttempt(user);
    if (!validation.valid) {
      await logAuditEvent({ 
        userId: user._id, 
        email, 
        action: 'OTP_VERIFY_FAILED', 
        req, 
        details: validation.message 
      });

      return res.status(validation.locked ? 429 : 400).json({
        success: false,
        msg: validation.message,
        locked: validation.locked,
        minutesRemaining: validation.minutesRemaining
      });
    }

    // Verify OTP
    const isValid = await OTPService.verifyOTP(otp, user.otp);

    if (!isValid) {
      // Handle failed attempt
      const failureResult = await OTPService.handleFailedAttempt(user);
      
      await logAuditEvent({ 
        userId: user._id, 
        email, 
        action: failureResult.locked ? 'ACCOUNT_LOCKED' : 'OTP_VERIFY_FAILED', 
        req, 
        details: failureResult.message 
      });

      return res.status(failureResult.locked ? 429 : 400).json({
        success: false,
        msg: failureResult.message,
        locked: failureResult.locked,
        attemptsRemaining: failureResult.attemptsRemaining,
        lockoutUntil: failureResult.lockoutUntil
      });
    }

    // OTP is valid - verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    await user.save();

    await logAuditEvent({ 
      userId: user._id, 
      email, 
      action: 'OTP_VERIFY_SUCCESS', 
      req, 
      details: 'Email verified successfully' 
    });

    console.log(`✅ User verified: ${email}`);

    return res.json({
      success: true,
      msg: 'Email verified successfully. You can now login.',
      verified: true
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    await logAuditEvent({ 
      email: req.body.email, 
      action: 'OTP_VERIFY_FAILED', 
      req, 
      details: error.message 
    });

    return res.status(500).json({
      success: false,
      msg: 'Server error during verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== RESEND OTP ====================

/**
 * POST /api/auth/resend-otp
 * Resend OTP to user's email
 */
router.post('/resend-otp', resendOtpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await logAuditEvent({ email, action: 'OTP_RESEND_FAILED', req, details: 'User not found' });
      return res.status(400).json({ msg: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        msg: 'User already verified',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Check if account is locked
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.otpLockedUntil - new Date()) / 60000);
      return res.status(429).json({
        msg: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minute(s).`,
        locked: true,
        minutesRemaining
      });
    }

    // Generate new OTP
    const otpPlain = OTPService.generateOTP();
    const otpHash = await OTPService.hashOTP(otpPlain);
    const otpExpiresAt = new Date(Date.now() + OTP_CONFIG.TTL_MS);

    // Save old values for rollback
    const oldOtp = user.otp;
    const oldOtpExpires = user.otpExpiresAt;

    // Update user with new OTP
    user.otp = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0; // Reset attempts
    user.otpLockedUntil = undefined; // Clear lockout
    await user.save();

    // Send OTP email
    try {
      await OTPService.sendOTPEmail(email, user.name, otpPlain, req);
      
      await logAuditEvent({ 
        userId: user._id, 
        email, 
        action: 'OTP_RESEND_SUCCESS', 
        req, 
        details: 'OTP resent successfully' 
      });

      console.log(`✅ OTP resent to ${email}`);

      return res.json({
        success: true,
        msg: 'OTP resent to your email',
        otpExpiresIn: OTP_CONFIG.TTL_MS / 1000
      });

    } catch (emailError) {
      console.error(`❌ Failed to resend OTP to ${email}:`, emailError.message);

      // Rollback OTP changes
      user.otp = oldOtp;
      user.otpExpiresAt = oldOtpExpires;
      await user.save();

      await logAuditEvent({ 
        userId: user._id, 
        email, 
        action: 'OTP_RESEND_FAILED', 
        req, 
        details: emailError.message 
      });

      return res.status(500).json({
        success: false,
        msg: 'Failed to send OTP email',
        error: 'EMAIL_SEND_FAILED'
      });
    }

  } catch (error) {
    console.error('❌ Resend OTP error:', error.message);
    return res.status(500).json({
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== LOGIN ====================

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await logAuditEvent({ email, action: 'LOGIN_FAILED', req, details: 'User not found' });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({ 
        userId: user._id, 
        email, 
        action: 'LOGIN_FAILED', 
        req, 
        details: 'Invalid password' 
      });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      await logAuditEvent({ 
        userId: user._id, 
        email, 
        action: 'LOGIN_FAILED', 
        req, 
        details: 'Email not verified' 
      });
      return res.status(403).json({ 
        msg: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email
      });
    }

    // Generate JWT token
    const payload = { 
      userId: user._id, 
      email: user.email,
      isAdmin: user.isAdmin || false
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    await logAuditEvent({ 
      userId: user._id, 
      email, 
      action: 'LOGIN_SUCCESS', 
      req 
    });

    console.log(`✅ User logged in: ${email}`);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin || false,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    await logAuditEvent({ 
      email: req.body.email, 
      action: 'LOGIN_FAILED', 
      req, 
      details: error.message 
    });

    return res.status(500).json({
      success: false,
      msg: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== CHECK VERIFICATION STATUS ====================

/**
 * POST /api/auth/check-verification
 * Check if user email is verified
 */
router.post('/check-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ msg: 'Email required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({ 
        exists: false, 
        isVerified: false 
      });
    }

    return res.json({
      exists: true,
      isVerified: user.isVerified,
      email: user.email
    });

  } catch (error) {
    console.error('❌ Check verification error:', error.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// ==================== DEVELOPMENT/DEBUG ROUTES ====================

/**
 * GET /api/auth/debug-config
 * Debug endpoint to check configuration (development only)
 */
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug-config', async (req, res) => {
    const healthStatus = await OTPService.getHealthStatus();
    
    res.json({
      environment: process.env.NODE_ENV,
      emailConfigured: healthStatus.configured,
      emailStatus: healthStatus,
      otpConfig: OTP_CONFIG,
      jwtConfigured: !!process.env.JWT_SECRET,
      mongoConfigured: !!process.env.MONGO_URI
    });
  });
}

module.exports = router;
