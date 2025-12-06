// Product comparison routes
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

/**
 * Compare multiple products
 * GET /api/comparison?ids=id1,id2,id3
 */
router.get('/', async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        msg: 'Product IDs are required'
      });
    }

    // Parse product IDs
    const productIds = ids.split(',').filter(id => id.trim());

    if (productIds.length < 2) {
      return res.status(400).json({
        success: false,
        msg: 'At least 2 products are required for comparison'
      });
    }

    if (productIds.length > 4) {
      return res.status(400).json({
        success: false,
        msg: 'Maximum 4 products can be compared at once'
      });
    }

    // Fetch products
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    }).select('name price originalPrice imageUrl category brand stock rating numReviews description featured');

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'No products found'
      });
    }

    // Calculate comparison metrics
    const comparison = {
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        imageUrl: p.imageUrl,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        rating: p.rating,
        numReviews: p.numReviews,
        description: p.description,
        featured: p.featured,
        savings: p.originalPrice ? p.originalPrice - p.price : 0,
        savingsPercent: p.originalPrice ? 
          Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0
      })),
      insights: {
        lowestPrice: Math.min(...products.map(p => p.price)),
        highestPrice: Math.max(...products.map(p => p.price)),
        bestRated: Math.max(...products.map(p => p.rating || 0)),
        mostReviewed: Math.max(...products.map(p => p.numReviews || 0)),
        averagePrice: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length),
        allInStock: products.every(p => p.stock > 0)
      }
    };

    // Highlight best values
    comparison.products = comparison.products.map(p => ({
      ...p,
      highlights: {
        lowestPrice: p.price === comparison.insights.lowestPrice,
        bestRated: p.rating === comparison.insights.bestRated,
        mostReviewed: p.numReviews === comparison.insights.mostReviewed,
        bestValue: p.savings === Math.max(...comparison.products.map(prod => prod.savings))
      }
    }));

    res.json({
      success: true,
      comparison: comparison,
      count: products.length
    });

  } catch (error) {
    console.error('❌ Product comparison failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to compare products',
      error: error.message
    });
  }
});

/**
 * Get similar products for comparison suggestions
 * GET /api/comparison/suggestions/:productId
 */
router.get('/suggestions/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Get the reference product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Product not found'
      });
    }

    // Find similar products (same category, similar price range)
    const priceRange = product.price * 0.3; // ±30% price range
    
    const suggestions = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      price: {
        $gte: product.price - priceRange,
        $lte: product.price + priceRange
      },
      isActive: true
    })
    .select('name price imageUrl brand rating numReviews')
    .limit(6)
    .sort({ rating: -1, numReviews: -1 });

    res.json({
      success: true,
      suggestions: suggestions,
      count: suggestions.length
    });

  } catch (error) {
    console.error('❌ Get comparison suggestions failed:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to get suggestions',
      error: error.message
    });
  }
});

module.exports = router;
