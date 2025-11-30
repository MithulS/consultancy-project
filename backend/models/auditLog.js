// Audit Log model for tracking security events
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'REGISTER_SUCCESS',
      'REGISTER_FAILED',
      'OTP_SENT',
      'OTP_VERIFY_SUCCESS',
      'OTP_VERIFY_FAILED',
      'OTP_RESEND',
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'FORGOT_PASSWORD',
      'RESET_PASSWORD_SUCCESS',
      'RESET_PASSWORD_FAILED',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED'
    ]
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: String }, // Additional information about the event
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false }); // Using custom timestamp field

// Index for efficient querying
auditLogSchema.index({ email: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
