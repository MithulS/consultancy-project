// Review routes - Customer ratings and reviews
const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order');
const { verifyToken } = require('../middleware/auth');

// Helper function to recalculate product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      numReviews: reviews.length
    });
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
}

// Create a review (customers only, must have purchased the product)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, orderId, rating, comment, images } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        msg: 'Missing required fields: productId, orderId, rating'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        msg: 'Rating must be between 1 and 5'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Product not found'
      });
    }

    // Verify the order exists and belongs to this user
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        msg: 'Order not found or does not belong to you'
      });
    }

    // Verify the order contains this product
    const orderContainsProduct = order.items.some(
      item => item.product.toString() === productId
    );

    if (!orderContainsProduct) {
      return res.status(403).json({
        success: false,
        msg: 'You can only review products you have purchased'
      });
    }

    // Verify order is delivered (optional - uncomment if you want this requirement)
    // if (order.status !== 'delivered') {
    //   return res.status(403).json({
    //     success: false,
    //     msg: 'You can only review products after delivery'
    //   });
    // }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        msg: 'You have already reviewed this product. Use PUT to update your review.'
      });
    }

    // Create the review
    const review = new Review({
      product: productId,
      user: userId,
      order: orderId,
      rating,
      comment: comment || '',
      images: images || [],
      isVerifiedPurchase: true
    });

    await review.save();

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      msg: 'Review submitted successfully',
      review
    });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Update a review (only the author can update)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const userId = req.userId;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        msg: 'Review not found'
      });
    }

    // Verify user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        msg: 'You can only update your own reviews'
      });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          msg: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    if (images !== undefined) {
      review.images = images;
    }

    await review.save();

    // Recalculate product rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      msg: 'Review updated successfully',
      review
    });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Delete a review (only the author can delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        msg: 'Review not found'
      });
    }

    // Verify user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        msg: 'You can only delete your own reviews'
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    await updateProductRating(productId);

    res.json({
      success: true,
      msg: 'Review deleted successfully'
    });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name username')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ product: req.params.productId });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get user's own reviews (requires authentication)
router.get('/my-reviews', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ user: userId })
      .populate('product', 'name imageUrl price')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get my reviews error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Check if user can review a product (requires authentication)
router.get('/can-review/:productId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId;

    // Check if already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });

    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'already_reviewed',
        review: existingReview
      });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      user: userId,
      'items.product': productId
    });

    if (!order) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'not_purchased'
      });
    }

    res.json({
      success: true,
      canReview: true,
      orderId: order._id
    });
  } catch (err) {
    console.error('Can review check error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;
