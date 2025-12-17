/**
 * OTP Service Module
 * Provides secure OTP generation, email sending, and verification
 * with comprehensive error handling and monitoring
 */

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { logAuditEvent } = require('../utils/auditLogger');

// Configuration Constants
const OTP_CONFIG = {
  LENGTH: 6,
  TTL_MS: 10 * 60 * 1000, // 10 minutes
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  HASH_ROUNDS: 10,
  EMAIL_TIMEOUT: 30000, // 30 seconds
};

// Email Templates
const EMAIL_TEMPLATES = {
  verification: (name, otp) => ({
    subject: 'Your Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; }
          .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: 600; }
          .info-item { margin: 10px 0; }
          .info-label { font-weight: 600; color: #495057; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Email Verification</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name || 'there'}</strong>,</p>
            <p>Thank you for registering! To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #6c757d;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; font-size: 12px; color: #6c757d; margin-top: 10px;">Enter this code in the verification form</p>
            </div>

            <div class="warning">
              ⚠️ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
            </div>

            <div class="info-item">
              <span class="info-label">Security Tips:</span>
              <ul style="margin-top: 5px;">
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for your verification code</li>
                <li>If you didn't request this, secure your account immediately</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name || 'there'},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
  }),

  passwordReset: (name, resetLink) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            <div class="warning">
              ⚠️ This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}">${resetLink}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nYou requested a password reset. Click this link: ${resetLink}\n\nThis link expires in 1 hour.`
  })
};

/**
 * Email Transporter Factory
 * Creates a properly configured nodemailer transporter with fallback options
 */
class EmailTransporter {
  constructor() {
    this.transporter = null;
    this.isVerified = false;
    this.lastError = null;
    this.config = this.getConfig();
  }

  getConfig() {
    // Support multiple email providers
    const provider = process.env.EMAIL_PROVIDER || 'gmail';
    
    const configs = {
      gmail: {
        host: 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true' || (!process.env.SMTP_PORT || parseInt(process.env.SMTP_PORT) === 465), // SSL for 465, TLS for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 30000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
          minVersion: 'TLSv1.2'
        }
      },
      sendgrid: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      },
      mailgun: {
        host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILGUN_SMTP_USER,
          pass: process.env.MAILGUN_SMTP_PASS
        }
      },
      custom: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    };

    return configs[provider] || configs.gmail;
  }

  async initialize() {
    try {
      this.transporter = nodemailer.createTransport(this.config);
      
      // Verify connection in background (non-blocking)
      if (process.env.VERIFY_EMAIL_ON_STARTUP !== 'false') {
        this.verify().catch(err => {
          console.warn('⚠️  Email verification failed (will retry on send):', err.message);
        });
      }
      
      return this.transporter;
    } catch (error) {
      this.lastError = error;
      console.error('❌ Failed to initialize email transporter:', error.message);
      throw error;
    }
  }

  async verify() {
    try {
      if (!this.transporter) {
        await this.initialize();
      }
      
      await this.transporter.verify();
      this.isVerified = true;
      this.lastError = null;
      console.log('✅ Email transporter verified successfully');
      return true;
    } catch (error) {
      this.isVerified = false;
      this.lastError = error;
      console.error('❌ Email verification failed:', error.message);
      
      // Provide helpful error messages
      if (error.code === 'EAUTH') {
        console.error('   → Invalid email credentials. Check EMAIL_USER and EMAIL_PASS');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        console.error('   → Cannot connect to email server. Check firewall/network settings');
      }
      
      throw error;
    }
  }

  getTransporter() {
    return this.transporter;
  }

  getStatus() {
    return {
      isVerified: this.isVerified,
      lastError: this.lastError ? this.lastError.message : null,
      config: {
        provider: process.env.EMAIL_PROVIDER || 'gmail',
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        user: this.config.auth.user
      }
    };
  }
}

// Singleton instance
const emailTransporter = new EmailTransporter();

/**
 * OTP Service Class
 * Handles all OTP-related operations with security and monitoring
 */
class OTPService {
  /**
   * Generate a secure random OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Hash OTP for secure storage
   */
  static async hashOTP(otp) {
    return await bcrypt.hash(otp, OTP_CONFIG.HASH_ROUNDS);
  }

  /**
   * Verify OTP against stored hash
   */
  static async verifyOTP(plainOTP, hashedOTP) {
    return await bcrypt.compare(plainOTP, hashedOTP);
  }

  /**
   * Send OTP email with comprehensive error handling
   */
  static async sendOTPEmail(email, name, otp, req = null) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const startTime = Date.now();

    // Development mode: Always log OTP to console
    if (isDevelopment) {
      this.logOTPToConsole(email, name, otp);
    }

    try {
      // Get or initialize transporter
      let transporter = emailTransporter.getTransporter();
      if (!transporter) {
        transporter = await emailTransporter.initialize();
      }

      // Prepare email
      const template = EMAIL_TEMPLATES.verification(name, otp);
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'No-Reply'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        headers: {
          'X-Request-ID': req?.requestId || 'no-request-id',
          'X-Mailer': 'OTP-Service-v1.0'
        }
      };

