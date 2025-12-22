// Abandoned cart recovery and marketing routes
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Save cart for later (for abandoned cart recovery)
 * POST /api/marketing/save-cart
 */
router.post('/save-cart', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.userId;

    await User.findByIdAndUpdate(userId, {
      savedCart: items,
      cartSavedAt: new Date()
    });

    // Schedule abandoned cart email (1 hour later)
    setTimeout(async () => {
      try {
        const user = await User.findById(userId);
        if (user && user.savedCart && user.savedCart.length > 0) {
          // Check if cart is still saved (user hasn't completed purchase)
          await sendAbandonedCartEmail(user.email, user.username, user.savedCart);
        }
      } catch (error) {
        console.error('Abandoned cart email error:', error);
      }
    }, 3600000); // 1 hour

    res.json({
      success: true,
      msg: 'Cart saved successfully'
    });
  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to save cart',
      error: error.message
    });
  }
});

/**
 * Exit intent popup signup
 * POST /api/marketing/exit-intent-signup
 */
router.post('/exit-intent-signup', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        msg: 'Valid email is required'
      });
    }

    // Send welcome email with discount code
    const discountCode = 'WELCOME10';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎁 Your 10% Discount Code - Welcome to HomeHardware!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .discount-code { background: #fff; border: 3px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to HomeHardware!</h1>
              <p>Thank you for joining our community</p>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>We're excited to have you with us! As promised, here's your exclusive discount code:</p>
              
              <div class="discount-code">
                ${discountCode}
              </div>
              
              <p><strong>Save 10% on your first order!</strong></p>
              <p>Use this code at checkout to get 10% off your entire purchase. No minimum order required.</p>
              
              <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL}" class="button">Start Shopping</a>
              </p>
              
              <p>Happy shopping!<br>The HomeHardware Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you signed up on our website.</p>
              <p>HomeHardware © ${new Date().getFullYear()}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      msg: 'Discount code sent to your email'
    });
  } catch (error) {
    console.error('Exit intent signup error:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to process signup',
      error: error.message
    });
  }
});

/**
 * Newsletter signup
 * POST /api/marketing/newsletter-signup
 */
router.post('/newsletter-signup', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        msg: 'Valid email is required'
      });
    }

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ Newsletter Subscription Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to HomeHardware Newsletter!</h2>
          <p>Hi ${name || 'there'},</p>
          <p>You've successfully subscribed to our newsletter. You'll now receive:</p>
          <ul>
            <li>Exclusive deals and promotions</li>
            <li>New product announcements</li>
            <li>Helpful tips and guides</li>
            <li>Early access to sales</li>
          </ul>
          <p>Thank you for joining our community!</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            To unsubscribe, <a href="${process.env.CLIENT_URL}/unsubscribe?email=${email}">click here</a>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      msg: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to subscribe',
      error: error.message
    });
  }
});

// Helper function to send abandoned cart email
async function sendAbandonedCartEmail(email, username, cartItems) {
  const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const itemsHtml = cartItems.map(item => `
    <tr>
      <td style="padding: 10px;">
        <img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 10px;">
        <strong>${item.name}</strong><br>
        <span style="color: #999;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 10px; text-align: right;">
        <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🛒 You left items in your cart!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .cart-items { background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; }
          .cart-items table { width: 100%; border-collapse: collapse; }
          .total { background: #667eea; color: white; padding: 15px; text-align: right; font-size: 20px; font-weight: bold; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Don't forget your items!</h1>
          </div>
          <div class="content">
            <p>Hi ${username},</p>
            <p>You left some great items in your cart. Complete your purchase now before they're gone!</p>
            
            <div class="cart-items">
              <table>
                ${itemsHtml}
              </table>
              <div class="total">
                Total: $${totalValue.toFixed(2)}
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/#cart" class="button">Complete Your Purchase</a>
            </p>
            
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              💡 <strong>Tip:</strong> Items in your cart are reserved for 24 hours.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Abandoned cart email sent to ${email}`);
}

module.exports = router;
