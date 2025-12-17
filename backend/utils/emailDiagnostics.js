/**
 * Email Configuration Diagnostics
 * Validates email setup and provides troubleshooting guidance
 */

const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const net = require('net');

/**
 * Email Configuration Validator
 */
class EmailDiagnostics {
  
  /**
   * Run comprehensive email diagnostics
   */
  static async runFullDiagnostics() {
    console.log('\n' + '='.repeat(70));
    console.log('📧 EMAIL CONFIGURATION DIAGNOSTICS');
    console.log('='.repeat(70) + '\n');

    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        envVariables: await this.checkEnvironmentVariables(),
        smtpConnection: await this.checkSMTPConnection(),
        dnsResolution: await this.checkDNSResolution(),
        authentication: await this.checkAuthentication(),
        testEmail: null
      },
      recommendations: []
    };

    // Generate recommendations based on results
    results.recommendations = this.generateRecommendations(results.checks);

    // Print summary
    this.printDiagnosticsSummary(results);

    return results;
  }

  /**
   * Check if required environment variables are set
   */
  static async checkEnvironmentVariables() {
    const check = {
      name: 'Environment Variables',
      status: 'unknown',
      details: {},
      issues: []
    };

    try {
      const requiredVars = ['EMAIL_USER', 'EMAIL_PASS'];
      const optionalVars = ['EMAIL_PROVIDER', 'EMAIL_FROM_NAME', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE'];

      // Check required variables
      requiredVars.forEach(varName => {
        const value = process.env[varName];
        check.details[varName] = value ? '✅ SET' : '❌ NOT SET';
        if (!value) {
          check.issues.push(`${varName} is not set`);
        }
      });

      // Check optional variables
      optionalVars.forEach(varName => {
        const value = process.env[varName];
        check.details[varName] = value ? `✅ ${value}` : '⚠️  Using default';
      });

      // Validate email format
      if (process.env.EMAIL_USER) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(process.env.EMAIL_USER)) {
          check.issues.push('EMAIL_USER is not a valid email format');
        }
      }

      // Validate password length
      if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.length < 8) {
        check.issues.push('EMAIL_PASS seems too short (less than 8 characters)');
      }

      check.status = check.issues.length === 0 ? 'passed' : 'failed';
    } catch (error) {
      check.status = 'error';
      check.error = error.message;
    }

    return check;
  }

  /**
   * Check SMTP connection
   */
  static async checkSMTPConnection() {
    const check = {
      name: 'SMTP Connection',
      status: 'unknown',
      details: {},
      issues: []
    };

    try {
      const provider = process.env.EMAIL_PROVIDER || 'gmail';
      const smtpConfigs = {
        gmail: { 
          host: 'smtp.gmail.com', 
          port: parseInt(process.env.SMTP_PORT) || 465 
        },
        sendgrid: { host: 'smtp.sendgrid.net', port: 587 },
        mailgun: { host: 'smtp.mailgun.org', port: 587 },
        custom: { 
          host: process.env.SMTP_HOST || 'unknown', 
          port: parseInt(process.env.SMTP_PORT) || 587 
        }
      };

      const config = smtpConfigs[provider] || smtpConfigs.gmail;
      check.details.provider = provider;
      check.details.host = config.host;
      check.details.port = config.port;

      // Test TCP connection
      const connectionResult = await this.testTCPConnection(config.host, config.port);
      check.details.tcpConnection = connectionResult.success ? '✅ SUCCESS' : '❌ FAILED';
      
      if (!connectionResult.success) {
        check.issues.push(`Cannot connect to ${config.host}:${config.port} - ${connectionResult.error}`);
      }

      check.status = check.issues.length === 0 ? 'passed' : 'failed';
    } catch (error) {
      check.status = 'error';
      check.error = error.message;
    }

    return check;
  }

  /**
   * Test TCP connection to SMTP server
   */
  static testTCPConnection(host, port, timeout = 5000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      const onError = (error) => {
        socket.destroy();
        resolve({ success: false, error: error.message });
      };

      const onTimeout = () => {
        socket.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      };

      socket.setTimeout(timeout);
      socket.once('error', onError);
      socket.once('timeout', onTimeout);

      socket.connect(port, host, () => {
        socket.destroy();
        resolve({ success: true });
      });
    });
  }

  /**
   * Check DNS resolution for SMTP server
   */
  static async checkDNSResolution() {
    const check = {
      name: 'DNS Resolution',
      status: 'unknown',
      details: {},
      issues: []
    };

    try {
      const provider = process.env.EMAIL_PROVIDER || 'gmail';
      const host = provider === 'gmail' ? 'smtp.gmail.com' : 
                   provider === 'sendgrid' ? 'smtp.sendgrid.net' :
                   provider === 'mailgun' ? 'smtp.mailgun.org' :
                   process.env.SMTP_HOST || 'smtp.gmail.com';

      check.details.host = host;

      // Resolve hostname
      const addresses = await dns.resolve4(host);
      check.details.resolved = `✅ ${addresses.join(', ')}`;
      check.details.addressCount = addresses.length;

      // Check MX records for email domain
      if (process.env.EMAIL_USER) {
        const domain = process.env.EMAIL_USER.split('@')[1];
        try {
          const mxRecords = await dns.resolveMx(domain);
          check.details.mxRecords = `✅ ${mxRecords.length} record(s)`;
        } catch (mxError) {
          check.issues.push(`Cannot resolve MX records for ${domain}`);
        }
      }

      check.status = check.issues.length === 0 ? 'passed' : 'warning';
    } catch (error) {
      check.status = 'error';
      check.error = error.message;
      check.issues.push(`DNS resolution failed: ${error.message}`);
    }

    return check;
  }

  /**
   * Check SMTP authentication
   */
  static async checkAuthentication() {
    const check = {
      name: 'SMTP Authentication',
      status: 'unknown',
      details: {},
      issues: []
    };

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        check.status = 'skipped';
        check.details.reason = 'EMAIL_USER or EMAIL_PASS not set';
        return check;
      }

      const provider = process.env.EMAIL_PROVIDER || 'gmail';
      const defaultPort = provider === 'gmail' ? 465 : 587;
      const port = parseInt(process.env.SMTP_PORT) || defaultPort;
      
      const config = {
        host: provider === 'gmail' ? 'smtp.gmail.com' : 
              provider === 'sendgrid' ? 'smtp.sendgrid.net' :
              provider === 'mailgun' ? 'smtp.mailgun.org' :
              process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000,
        tls: { rejectUnauthorized: false }
      };

      check.details.config = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user
      };

      // Create transporter and verify
      const transporter = nodemailer.createTransport(config);
      
      try {
        await transporter.verify();
        check.status = 'passed';
        check.details.authentication = '✅ SUCCESS';
      } catch (verifyError) {
        check.status = 'failed';
        check.details.authentication = '❌ FAILED';
        
        // Provide specific error guidance
        if (verifyError.code === 'EAUTH') {
          check.issues.push('Authentication failed - check credentials');
          check.issues.push('For Gmail: Ensure "App Password" is used, not regular password');
        } else if (verifyError.code === 'ETIMEDOUT') {
          check.issues.push('Connection timeout - check firewall/network');
        } else if (verifyError.code === 'ECONNREFUSED') {
          check.issues.push('Connection refused - SMTP server may be down');
        } else {
          check.issues.push(`Verification failed: ${verifyError.message}`);
        }
      }
    } catch (error) {
      check.status = 'error';
      check.error = error.message;
    }

    return check;
  }

  /**
   * Send a test email
   */
  static async sendTestEmail(toEmail = null) {
    const check = {
      name: 'Test Email',
      status: 'unknown',
      details: {},
      issues: []
    };

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        check.status = 'skipped';
        check.details.reason = 'Email not configured';
        return check;
      }

      const recipient = toEmail || process.env.EMAIL_USER;
      const provider = process.env.EMAIL_PROVIDER || 'gmail';
      
      const config = {
        host: provider === 'gmail' ? 'smtp.gmail.com' : 
              provider === 'sendgrid' ? 'smtp.sendgrid.net' :
              process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || (provider === 'gmail' ? 465 : 587),
        secure: provider === 'gmail' || process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
      };

      const transporter = nodemailer.createTransport(config);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'Test Email - Configuration Check',
        html: `
          <h2>✅ Email Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Provider:</strong> ${provider}</p>
          <p>If you received this email, your email configuration is working correctly!</p>
        `,
        text: 'Email configuration test successful!'
      };

      const info = await transporter.sendMail(mailOptions);
      
      check.status = 'passed';
      check.details.recipient = recipient;
      check.details.messageId = info.messageId;
      check.details.response = '✅ Email sent successfully';
    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
      check.issues.push(`Failed to send test email: ${error.message}`);
    }

    return check;
  }

  /**
   * Generate recommendations based on diagnostic results
   */
  static generateRecommendations(checks) {
    const recommendations = [];

    // Environment variables recommendations
    if (checks.envVariables.status === 'failed') {
      recommendations.push({
        priority: 'HIGH',
        category: 'Configuration',
        message: 'Set required environment variables (EMAIL_USER, EMAIL_PASS)',
        action: 'Update your .env file with valid email credentials'
      });
    }

    // SMTP connection recommendations
    if (checks.smtpConnection.status === 'failed') {
      recommendations.push({
        priority: 'HIGH',
        category: 'Network',
        message: 'SMTP connection failed',
        action: 'Check firewall settings, try different port (465 or 587), or use mobile hotspot'
      });
    }

    // Authentication recommendations
    if (checks.authentication.status === 'failed') {
      if (checks.authentication.issues.some(i => i.includes('EAUTH'))) {
        recommendations.push({
          priority: 'HIGH',
          category: 'Credentials',
          message: 'Authentication failed - invalid credentials',
          action: 'For Gmail: Generate App Password at https://myaccount.google.com/apppasswords'
        });
      }
    }

    // DNS recommendations
    if (checks.dnsResolution.status === 'error') {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Network',
        message: 'DNS resolution issues detected',
        action: 'Check internet connection or try alternative DNS (8.8.8.8)'
      });
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'INFO',
        category: 'Success',
        message: 'All checks passed successfully',
        action: 'Email configuration is working correctly'
      });
    }

    return recommendations;
  }

  /**
   * Print diagnostics summary to console
   */
  static printDiagnosticsSummary(results) {
    console.log('\n📊 DIAGNOSTIC RESULTS\n');
    
    Object.values(results.checks).forEach(check => {
      if (!check) return;
      
      const statusEmoji = check.status === 'passed' ? '✅' :
                         check.status === 'failed' ? '❌' :
                         check.status === 'warning' ? '⚠️' :
                         check.status === 'skipped' ? '⏭️' : '❓';
      
      console.log(`${statusEmoji} ${check.name}: ${check.status.toUpperCase()}`);
      
      if (check.details && Object.keys(check.details).length > 0) {
        Object.entries(check.details).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      
      if (check.issues && check.issues.length > 0) {
        check.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
      
      if (check.error) {
        console.log(`   ❌ Error: ${check.error}`);
      }
      
      console.log('');
    });

    // Print recommendations
    if (results.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS\n');
      results.recommendations.forEach((rec, index) => {
        const priorityEmoji = rec.priority === 'HIGH' ? '🔴' :
                            rec.priority === 'MEDIUM' ? '🟡' : '🟢';
        console.log(`${index + 1}. ${priorityEmoji} [${rec.priority}] ${rec.category}`);
        console.log(`   ${rec.message}`);
        console.log(`   → ${rec.action}\n`);
      });
    }

    console.log('='.repeat(70) + '\n');
  }

  /**
   * Quick health check (for monitoring)
   */
  static async quickHealthCheck() {
    try {
      const envCheck = await this.checkEnvironmentVariables();
      const authCheck = await this.checkAuthentication();
      
      return {
        healthy: envCheck.status === 'passed' && authCheck.status === 'passed',
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        status: {
          environment: envCheck.status,
          authentication: authCheck.status
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = EmailDiagnostics;
