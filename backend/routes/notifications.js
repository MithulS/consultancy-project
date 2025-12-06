// Admin Contact & Notification Routes
const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const {
  getAdminContacts,
  getPrimaryAdminContact,
  checkProductStockAndNotify,
  getAllOutOfStockNotifications
} = require('../utils/adminNotification');

/**
 * @route   GET /api/notifications/admin-contacts
 * @desc    Get all admin contacts with phone numbers
 * @access  Admin only
 */
router.get('/admin-contacts', verifyAdmin, async (req, res) => {
  try {
    const admins = await getAdminContacts();
    
    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'No admin contacts found. Please ensure at least one admin has a phone number set.'
      });
    }

    res.json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    console.error('❌ Get admin contacts error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching admin contacts'
    });
  }
});

/**
 * @route   GET /api/notifications/primary-admin
 * @desc    Get primary admin contact information
 * @access  Admin only
 */
router.get('/primary-admin', verifyAdmin, async (req, res) => {
  try {
    const admin = await getPrimaryAdminContact();
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        msg: 'No admin contact found. Please set up an admin user with phone number.'
      });
    }

    res.json({
      success: true,
      admin: {
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber
      }
    });
  } catch (error) {
    console.error('❌ Get primary admin error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching primary admin contact'
    });
  }
});

/**
 * @route   GET /api/notifications/out-of-stock/:productId
 * @desc    Check if product is out of stock and get admin notification
 * @access  Admin only
 */
router.get('/out-of-stock/:productId', verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const notification = await checkProductStockAndNotify(productId);
    
    if (notification.error) {
      return res.status(notification.outOfStock ? 200 : 404).json({
        success: false,
        ...notification
      });
    }

    if (notification.inStock) {
      return res.json({
        success: true,
        inStock: true,
        ...notification
      });
    }

    res.json({
      success: true,
      outOfStock: true,
      ...notification
    });
  } catch (error) {
    console.error('❌ Check out-of-stock error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while checking product stock'
    });
  }
});

/**
 * @route   GET /api/notifications/out-of-stock-all
 * @desc    Get all out-of-stock products with admin notification
 * @access  Admin only
 */
router.get('/out-of-stock-all', verifyAdmin, async (req, res) => {
  try {
    const result = await getAllOutOfStockNotifications();
    
    if (result.error) {
      return res.status(200).json({
        success: false,
        ...result
      });
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Get all out-of-stock error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching out-of-stock products'
    });
  }
});

/**
 * @route   POST /api/notifications/test-notification/:productId
 * @desc    Test notification system for a specific product
 * @access  Admin only
 */
router.post('/test-notification/:productId', verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const notification = await checkProductStockAndNotify(productId);
    
    res.json({
      success: true,
      testMode: true,
      timestamp: new Date().toISOString(),
      result: notification
    });
  } catch (error) {
    console.error('❌ Test notification error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error during notification test'
    });
  }
});

module.exports = router;
