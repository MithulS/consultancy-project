// Payment routes - Stripe integration
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Order = require('../models/order');
const Product = require('../models/product');
const { checkStockAvailability, reserveStock } = require('../utils/inventoryManager');

// Note: Install Stripe with: npm install stripe
// Add to .env: STRIPE_SECRET_KEY=sk_test_...

let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('⚠️  Stripe: STRIPE_SECRET_KEY not found in .env file');
  }
} catch (error) {
  console.error('❌ Stripe initialization error:', error.message);
}

/**
 * Create payment intent for Stripe checkout
 * POST /api/payments/create-intent
 */
router.post('/create-intent', verifyToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        msg: 'Stripe is not configured. Please install stripe package and set STRIPE_SECRET_KEY'
      });
    }

    const { items, shippingAddress } = req.body;
    const userId = req.user.userId;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Cart is empty'
      });
    }

    // Check stock availability
    const stockCheck = await checkStockAvailability(items);
    const unavailableItems = stockCheck.filter(item => !item.available);

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        msg: 'Some items are unavailable',
        unavailableItems: unavailableItems.map(item => ({
          product: item.productName,
          requested: item.requestedQuantity,
          available: item.availableStock
        }))
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          msg: `Product not found: ${item.productId}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: userId.toString(),
        itemCount: items.length
      },
      description: `ElectroStore - ${items.length} item(s)`
    });

    // Create pending order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      stockReserved: false,
      stockDeducted: false
    });

    await order.save();

    // Reserve stock
    try {
      for (const item of items) {
        await reserveStock(item.productId, item.quantity, order._id);
      }
      order.stockReserved = true;
      await order.save();
    } catch (error) {
      console.error('Stock reservation failed:', error);
    }

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: totalAmount
    });

  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to create payment',
      error: error.message
    });
  }
});

/**
 * Confirm payment and update order status
 * POST /api/payments/confirm
 */
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        msg: 'Stripe not configured'
      });
    }

    const { paymentIntentId, orderId } = req.body;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        msg: 'Payment not completed',
        status: paymentIntent.status
      });
    }

    // Update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Order not found'
      });
    }

    order.paymentStatus = 'completed';
    order.status = 'processing';
    await order.save();

    res.json({
      success: true,
      msg: 'Payment confirmed',
      order: {
        id: order._id,
        status: order.status,
        totalAmount: order.totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Payment confirmation failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Payment confirmation failed',
      error: error.message
    });
  }
});

/**
 * Webhook endpoint for Stripe events
 * POST /api/payments/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('✅ Payment succeeded:', paymentIntent.id);
        
        // Update order status
        const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
        if (order) {
          order.paymentStatus = 'completed';
          order.status = 'processing';
          await order.save();
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Payment failed:', failedPayment.id);
        
        const failedOrder = await Order.findOne({ paymentIntentId: failedPayment.id });
        if (failedOrder) {
          failedOrder.paymentStatus = 'failed';
          failedOrder.status = 'cancelled';
          await failedOrder.save();
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get payment methods for user
 * GET /api/payments/methods
 */
router.get('/methods', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      methods: [
        {
          id: 'card',
          name: 'Credit/Debit Card',
          description: 'Visa, Mastercard, Amex',
          icon: '💳',
          enabled: !!stripe
        },
        {
          id: 'upi',
          name: 'UPI',
          description: 'Google Pay, PhonePe, Paytm',
          icon: '📱',
          enabled: false
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          description: 'Pay when you receive',
          icon: '💵',
          enabled: true
        }
      ]
    });
  } catch (error) {
    console.error('❌ Get payment methods failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch payment methods'
    });
  }
});

module.exports = router;
