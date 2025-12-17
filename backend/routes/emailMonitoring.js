/**
 * Email Monitoring and Health Check Route
 * Provides endpoints for monitoring email service health
 */

const express = require('express');
const router = express.Router();
const { OTPService, emailTransporter } = require('../services/otpService');
const EmailDiagnostics = require('../utils/emailDiagnostics');

/**
 * GET /api/email/health
 * Quick health check for email service
 */
router.get('/health', async (req, res) => {
  try {
    const health = await EmailDiagnostics.quickHealthCheck();
    const serviceStatus = await OTPService.getHealthStatus();
    
    const response = {
      status: health.healthy ? 'healthy' : 'unhealthy',
      configured: health.configured,
      checks: health.status,
      service: serviceStatus,
      timestamp: new Date().toISOString()
    };

    const statusCode = health.healthy ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/email/diagnostics
 * Run full email diagnostics (admin only in production)
 */
router.post('/diagnostics', async (req, res) => {
  try {
    // In production, add authentication middleware here
    if (process.env.NODE_ENV === 'production' && !req.user?.isAdmin) {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    const results = await EmailDiagnostics.runFullDiagnostics();
    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/email/test
 * Send a test email (development/testing only)
 */
router.post('/test', async (req, res) => {
  try {
    // Only allow in non-production or for admins
    if (process.env.NODE_ENV === 'production' && !req.user?.isAdmin) {
      return res.status(403).json({ msg: 'Not available in production' });
    }

    const { email } = req.body;
    const result = await EmailDiagnostics.sendTestEmail(email);
    
    if (result.status === 'passed') {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        details: result.details
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
        issues: result.issues
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/email/config
 * Get current email configuration (sanitized)
 */
router.get('/config', async (req, res) => {
  try {
    // In production, add authentication middleware
    if (process.env.NODE_ENV === 'production' && !req.user?.isAdmin) {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    const status = emailTransporter.getStatus();
    res.json({
      ...status,
      environment: process.env.NODE_ENV,
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/verify-transporter
 * Manually verify email transporter
 */
router.post('/verify-transporter', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && !req.user?.isAdmin) {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    await emailTransporter.verify();
    res.json({
      success: true,
      message: 'Email transporter verified successfully',
      status: emailTransporter.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email transporter verification failed',
      error: error.message
    });
  }
});

module.exports = router;
