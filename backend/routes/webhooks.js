// Stripe & Razorpay webhook handlers
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/order');
const logger = require('../config/logger');

let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('❌ Stripe initialization error:', error.message);
}

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 * 
 * Important: This must use express.raw() middleware, not express.json()
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        await handleRefund(refund);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription events if you add subscription features
        logger.info(`Subscription event: ${event.type}`);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const order = await Order.findOne({
      paymentIntentId: paymentIntent.id
    });

    if (order) {
      order.status = 'processing';
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      
      // Add to tracking history
      if (!order.trackingHistory) {
        order.trackingHistory = [];
      }
      order.trackingHistory.push({
        status: 'processing',
        description: 'Payment received successfully',
        timestamp: new Date()
      });

      await order.save();

      logger.info(`Payment succeeded for order ${order._id}`);

      // TODO: Send confirmation email
      // await sendOrderConfirmationEmail(order);
    } else {
      logger.warn(`Order not found for payment intent: ${paymentIntent.id}`);
    }
  } catch (error) {
    logger.error('Handle payment success error:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  try {
    const order = await Order.findOne({
      paymentIntentId: paymentIntent.id
    });

    if (order) {
      order.status = 'payment_failed';
      order.paymentStatus = 'failed';
      order.notes = `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`;
      
      await order.save();

      logger.warn(`Payment failed for order ${order._id}`);

      // TODO: Send payment failure email
      // await sendPaymentFailureEmail(order);
    }
  } catch (error) {
    logger.error('Handle payment failure error:', error);
  }
}

/**
 * Handle refund
 */
async function handleRefund(charge) {
  try {
    // Try to find order by payment intent from the charge
    const order = await Order.findOne({
      paymentIntentId: charge.payment_intent
    });

    if (order) {
      order.status = 'refunded';
      order.paymentStatus = 'refunded';
      order.refundedAt = new Date();
      order.refundAmount = charge.amount_refunded / 100; // Convert from cents
      
      if (!order.trackingHistory) {
        order.trackingHistory = [];
      }
      order.trackingHistory.push({
        status: 'refunded',
        description: `Refund processed: $${(charge.amount_refunded / 100).toFixed(2)}`,
        timestamp: new Date()
      });

      await order.save();

      logger.info(`Refund processed for order ${order._id}`);

      // TODO: Send refund confirmation email
      // await sendRefundEmail(order);
    }
  } catch (error) {
    logger.error('Handle refund error:', error);
  }
}

/**
 * Razorpay Webhook Handler
 * POST /api/webhooks/razorpay
 * 
 * Important: This must use express.raw() middleware for signature verification
 */
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('Razorpay webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Verify webhook signature
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    logger.error('Missing Razorpay webhook signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  const body = typeof req.body === 'string' ? req.body : req.body.toString();

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    logger.error('Razorpay webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Parse the event
  let event;
  try {
    event = JSON.parse(body);
  } catch (err) {
    logger.error('Failed to parse Razorpay webhook body:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  try {
    switch (event.event) {
      case 'payment.authorized':
        await handleRazorpayPaymentAuthorized(event.payload.payment.entity);
        break;

      case 'payment.captured':
        await handleRazorpayPaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handleRazorpayPaymentFailed(event.payload.payment.entity);
        break;

      case 'refund.processed':
        await handleRazorpayRefund(event.payload.refund.entity);
        break;

      default:
        logger.info(`Unhandled Razorpay event: ${event.event}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Razorpay webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle Razorpay payment authorized
 */
async function handleRazorpayPaymentAuthorized(payment) {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      logger.info(`Razorpay payment authorized for order ${order._id}: ${payment.id}`);
    }
  } catch (error) {
    logger.error('Handle Razorpay payment authorized error:', error);
  }
}

/**
 * Handle Razorpay payment captured (confirmed)
 */
async function handleRazorpayPaymentCaptured(payment) {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      order.razorpayPaymentId = payment.id;

      if (!order.trackingHistory) {
        order.trackingHistory = [];
      }
      order.trackingHistory.push({
        status: 'confirmed',
        description: `Payment captured via Razorpay: ₹${(payment.amount / 100).toFixed(2)}`,
        timestamp: new Date()
      });

      await order.save();
      logger.info(`Razorpay payment captured for order ${order._id}`);
    } else {
      logger.warn(`Order not found for Razorpay order: ${payment.order_id}`);
    }
  } catch (error) {
    logger.error('Handle Razorpay payment captured error:', error);
  }
}

/**
 * Handle Razorpay payment failed
 */
async function handleRazorpayPaymentFailed(payment) {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      order.cancelReason = `Payment failed: ${payment.error_description || 'Unknown error'}`;

      await order.save();
      logger.warn(`Razorpay payment failed for order ${order._id}`);
    }
  } catch (error) {
    logger.error('Handle Razorpay payment failed error:', error);
  }
}

/**
 * Handle Razorpay refund
 */
async function handleRazorpayRefund(refund) {
  try {
    const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
    if (order) {
      order.paymentStatus = 'refunded';
      order.status = 'returned';

      if (!order.trackingHistory) {
        order.trackingHistory = [];
      }
      order.trackingHistory.push({
        status: 'returned',
        description: `Refund processed via Razorpay: ₹${(refund.amount / 100).toFixed(2)}`,
        timestamp: new Date()
      });

      await order.save();
      logger.info(`Razorpay refund processed for order ${order._id}`);
    }
  } catch (error) {
    logger.error('Handle Razorpay refund error:', error);
  }
}

module.exports = router;
