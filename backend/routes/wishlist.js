// Wishlist routes - Save products for later
const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const { verifyToken } = require('../middleware/auth');

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product', 'name price imageUrl stock category brand rating numReviews');

    if (!wishlist) {
      return res.json({
        success: true,
        wishlist: { items: [] },
        count: 0
      });
    }

    // Filter out deleted products
    wishlist.items = wishlist.items.filter(item => item.product);

    res.json({
      success: true,
      wishlist: wishlist,
      count: wishlist.items.length
    });

  } catch (error) {
    console.error('❌ Get wishlist failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch wishlist',
      error: error.message
    });
  }
});

/**
 * Add product to wishlist
 * POST /api/wishlist/add
 */
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({
        success: false,
        msg: 'Product ID is required'
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Product not found'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        items: []
      });
    }

    // Check if already in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        msg: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    wishlist.items.push({
      product: productId,
      addedAt: new Date()
    });

    await wishlist.save();

    // Populate product details
    await wishlist.populate('items.product', 'name price imageUrl stock category brand rating');

    res.json({
      success: true,
      msg: 'Product added to wishlist',
      wishlist: wishlist,
      count: wishlist.items.length
    });

  } catch (error) {
    console.error('❌ Add to wishlist failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to add to wishlist',
      error: error.message
    });
  }
});

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/remove/:productId
 */
router.delete('/remove/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        msg: 'Wishlist not found'
      });
    }

    // Remove item
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
      success: true,
      msg: 'Product removed from wishlist',
      count: wishlist.items.length
    });

  } catch (error) {
    console.error('❌ Remove from wishlist failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to remove from wishlist',
      error: error.message
    });
  }
});

/**
 * Clear entire wishlist
 * DELETE /api/wishlist/clear
 */
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await Wishlist.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );

    res.json({
      success: true,
      msg: 'Wishlist cleared'
    });

  } catch (error) {
    console.error('❌ Clear wishlist failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to clear wishlist',
      error: error.message
    });
  }
});

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
router.get('/check/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId });

    const inWishlist = wishlist && wishlist.items.some(
      item => item.product.toString() === productId
    );

    res.json({
      success: true,
      inWishlist: inWishlist
    });

  } catch (error) {
    console.error('❌ Check wishlist failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to check wishlist',
      error: error.message
    });
  }
});

/**
 * Move all wishlist items to cart
 * POST /api/wishlist/move-to-cart
 */
router.post('/move-to-cart', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product', 'stock');

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Wishlist is empty'
      });
    }

    // Check which items are in stock
    const availableItems = wishlist.items.filter(
      item => item.product && item.product.stock > 0
    );

    const unavailableItems = wishlist.items.filter(
      item => !item.product || item.product.stock === 0
    );

    res.json({
      success: true,
      msg: `${availableItems.length} items ready to add to cart`,
      availableItems: availableItems.map(item => ({
        productId: item.product._id,
        quantity: 1
      })),
      unavailableCount: unavailableItems.length
    });

  } catch (error) {
    console.error('❌ Move to cart failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to move to cart',
      error: error.message
    });
  }
});

module.exports = router;
