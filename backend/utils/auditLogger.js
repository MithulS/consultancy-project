// Audit logging utility
const AuditLog = require('../models/auditLog');

/**
 * Log an audit event
 * @param {Object} params - Event parameters
 * @param {String} params.userId - User ID (optional)
 * @param {String} params.email - User email
 * @param {String} params.action - Action type (from AuditLog enum)
 * @param {Object} params.req - Express request object (optional)
 * @param {String} params.details - Additional details (optional)
 */
async function logAuditEvent({ userId, email, action, req, details }) {
  try {
    const ipAddress = req ? getClientIP(req) : null;
    const userAgent = req ? req.get('user-agent') : null;

    const auditLog = new AuditLog({
      userId,
      email,
      action,
      ipAddress,
      userAgent,
      details: details || null
    });

    await auditLog.save();
    console.log(`[AUDIT] ${action} - ${email} - ${ipAddress}`);
  } catch (error) {
    console.error('Failed to log audit event:', error.message);
    // Don't throw - audit logging failure shouldn't break the app
  }
}

/**
 * Get client IP address from request (handles proxies)
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Get recent failed login attempts for an email
 */
async function getRecentFailedAttempts(email, minutes = 15) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  const count = await AuditLog.countDocuments({
    email,
    action: { $in: ['LOGIN_FAILED', 'OTP_VERIFY_FAILED'] },
    timestamp: { $gte: since }
  });

  return count;
}

/**
 * Check if IP address has too many failed attempts
 */
async function checkIPRateLimit(req, maxAttempts = 10, minutes = 15) {
  const ipAddress = getClientIP(req);
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  const count = await AuditLog.countDocuments({
    ipAddress,
    action: { $in: ['REGISTER_FAILED', 'LOGIN_FAILED', 'OTP_VERIFY_FAILED'] },
    timestamp: { $gte: since }
  });

  return count >= maxAttempts;
}

module.exports = {
  logAuditEvent,
  getClientIP,
  getRecentFailedAttempts,
  checkIPRateLimit
};
