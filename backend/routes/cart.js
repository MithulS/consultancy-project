// Cart routes - Backend cart persistence
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const { verifyToken } = require('../middleware/auth');

// Get user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price imageUrl stock');

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      cart: {
        items: cart.items,
        subtotal,
        itemCount: cart.items.reduce((count, item) => count + item.quantity, 0)
      }
    });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Add item to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({
        success: false,
        msg: 'Product ID is required'
      });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        msg: 'Insufficient stock',
        availableStock: product.stock
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          msg: 'Cannot add more items than available stock',
          availableStock: product.stock
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');

    res.json({
      success: true,
      msg: 'Item added to cart',
      cart
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Update item quantity
router.put('/update/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        msg: 'Quantity must be at least 1'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Product not found'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        msg: 'Requested quantity exceeds available stock',
        availableStock: product.stock
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        msg: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        msg: 'Item not in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');

    res.json({
      success: true,
      msg: 'Cart updated',
      cart
    });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        msg: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');

    res.json({
      success: true,
      msg: 'Item removed from cart',
      cart
    });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Clear cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        msg: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      msg: 'Cart cleared',
      cart
    });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Sync cart from localStorage
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        msg: 'Items must be an array'
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Merge items from localStorage with server cart
    for (const localItem of items) {
      const existingIndex = cart.items.findIndex(
        item => item.product.toString() === localItem._id || item.product.toString() === localItem.productId
      );

      const productId = localItem._id || localItem.productId;
      const product = await Product.findById(productId);
      
      if (!product) continue;

      if (existingIndex > -1) {
        // Take the max quantity
        cart.items[existingIndex].quantity = Math.max(
          cart.items[existingIndex].quantity,
          localItem.quantity
        );
      } else {
        cart.items.push({
          product: productId,
          quantity: localItem.quantity
        });
      }
    }

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');

    res.json({
      success: true,
      msg: 'Cart synced',
      cart
    });
  } catch (err) {
    console.error('Sync cart error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;
