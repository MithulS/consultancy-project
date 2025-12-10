// Order model for tracking purchases
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  imageUrl: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'netbanking'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String // Stripe payment intent ID
  },
  stockReserved: {
    type: Boolean,
    default: true // Stock is reserved when order is created
  },
  stockDeducted: {
    type: Boolean,
    default: false // Stock permanently deducted when delivered
  },
  // Order Tracking System
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  trackingHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      required: true
    },
    location: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  estimatedDelivery: Date,
  actualDelivery: Date,
  courierPartner: {
    name: String,
    trackingUrl: String,
    contactNumber: String
  },
  deliveryInstructions: String,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  // Customer interaction tracking
  lastViewedAt: Date,
  notificationsSent: [{
    type: {
      type: String,
      enum: ['order_placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'delayed']
    },
    sentAt: Date,
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app']
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