      // Send email with timeout
      const result = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout')), OTP_CONFIG.EMAIL_TIMEOUT)
        )
      ]);

      const duration = Date.now() - startTime;
      
      // Log success
      console.log(`✅ OTP email sent to ${email} (${duration}ms)`);
      if (req) {
        await logAuditEvent({
          email,
          action: 'OTP_EMAIL_SENT',
          req,
          details: `Email sent successfully in ${duration}ms`
        });
      }

      return {
        success: true,
        messageId: result.messageId,
        duration,
        result
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Enhanced error logging
      console.error(`❌ Failed to send OTP email to ${email} (${duration}ms):`, error.message);
      
      // Log specific error types
      if (error.code === 'EAUTH') {
        console.error('   → Authentication failed. Check EMAIL_USER and EMAIL_PASS');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('   → Connection timeout. Check SMTP_HOST and firewall settings');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('   → Connection refused. SMTP server may be down');
      } else if (error.responseCode >= 500) {
        console.error('   → Server error. Try again later');
      }

      if (req) {
        await logAuditEvent({
          email,
          action: 'OTP_EMAIL_FAILED',
          req,
          details: `Failed: ${error.message} (${error.code || 'no-code'})`
        });
      }

      // In development, don't fail registration if email fails
      if (isDevelopment) {
        console.log('⚠️  Development mode: Continuing despite email failure (OTP logged to console)');
        return {
          success: true,
          devMode: true,
          message: 'Development mode - check console for OTP',
          error: error.message
        };
      }

      // In production, throw the error
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email, name, resetLink, req = null) {
    try {
      let transporter = emailTransporter.getTransporter();
      if (!transporter) {
        transporter = await emailTransporter.initialize();
      }

      const template = EMAIL_TEMPLATES.passwordReset(name, resetLink);
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'No-Reply'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);

      if (req) {
        await logAuditEvent({
          email,
          action: 'PASSWORD_RESET_EMAIL_SENT',
          req,
          details: 'Reset email sent successfully'
        });
      }

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
      
      if (req) {
        await logAuditEvent({
          email,
          action: 'PASSWORD_RESET_EMAIL_FAILED',
          req,
          details: error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * Log OTP to console in development (formatted for visibility)
   */
  static logOTPToConsole(email, name, otp) {
    const border = '█'.repeat(70);
    const emptyLine = '█' + ' '.repeat(68) + '█';
    
    console.log('\n' + border);
    console.log(emptyLine);
    console.log('█  📧 OTP EMAIL (DEVELOPMENT MODE)' + ' '.repeat(33) + '█');
    console.log(emptyLine);
    console.log(border);
    console.log('█  To: ' + email.padEnd(62) + '█');
    console.log('█  Name: ' + (name || 'N/A').padEnd(60) + '█');
    console.log(emptyLine);
    console.log('█  🔑 OTP CODE: ' + otp.padEnd(51) + '█');
    console.log(emptyLine);
    console.log('█  ⏰ Expires: 10 minutes' + ' '.repeat(43) + '█');
    console.log(emptyLine);
    console.log(border + '\n');
  }

  /**
   * Validate OTP attempt and check for lockout
   */
  static validateOTPAttempt(user) {
    // Check if account is locked
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.otpLockedUntil - new Date()) / 60000);
      return {
        valid: false,
        locked: true,
        minutesRemaining,
        message: `Account locked. Try again in ${minutesRemaining} minute(s).`
      };
    }

    // Check if OTP exists and hasn't expired
    if (!user.otp || !user.otpExpiresAt) {
      return {
        valid: false,
        expired: true,
        message: 'No OTP found. Please request a new one.'
      };
    }

    if (user.otpExpiresAt < new Date()) {
      return {
        valid: false,
        expired: true,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    return { valid: true };
  }

  /**
   * Handle failed OTP attempt
   */
  static async handleFailedAttempt(user) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    
    // Lock account after max attempts
    if (user.otpAttempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      user.otpLockedUntil = new Date(Date.now() + OTP_CONFIG.LOCKOUT_DURATION_MS);
      await user.save();
      
      return {
        locked: true,
        message: 'Too many failed attempts. Account locked for 15 minutes.',
        lockoutUntil: user.otpLockedUntil
      };
    }
    
    await user.save();
    const attemptsRemaining = OTP_CONFIG.MAX_ATTEMPTS - user.otpAttempts;
    
    return {
      locked: false,
      attemptsRemaining,
      message: `Invalid OTP. ${attemptsRemaining} attempt(s) remaining.`
    };
  }

  /**
   * Reset OTP attempts after successful verification
   */
  static async resetOTPAttempts(user) {
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    await user.save();
  }

  /**
   * Get email service health status
   */
  static async getHealthStatus() {
    return {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      ...emailTransporter.getStatus(),
      config: OTP_CONFIG
    };
  }
}

// Initialize transporter on module load (non-blocking)
emailTransporter.initialize().catch(err => {
  console.warn('⚠️  Email transporter initialization delayed:', err.message);
});

module.exports = {
  OTPService,
  OTP_CONFIG,
  emailTransporter
};
