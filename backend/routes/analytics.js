// Analytics routes - Product sales analysis
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { verifyAdmin } = require('../middleware/auth');

// Get sales analytics summary
router.get('/sales-summary', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, category, productId } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all orders within date range
    const orders = await Order.find({
      ...dateFilter,
      status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
    }).populate('items.product');

    // Calculate summary statistics
    const summary = {
      totalRevenue: 0,
      totalOrders: orders.length,
      totalProducts: 0,
      averageOrderValue: 0,
      topProducts: [],
      salesByStatus: {},
      dailySales: {},
      monthlySales: {}
    };

    const productSales = {};
    const statusCounts = {};

    orders.forEach(order => {
      summary.totalRevenue += order.totalAmount;

      // Count by status
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

      // Track daily sales
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!summary.dailySales[dateKey]) {
        summary.dailySales[dateKey] = { revenue: 0, orders: 0 };
      }
      summary.dailySales[dateKey].revenue += order.totalAmount;
      summary.dailySales[dateKey].orders += 1;

      // Track monthly sales
      const monthKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!summary.monthlySales[monthKey]) {
        summary.monthlySales[monthKey] = { revenue: 0, orders: 0 };
      }
      summary.monthlySales[monthKey].revenue += order.totalAmount;
      summary.monthlySales[monthKey].orders += 1;

      // Track product sales
      order.items.forEach(item => {
        if (!item.product) return;

        // Apply filters
        if (productId && item.product._id.toString() !== productId) return;
        if (category && item.product.category !== category) return;

        const productKey = item.product._id.toString();
        if (!productSales[productKey]) {
          productSales[productKey] = {
            productId: item.product._id,
            name: item.name,
            category: item.product.category || 'Uncategorized',
            quantity: 0,
            revenue: 0,
            orders: new Set()
          };
        }

        productSales[productKey].quantity += item.quantity;
        productSales[productKey].revenue += item.price * item.quantity;
        productSales[productKey].orders.add(order._id.toString());
      });
    });

    summary.averageOrderValue = summary.totalOrders > 0 
      ? summary.totalRevenue / summary.totalOrders 
      : 0;

    summary.salesByStatus = statusCounts;

    // Convert product sales to array and sort
    summary.topProducts = Object.values(productSales)
      .map(p => ({
        productId: p.productId,
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        revenue: p.revenue,
        orderCount: p.orders.size
      }))
      .sort((a, b) => b.revenue - a.revenue);

    summary.totalProducts = summary.topProducts.length;

    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Sales summary error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch sales summary',
      error: err.message
    });
  }
});

// Get product-specific analytics
router.get('/product/:id', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Product not found'
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get orders containing this product
    const orders = await Order.find({
      ...dateFilter,
      'items.product': productId,
      status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
    });

    let totalQuantity = 0;
    let totalRevenue = 0;
    const dailySales = {};

    orders.forEach(order => {
      const item = order.items.find(i => i.product.toString() === productId);
      if (item) {
        totalQuantity += item.quantity;
        totalRevenue += item.price * item.quantity;

        const dateKey = order.createdAt.toISOString().split('T')[0];
        if (!dailySales[dateKey]) {
          dailySales[dateKey] = { quantity: 0, revenue: 0 };
        }
        dailySales[dateKey].quantity += item.quantity;
        dailySales[dateKey].revenue += item.price * item.quantity;
      }
    });

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock
        },
        analytics: {
          totalOrders: orders.length,
          totalQuantity,
          totalRevenue,
          averageQuantityPerOrder: orders.length > 0 ? totalQuantity / orders.length : 0,
          dailySales
        }
      }
    });
  } catch (err) {
    console.error('Product analytics error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch product analytics',
      error: err.message
    });
  }
});

// Get sales trends (time-series data)
router.get('/sales-trends', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, interval = 'daily' } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find({
      ...dateFilter,
      status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
    });

    const trends = {};

    orders.forEach(order => {
      let key;
      const date = new Date(order.createdAt);

      switch (interval) {
        case 'hourly':
          key = `${date.toISOString().split('T')[0]} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
          key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!trends[key]) {
        trends[key] = {
          date: key,
          revenue: 0,
          orders: 0,
          products: 0
        };
      }

      trends[key].revenue += order.totalAmount;
      trends[key].orders += 1;
      trends[key].products += order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    // Convert to array and sort by date
    const trendsArray = Object.values(trends).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    res.json({
      success: true,
      data: {
        interval,
        trends: trendsArray
      }
    });
  } catch (err) {
    console.error('Sales trends error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch sales trends',
      error: err.message
    });
  }
});

// Get category-wise sales
router.get('/category-sales', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find({
      ...dateFilter,
      status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
    }).populate('items.product');

    const categorySales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!item.product) return;

        const category = item.product.category || 'Uncategorized';
        if (!categorySales[category]) {
          categorySales[category] = {
            category,
            quantity: 0,
            revenue: 0,
            orders: new Set()
          };
        }

        categorySales[category].quantity += item.quantity;
        categorySales[category].revenue += item.price * item.quantity;
        categorySales[category].orders.add(order._id.toString());
      });
    });

    const categoryArray = Object.values(categorySales)
      .map(c => ({
        category: c.category,
        quantity: c.quantity,
        revenue: c.revenue,
        orderCount: c.orders.size
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: categoryArray
    });
  } catch (err) {
    console.error('Category sales error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch category sales',
      error: err.message
    });
  }
});

// ============ USER BEHAVIOR ANALYTICS ============

// In-memory storage for analytics events (in production, use database)
const analyticsEvents = [];

// Track analytics event
router.post('/track', async (req, res) => {
  try {
    const event = {
      ...req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      receivedAt: new Date().toISOString()
    };

    analyticsEvents.push(event);

    // Keep only last 10000 events in memory
    if (analyticsEvents.length > 10000) {
      analyticsEvents.shift();
    }

    console.log('📊 Analytics event tracked:', event.name);
    res.json({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get analytics summary (admin only)
router.get('/user-analytics-summary', verifyAdmin, async (req, res) => {
  try {
    const summary = {
      totalEvents: analyticsEvents.length,
      eventsByType: {},
      recentEvents: analyticsEvents.slice(-100).reverse(),
      userSessions: new Set(analyticsEvents.map(e => e.properties?.sessionId)).size,
      pageViews: analyticsEvents.filter(e => e.name === 'page_view').length,
      errors: analyticsEvents.filter(e => e.name === 'error').length,
      purchases: analyticsEvents.filter(e => e.name === 'purchase').length
    };

    // Count events by type
    analyticsEvents.forEach(event => {
      summary.eventsByType[event.name] = (summary.eventsByType[event.name] || 0) + 1;
    });

    res.json(summary);
  } catch (error) {
    console.error('❌ Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// Get user journey (admin only)
router.get('/journey/:sessionId', verifyAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const journey = analyticsEvents.filter(
      e => e.properties?.sessionId === sessionId
    ).sort((a, b) => new Date(a.properties.timestamp) - new Date(b.properties.timestamp));

    res.json({
      sessionId,
      eventsCount: journey.length,
      events: journey
    });
  } catch (error) {
    console.error('❌ Journey tracking error:', error);
    res.status(500).json({ error: 'Failed to get journey' });
  }
});

module.exports = router;
