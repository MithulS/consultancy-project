// Inventory management routes (admin only)
const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const InventoryLog = require('../models/inventoryLog');
const Product = require('../models/product');
const {
  logInventoryChange,
  getInventoryStats,
  getLowStockProducts,
  getOutOfStockProducts
} = require('../utils/inventoryManager');

// Get inventory logs for a specific product
router.get('/logs/:productId', verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 50, action } = req.query;

    const query = { product: productId };
    if (action) {
      query.action = action;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await InventoryLog.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('product', 'name imageUrl')
      .populate('order', 'status totalAmount')
      .populate('performedBy', 'name email username');

    const total = await InventoryLog.countDocuments(query);

    const product = await Product.findById(productId);

    res.json({
      success: true,
      product: product ? {
        id: product._id,
        name: product.name,
        currentStock: product.stock,
        inStock: product.inStock
      } : null,
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get inventory logs error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get all inventory logs (with filters)
router.get('/logs', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100, action, startDate, endDate } = req.query;

    const query = {};
    if (action) {
      query.action = action;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await InventoryLog.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('product', 'name imageUrl stock')
      .populate('order', 'status')
      .populate('performedBy', 'name email');

    const total = await InventoryLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get all inventory logs error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get comprehensive inventory statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.query;
    
    const stats = await getInventoryStats(productId || null);
    const lowStock = await getLowStockProducts(10);
    const outOfStock = await getOutOfStockProducts();

    // Get total products count
    const totalProducts = await Product.countDocuments();
    const inStockCount = await Product.countDocuments({ inStock: true });

    res.json({
      success: true,
      overview: {
        totalProducts,
        inStockCount,
        outOfStockCount: totalProducts - inStockCount,
        lowStockCount: lowStock.length
      },
      orderStats: stats,
      alerts: {
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

// Get low stock alerts
router.get('/alerts/low-stock', verifyAdmin, async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const products = await getLowStockProducts(Number(threshold));

    res.json({
      success: true,
      threshold: Number(threshold),
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Get low stock alerts error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get out of stock products
router.get('/alerts/out-of-stock', verifyAdmin, async (req, res) => {
  try {
    const products = await getOutOfStockProducts();

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Get out of stock alerts error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Manual stock adjustment (admin only)
router.post('/adjust', verifyAdmin, async (req, res) => {
  try {
    const { productId, quantityChange, reason } = req.body;
    const adminUserId = req.userId;

    if (!productId || quantityChange === undefined) {
      return res.status(400).json({
        success: false,
        msg: 'Product ID and quantity change are required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        msg: 'Reason for adjustment is required'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Product not found'
      });
    }

    const stockBefore = product.stock;
    const newStock = stockBefore + Number(quantityChange);

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        msg: 'Stock cannot be negative'
      });
    }

    // Update product stock
    product.stock = newStock;
    product.inStock = newStock > 0;
    await product.save();

    // Log the adjustment
    await logInventoryChange({
      product: productId,
      action: quantityChange > 0 ? 'stock_added' : 'stock_removed',
      quantityChange: Number(quantityChange),
      stockBefore,
      stockAfter: newStock,
      performedBy: adminUserId,
      reason,
      metadata: {
        adjustmentType: 'manual'
      }
    });

    res.json({
      success: true,
      msg: 'Stock adjusted successfully',
      product: {
        id: product._id,
        name: product.name,
        stockBefore,
        stockAfter: newStock,
        change: Number(quantityChange)
      }
    });
  } catch (err) {
    console.error('Stock adjustment error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get inventory summary report
router.get('/report', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Aggregate inventory changes by action type
    const actionSummary = await InventoryLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          totalQuantityChange: { $sum: '$quantityChange' }
        }
      }
    ]);

    // Get products with most activity
    const productActivity = await InventoryLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$product',
          activityCount: { $sum: 1 },
          totalQuantityChange: { $sum: '$quantityChange' }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate product details
    await InventoryLog.populate(productActivity, {
      path: '_id',
      select: 'name imageUrl stock'
    });

    res.json({
      success: true,
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present'
      },
      actionSummary,
      topProducts: productActivity.map(item => ({
        product: item._id,
        activityCount: item.activityCount,
        totalQuantityChange: item.totalQuantityChange
      }))
    });
  } catch (err) {
    console.error('Get inventory report error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;
