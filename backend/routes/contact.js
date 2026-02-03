/**
 * CONTACT ROUTES
 * Handles contact form submissions and inquiries
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email credentials not configured - contact form will not send emails');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('inquiryType').optional().isIn([
      'general', 'product', 'quote', 'support', 'bulk', 'partnership'
    ]).withMessage('Invalid inquiry type')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          msg: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, phone, company, subject, message, inquiryType } = req.body;

      // Get client IP for logging
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      // Log the inquiry
      console.log('📧 Contact Form Submission:');
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Phone: ${phone}`);
      console.log(`   Company: ${company || 'N/A'}`);
      console.log(`   Type: ${inquiryType || 'general'}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   IP: ${clientIp}`);

      // Prepare email content
      const inquiryTypeLabels = {
        general: 'General Inquiry',
        product: 'Product Information',
        quote: 'Quote Request',
        support: 'Technical Support',
        bulk: 'Bulk Order',
        partnership: 'Partnership Opportunity'
      };

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0B74FF; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #0B74FF; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Inquiry Type:</div>
                <div class="value">${inquiryTypeLabels[inquiryType] || 'General Inquiry'}</div>
              </div>
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ${company ? `
              <div class="field">
                <div class="label">Company:</div>
                <div class="value">${company}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="field">
                <div class="label">Submitted:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
              <div class="field">
                <div class="label">IP Address:</div>
                <div class="value">${clientIp}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was automatically generated from the HomeHardware contact form.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email notification to admin
      const transporter = createTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"HomeHardware Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Admin email
            replyTo: email, // User's email for easy reply
            subject: `[Contact Form] ${inquiryTypeLabels[inquiryType] || 'Inquiry'}: ${subject}`,
            html: emailHtml
          });
          console.log('✅ Contact form email sent successfully');
        } catch (emailError) {
          console.error('❌ Error sending contact form email:', emailError.message);
          // Continue anyway - don't fail the request if email fails
        }

        // Send auto-reply to customer
        try {
          const autoReplyHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #0B74FF; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Thank You for Contacting Us</h1>
                </div>
                <div class="content">
                  <p>Dear ${name},</p>
                  <p>Thank you for reaching out to HomeHardware. We have received your inquiry and our team will review it shortly.</p>
                  <p><strong>Your message:</strong></p>
                  <p style="background-color: #f9f9f9; padding: 15px; border-left: 3px solid #0B74FF;">
                    ${message.replace(/\n/g, '<br>')}
                  </p>
                  <p>We typically respond within 24 hours during business hours (Monday-Friday, 8:00 AM - 6:00 PM EST).</p>
                  <p>If you need immediate assistance, please call us at <a href="tel:+917904212501">+91 7904212501</a>.</p>
                  <p>Best regards,<br>
                  <strong>HomeHardware Support Team</strong></p>
                </div>
                <div class="footer">
                  <p>HomeHardware - Professional Commercial Door Hardware Solutions<br>
                  123 Hardware Street, New York, NY 10001<br>
                  Phone: +91 7904212501 | Email: info@homehardware.com</p>
                </div>
              </div>
            </body>
            </html>
          `;

          await transporter.sendMail({
            from: `"HomeHardware Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Thank you for contacting HomeHardware',
            html: autoReplyHtml
          });
          console.log('✅ Auto-reply sent to customer');
        } catch (autoReplyError) {
          console.error('❌ Error sending auto-reply:', autoReplyError.message);
          // Continue anyway
        }
      } else {
        console.log('⚠️  Email not configured - skipping email notification');
      }

      // Save to database (optional - you can create a Contact model if needed)
      // For now, we'll just log it and return success

      res.json({
        success: true,
        msg: 'Thank you for your message. We will get back to you within 24 hours.',
        data: {
          submittedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Contact form error:', error);
      res.status(500).json({
        success: false,
        msg: 'An error occurred while processing your request. Please try again later.'
      });
    }
  }
);

/**
 * @route   GET /api/contact/info
 * @desc    Get contact information
 * @access  Public
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      phone: '+91 7904212501',
      email: 'info@homehardware.com',
      address: {
        street: '123 Hardware Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      },
      businessHours: {
        monday: '8:00 AM - 6:00 PM EST',
        tuesday: '8:00 AM - 6:00 PM EST',
        wednesday: '8:00 AM - 6:00 PM EST',
        thursday: '8:00 AM - 6:00 PM EST',
        friday: '8:00 AM - 6:00 PM EST',
        saturday: '9:00 AM - 4:00 PM EST',
        sunday: 'Closed'
      }
    }
  });
});

module.exports = router;
