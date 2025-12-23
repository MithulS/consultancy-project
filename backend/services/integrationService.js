/**
 * Integration Service - Connects chatbot with existing e-commerce systems
 * Handles order management, inventory, CRM, payments, and shipping integrations
 */

const axios = require('axios');
const logger = require('../config/logger');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

class IntegrationService {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:5000';
  }

  /**
   * ORDER MANAGEMENT INTEGRATION
   */

  async trackOrder(orderId, userId = null) {
    try {
      logger.info(`Tracking order: ${orderId}`);

      const order = await Order.findOne({ 
        $or: [
          { orderId: orderId },
          { _id: orderId }
        ]
      }).populate('items.product');

      if (!order) {
        return {
          success: false,
          message: "I couldn't find an order with that number. Please check and try again.",
          data: null
        };
      }

      // Format order status for user-friendly response
      const statusMessages = {
        pending: 'Your order has been received and is being processed.',
        processing: 'Your order is being prepared for shipment.',
        shipped: 'Your order has been shipped and is on its way!',
        delivered: 'Your order has been delivered.',
        cancelled: 'This order has been cancelled.',
        refunded: 'This order has been refunded.'
      };

      const response = {
        success: true,
        message: statusMessages[order.status] || 'Order found.',
        data: {
          orderId: order.orderId,
          status: order.status,
          statusMessage: statusMessages[order.status],
          items: order.items.map(item => ({
            product: item.product?.name || 'Product',
            quantity: item.quantity,
            price: item.price
          })),
          total: order.totalAmount,
          orderDate: order.createdAt,
          estimatedDelivery: order.estimatedDelivery,
          trackingNumber: order.trackingNumber,
          shippingAddress: order.shippingAddress,
          carrier: order.carrier
        }
      };

      return response;

    } catch (error) {
      logger.error('Error tracking order:', error);
      return {
        success: false,
        message: "I'm having trouble retrieving that order. Please try again or contact support.",
        error: error.message
      };
    }
  }

  async cancelOrder(orderId, userId, reason = null) {
    try {
      logger.info(`Cancelling order: ${orderId}`);

      const order = await Order.findOne({ 
        orderId: orderId,
        userId: userId
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found or you don't have permission to cancel it."
        };
      }

      // Check if order can be cancelled
      if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
        return {
          success: false,
          message: `This order cannot be cancelled as it's already ${order.status}. Would you like to initiate a return instead?`
        };
      }

      // Cancel the order
      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledAt = new Date();
      await order.save();

      // Restore inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }

      return {
        success: true,
        message: `Order ${orderId} has been successfully cancelled. Your refund will be processed within 5-7 business days.`,
        data: {
          orderId: order.orderId,
          refundAmount: order.totalAmount,
          refundMethod: order.paymentMethod
        }
      };

    } catch (error) {
      logger.error('Error cancelling order:', error);
      return {
        success: false,
        message: "I couldn't cancel that order. Please contact support for assistance."
      };
    }
  }

  async modifyOrderAddress(orderId, userId, newAddress) {
    try {
      logger.info(`Modifying address for order: ${orderId}`);

      const order = await Order.findOne({ 
        orderId: orderId,
        userId: userId
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found."
        };
      }

      if (order.status === 'shipped' || order.status === 'delivered') {
        return {
          success: false,
          message: "Sorry, this order has already shipped and the address cannot be changed. Please contact the shipping carrier."
        };
      }

      order.shippingAddress = newAddress;
      await order.save();

      return {
        success: true,
        message: "Your shipping address has been updated successfully!",
        data: {
          orderId: order.orderId,
          newAddress: newAddress
        }
      };

    } catch (error) {
      logger.error('Error modifying order address:', error);
      return {
        success: false,
        message: "I couldn't update the address. Please try again."
      };
    }
  }

  async getOrderHistory(userId, limit = 10) {
    try {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('items.product');

      return {
        success: true,
        message: `Found ${orders.length} recent orders.`,
        data: orders.map(order => ({
          orderId: order.orderId,
          status: order.status,
          total: order.totalAmount,
          date: order.createdAt,
          itemCount: order.items.length
        }))
      };

    } catch (error) {
      logger.error('Error fetching order history:', error);
      return {
        success: false,
        message: "I couldn't retrieve your order history."
      };
    }
  }

  /**
   * INVENTORY MANAGEMENT INTEGRATION
   */

  async checkProductAvailability(productId, quantity = 1) {
    try {
      logger.info(`Checking availability for product: ${productId}`);

      const product = await Product.findById(productId);

      if (!product) {
        return {
          success: false,
          message: "I couldn't find that product.",
          available: false
        };
      }

      const isAvailable = product.stock >= quantity;

      return {
        success: true,
        available: isAvailable,
        message: isAvailable 
          ? `Yes! ${product.name} is in stock. We have ${product.stock} units available.`
          : `Sorry, ${product.name} is currently out of stock. Would you like to be notified when it's back?`,
        data: {
          productId: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          available: isAvailable,
          images: product.images
        }
      };

    } catch (error) {
      logger.error('Error checking product availability:', error);
      return {
        success: false,
        message: "I couldn't check the product availability."
      };
    }
  }

  async searchProducts(query, filters = {}) {
    try {
      logger.info(`Searching products: ${query}`);

      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      };

      if (filters.category) {
        searchQuery.category = filters.category;
      }

      if (filters.minPrice || filters.maxPrice) {
        searchQuery.price = {};
        if (filters.minPrice) searchQuery.price.$gte = filters.minPrice;
        if (filters.maxPrice) searchQuery.price.$lte = filters.maxPrice;
      }

      const products = await Product.find(searchQuery)
        .limit(10)
        .sort({ rating: -1 });

      return {
        success: true,
        message: `Found ${products.length} products matching "${query}".`,
        data: products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          rating: p.rating,
          image: p.images?.[0]
        }))
      };

    } catch (error) {
      logger.error('Error searching products:', error);
      return {
        success: false,
        message: "I couldn't search for products right now."
      };
    }
  }

  async getSimilarProducts(productId, limit = 5) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return { success: false, message: "Product not found." };
      }

      const similar = await Product.find({
        _id: { $ne: productId },
        category: product.category,
        price: { 
          $gte: product.price * 0.7, 
          $lte: product.price * 1.3 
        }
      })
      .limit(limit)
      .sort({ rating: -1 });

      return {
        success: true,
        message: `Here are ${similar.length} similar products you might like:`,
        data: similar.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          rating: p.rating,
          image: p.images?.[0]
        }))
      };

    } catch (error) {
      logger.error('Error fetching similar products:', error);
      return {
        success: false,
        message: "I couldn't find similar products."
      };
    }
  }

  /**
   * CRM INTEGRATION
   */

  async getUserProfile(userId) {
    try {
      logger.info(`Fetching user profile: ${userId}`);

      const user = await User.findById(userId).select('-password');

      if (!user) {
        return {
          success: false,
          message: "User not found."
        };
      }

      // Get order statistics
      const orders = await Order.find({ userId });
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Determine customer segment
      let segment = 'new';
      if (orders.length > 10 || totalSpent > 1000) segment = 'vip';
      else if (orders.length > 3) segment = 'regular';

      return {
        success: true,
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
          orderCount: orders.length,
          lifetimeValue: totalSpent,
          customerSegment: segment,
          joinDate: user.createdAt,
          preferences: user.preferences || {}
        }
      };

    } catch (error) {
      logger.error('Error fetching user profile:', error);
      return {
        success: false,
        message: "I couldn't retrieve the user profile."
      };
    }
  }

  async updateUserPreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true }
      );

      return {
        success: true,
        message: "Your preferences have been updated!",
        data: user.preferences
      };

    } catch (error) {
      logger.error('Error updating user preferences:', error);
      return {
        success: false,
        message: "I couldn't update your preferences."
      };
    }
  }

  /**
   * PAYMENT INTEGRATION
   */

  async getPaymentStatus(orderId) {
    try {
      const order = await Order.findOne({ orderId });

      if (!order) {
        return {
          success: false,
          message: "Order not found."
        };
      }

      return {
        success: true,
        data: {
          orderId: order.orderId,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          amount: order.totalAmount,
          paidAt: order.paidAt
        }
      };

    } catch (error) {
      logger.error('Error fetching payment status:', error);
      return {
        success: false,
        message: "I couldn't retrieve the payment status."
      };
    }
  }

  async initiateRefund(orderId, amount, reason) {
    try {
      logger.info(`Initiating refund for order: ${orderId}`);

      const order = await Order.findOne({ orderId });

      if (!order) {
        return {
          success: false,
          message: "Order not found."
        };
      }

      if (order.refundStatus === 'refunded') {
        return {
          success: false,
          message: "This order has already been refunded."
        };
      }

      // Update order status
      order.refundStatus = 'processing';
      order.refundAmount = amount;
      order.refundReason = reason;
      order.refundInitiatedAt = new Date();
      await order.save();

      return {
        success: true,
        message: `Refund of $${amount} has been initiated. It will be processed within 5-7 business days.`,
        data: {
          orderId: order.orderId,
          refundAmount: amount,
          refundStatus: 'processing'
        }
      };

    } catch (error) {
      logger.error('Error initiating refund:', error);
      return {
        success: false,
        message: "I couldn't process the refund request."
      };
    }
  }

  /**
   * SHIPPING & TRACKING INTEGRATION
   */

  async getShippingEstimate(address, items) {
    try {
      // Simplified shipping estimate
      // In production, integrate with actual shipping APIs (UPS, FedEx, etc.)

      const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
      
      let estimatedDays = 5;
      let cost = 9.99;

      if (totalWeight > 10) {
        estimatedDays = 7;
        cost = 14.99;
      }

      return {
        success: true,
        message: `Estimated delivery: ${estimatedDays} business days for $${cost}`,
        data: {
          estimatedDays,
          cost,
          carrier: 'Standard Shipping',
          options: [
            { method: 'Standard', days: estimatedDays, cost: cost },
            { method: 'Express', days: 2, cost: cost * 2 },
            { method: 'Overnight', days: 1, cost: cost * 3 }
          ]
        }
      };

    } catch (error) {
      logger.error('Error estimating shipping:', error);
      return {
        success: false,
        message: "I couldn't calculate shipping estimates."
      };
    }
  }

  async getTrackingInfo(trackingNumber) {
    try {
      logger.info(`Fetching tracking info: ${trackingNumber}`);

      const order = await Order.findOne({ trackingNumber });

      if (!order) {
        return {
          success: false,
          message: "I couldn't find a shipment with that tracking number."
        };
      }

      // In production, call actual carrier APIs for real-time tracking
      const mockTrackingData = {
        trackingNumber: trackingNumber,
        carrier: order.carrier || 'USPS',
        status: 'In Transit',
        estimatedDelivery: order.estimatedDelivery,
        currentLocation: 'Distribution Center',
        events: [
          { date: new Date(), status: 'In Transit', location: 'Local Facility' },
          { date: new Date(Date.now() - 86400000), status: 'Departed', location: 'Sorting Center' },
          { date: new Date(Date.now() - 172800000), status: 'Picked Up', location: 'Origin' }
        ]
      };

      return {
        success: true,
        message: "Here's your tracking information:",
        data: mockTrackingData
      };

    } catch (error) {
      logger.error('Error fetching tracking info:', error);
      return {
        success: false,
        message: "I couldn't retrieve tracking information."
      };
    }
  }

  /**
   * KNOWLEDGE BASE INTEGRATION
   */

  async searchKnowledgeBase(query) {
    try {
      // In production, integrate with vector database or search service
      const articles = [
        {
          id: '1',
          title: 'How to Track Your Order',
          content: 'You can track your order using the tracking number sent to your email...',
          category: 'Orders',
          helpful: 142
        },
        {
          id: '2',
          title: 'Return & Refund Policy',
          content: 'We accept returns within 30 days of purchase...',
          category: 'Returns',
          helpful: 98
        },
        {
          id: '3',
          title: 'Shipping Information',
          content: 'We offer multiple shipping options...',
          category: 'Shipping',
          helpful: 76
        }
      ];

      const results = articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        message: results.length > 0 
          ? `I found ${results.length} helpful articles:`
          : "I couldn't find articles matching that query.",
        data: results
      };

    } catch (error) {
      logger.error('Error searching knowledge base:', error);
      return {
        success: false,
        message: "I couldn't search the knowledge base."
      };
    }
  }

  /**
   * ANALYTICS INTEGRATION
   */

  async logChatInteraction(conversationId, intent, resolved, userId = null) {
    try {
      // Log interaction for analytics
      logger.info(`Logging interaction: ${conversationId} - ${intent} - ${resolved ? 'resolved' : 'unresolved'}`);

      // In production, send to analytics platform (Google Analytics, Mixpanel, etc.)
      
      return { success: true };

    } catch (error) {
      logger.error('Error logging interaction:', error);
      return { success: false };
    }
  }
}

module.exports = new IntegrationService();
