// Product routes - CRUD operations for e-commerce
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const verifyToken = require('../middleware/auth');

// Get all products (public) - with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sort = '-createdAt',
      page = 1,
      limit = 12,
      featured
    } = req.query;

    // Build query
    let query = { isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// Get single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, msg: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// Create product (admin only - requires authentication)
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      imageUrl,
      images,
      category,
      brand,
      stock,
      featured,
      rating,
      numReviews,
      specifications,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Missing required fields: name, description, price, category' 
      });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
      images: images || [],
      category,
      brand,
      stock: stock || 0,
      featured: featured || false,
      rating: rating || 0,
      numReviews: numReviews || 0,
      specifications: specifications || {},
      tags: tags || [],
      createdBy: req.userId
    });

    await product.save();

    res.status(201).json({ 
      success: true, 
      msg: 'Product created successfully', 
      product 
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// Update product (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.updatedAt;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, msg: 'Product not found' });
    }

    res.json({ 
      success: true, 
      msg: 'Product updated successfully', 
      product 
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// Delete product (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, msg: 'Product not found' });
    }

    res.json({ 
      success: true, 
      msg: 'Product deleted successfully' 
    });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// Get categories (public)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

module.exports = router;
