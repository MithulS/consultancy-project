// Order routes - Customer orders with comprehensive inventory management
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const {
  reserveStock,
  confirmStockDeduction,
  restoreStock,
  checkStockAvailability,
  getInventoryStats,
  getLowStockProducts,
  getOutOfStockProducts
} = require('../utils/inventoryManager');

// Create an order (customers only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        msg: 'Shipping address is required'
      });
    }

    // Check stock availability BEFORE processing
    const stockCheck = await checkStockAvailability(items);
    const unavailableItems = stockCheck.filter(item => !item.available);

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        msg: 'Some items are out of stock or have insufficient quantity',
        unavailableItems: unavailableItems.map(item => ({
          product: item.productName,
          requested: item.requestedQuantity,
          available: item.availableStock,
          reason: item.reason
        }))
      });
    }

    // Validate and process items
    let totalAmount = 0;
    const orderItems = [];
    const stockReservations = [];

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
      stockReservations.push({
        productId: product._id,
        quantity: item.quantity
      });
    }

    // Create order first
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      stockReserved: true,
      stockDeducted: false
    });

    await order.save();

    // Reserve stock for each product
    try {
      for (const reservation of stockReservations) {
        await reserveStock(
          reservation.productId,
          reservation.quantity,
          userId,
          order._id
        );
      }
    } catch (stockError) {
      // If stock reservation fails, delete the order
      await Order.findByIdAndDelete(order._id);
      
      return res.status(400).json({
        success: false,
        msg: 'Failed to reserve stock',
        error: stockError.message
      });
    }

    res.status(201).json({
      success: true,
      msg: 'Order placed successfully. Stock has been reserved.',
      order,
      notification: 'Your order has been received and is being processed. Inventory has been updated.'
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get user's orders (customers only)
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find({ user: userId })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('items.product', 'name imageUrl');

    const total = await Order.countDocuments({ user: userId });

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get single order (customers can view their own, admins can view all)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name imageUrl price')
      .populate('user', 'name email username');

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Order not found'
      });
    }

    // Check authorization - user can only view their own orders unless admin
    if (order.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        msg: 'You can only view your own orders'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get all orders (admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email username')
      .populate('items.product', 'name imageUrl');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Update order status (admin only) - WITH INVENTORY MANAGEMENT
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const adminUserId = req.user.userId;

    if (!status) {
      return res.status(400).json({
        success: false,
        msg: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Order not found'
      });
    }

    const previousStatus = order.status;

    // Handle DELIVERED status - Confirm stock deduction
    if (status === 'delivered' && previousStatus !== 'delivered') {
      const stockResults = await confirmStockDeduction(order, adminUserId);
      
      order.status = status;
      order.deliveredAt = new Date();
      order.stockDeducted = true;
      await order.save();

      return res.json({
        success: true,
        msg: 'Order marked as delivered. Stock deduction confirmed.',
        order,
        stockUpdate: stockResults,
        notification: 'Inventory has been updated. Customer has been notified of delivery.'
      });
    }

    // Handle CANCELLED status - Restore stock
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      if (order.stockDeducted) {
        return res.status(400).json({
          success: false,
          msg: 'Cannot cancel order - already delivered and stock deducted'
        });
      }

      const stockResults = await restoreStock(
        order,
        adminUserId,
        cancelReason || 'Order cancelled by admin'
      );
      
      order.status = status;
      order.cancelledAt = new Date();
      order.cancelReason = cancelReason || 'Cancelled by admin';
      order.stockReserved = false;
      await order.save();

      return res.json({
        success: true,
        msg: 'Order cancelled. Stock has been restored to inventory.',
        order,
        stockUpdate: stockResults,
        notification: 'Customer has been notified. Stock returned to inventory.'
      });
    }

    // Regular status update (no inventory impact)
    order.status = status;
    await order.save();

    res.json({
      success: true,
      msg: `Order status updated to ${status}`,
      order
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Cancel order (customer can cancel their own pending orders)
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.userId;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Order not found'
      });
    }

    // Verify ownership
    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        msg: 'You can only cancel your own orders'
      });
    }

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        msg: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore stock
    const stockResults = await restoreStock(
      order,
      userId,
      reason || 'Cancelled by customer'
    );

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Cancelled by customer';
    order.stockReserved = false;
    await order.save();

    res.json({
      success: true,
      msg: 'Order cancelled successfully. Stock has been restored.',
      order,
      stockUpdate: stockResults,
      notification: 'Your order has been cancelled. Stock returned to inventory.'
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get inventory statistics (admin only)
router.get('/admin/inventory-stats', verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.query;
    
    const stats = await getInventoryStats(productId || null);
    const lowStock = await getLowStockProducts(10);
    const outOfStock = await getOutOfStockProducts();

    res.json({
      success: true,
      inventoryStats: stats,
      alerts: {
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock
      }
    });
  } catch (err) {
    console.error('Get inventory stats error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get order history with inventory impact (admin only)
router.get('/admin/order-history', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email')
      .populate('items.product', 'name stock');

    const total = await Order.countDocuments(query);

    // Calculate metrics
    const metrics = {
      totalOrders: total,
      delivered: await Order.countDocuments({ ...query, status: 'delivered' }),
      cancelled: await Order.countDocuments({ ...query, status: 'cancelled' }),
      pending: await Order.countDocuments({ ...query, status: 'pending' }),
      processing: await Order.countDocuments({ ...query, status: 'processing' }),
      shipped: await Order.countDocuments({ ...query, status: 'shipped' })
    };

    res.json({
      success: true,
      orders,
      metrics,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get order history error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// ==================== ORDER TRACKING SYSTEM ====================

// Get detailed tracking information for an order
router.get('/:id/tracking', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl')
      .populate('trackingHistory.updatedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Order not found'
      });
    }

    // Only allow user to view their own orders (unless admin)
    if (order.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }

    // Update last viewed timestamp
    order.lastViewedAt = new Date();
    await order.save();

    res.json({
      success: true,
      tracking: {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        trackingNumber: order.trackingNumber,
        currentStatus: order.status,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        courierPartner: order.courierPartner,
        shippingAddress: order.shippingAddress,
        trackingHistory: order.trackingHistory,
        items: order.items,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      }
    });
  } catch (err) {
    console.error('Get tracking error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Update order tracking status (Admin only)
router.post('/:id/tracking/update', verifyAdmin, async (req, res) => {
  try {
    const { status, location, description, estimatedDelivery, courierPartner, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Order not found'
      });
    }

    // Add tracking history entry
    const trackingEntry = {
      status: status || order.status,
      location: location || '',
      description: description || '',
      timestamp: new Date(),
      updatedBy: req.user.userId
    };

    order.trackingHistory.push(trackingEntry);

    // Update order status if provided
    if (status) {
      order.status = status;
      
      // Auto-update delivery dates based on status
      if (status === 'delivered') {
        order.actualDelivery = new Date();
        order.deliveredAt = new Date();
      }
    }

    // Update courier information if provided
    if (courierPartner) {
      order.courierPartner = {
        ...order.courierPartner,
        ...courierPartner
      };
    }

    // Update tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Update estimated delivery if provided
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }

    await order.save();

    res.json({
      success: true,
      msg: 'Tracking updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        trackingHistory: order.trackingHistory,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (err) {
    console.error('Update tracking error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Generate tracking number for order (Admin only)
router.post('/:id/tracking/generate', verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Order not found'
      });
    }

    if (order.trackingNumber) {
      return res.status(400).json({
        success: false,
        msg: 'Tracking number already exists'
      });
    }

    // Generate unique tracking number
    const prefix = 'TRK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingNumber = `${prefix}${timestamp}${random}`;

    order.trackingNumber = trackingNumber;
    
    // Add initial tracking entry
    order.trackingHistory.push({
      status: 'confirmed',
      location: 'Warehouse',
      description: 'Order confirmed and tracking number generated',
      timestamp: new Date(),
      updatedBy: req.user.userId
    });

    await order.save();

    res.json({
      success: true,
      msg: 'Tracking number generated successfully',
      trackingNumber
    });
  } catch (err) {
    console.error('Generate tracking number error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Track order by tracking number (Public - no auth required)
router.get('/public/track/:trackingNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('items.product', 'name imageUrl')
      .select('-user -paymentIntentId');

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: 'Invalid tracking number'
      });
    }

    res.json({
      success: true,
      tracking: {
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        trackingNumber: order.trackingNumber,
        currentStatus: order.status,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        courierPartner: order.courierPartner,
        trackingHistory: order.trackingHistory,
        items: order.items.map(item => ({
          name: item.name,
          imageUrl: item.imageUrl,
          quantity: item.quantity
        })),
        createdAt: order.createdAt
      }
    });
  } catch (err) {
    console.error('Public tracking error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Bulk update tracking for multiple orders (Admin only)
router.post('/tracking/bulk-update', verifyAdmin, async (req, res) => {
  try {
    const { orderIds, status, location, description } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Order IDs array is required'
      });
    }

    const trackingEntry = {
      status: status,
      location: location || '',
      description: description || '',
      timestamp: new Date(),
      updatedBy: req.user.userId
    };

    const updateResult = await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        $push: { trackingHistory: trackingEntry },
        $set: { status: status }
      }
    );

    res.json({
      success: true,
      msg: `${updateResult.modifiedCount} orders updated successfully`,
      updatedCount: updateResult.modifiedCount
    });
  } catch (err) {
    console.error('Bulk update tracking error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;
