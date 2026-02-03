// Product routes - CRUD operations for e-commerce
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

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
    
    // Handle search with intelligent query selection
    let useRegexSearch = false;
    if (search) {
      // Force regex for short queries (MongoDB text index requires 3+ chars)
      if (search.length < 3) {
        console.log(`🔍 Short query "${search}" (${search.length} chars) - using regex`);
        useRegexSearch = true;
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      } else {
        // Try text search first (uses text index for better performance)
        query.$text = { $search: search };
        console.log(`🔍 Product search query: "${search}"`);
      }
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    let products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    let total = await Product.countDocuments(query);
    
    // If text search returns no results, try case-insensitive regex search
    if (search && products.length === 0 && !useRegexSearch) {
      console.log(`⚠️ Text search returned 0 results, trying regex fallback...`);
      
      // Remove text search and use regex instead
      delete query.$text;
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
      
      products = await Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-__v');
      
      total = await Product.countDocuments(query);
      
      console.log(`🔍 Regex search found ${products.length} products`);
    } else if (search) {
      const searchType = useRegexSearch ? 'Regex' : 'Text';
      console.log(`✅ ${searchType} search found ${products.length} products`);
    }

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

// Create product (admin only - requires admin token)
router.post('/', verifyAdmin, async (req, res) => {
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

    const stockQuantity = stock || 0;
    
    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
      images: images || [],
      category,
      brand,
      stock: stockQuantity,
      inStock: stockQuantity > 0, // Explicitly set inStock based on stock
      featured: featured || false,
      // rating and numReviews are calculated from customer reviews, not set by admin
      rating: 0,
      numReviews: 0,
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

// Update product (admin only - requires admin token)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.rating; // Rating is calculated from customer reviews, not set by admin
    delete updates.numReviews; // Review count is calculated, not set by admin

    // Find the product first
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, msg: 'Product not found' });
    }

    // Apply updates
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    // Auto-calculate inStock based on stock quantity
    product.inStock = product.stock > 0;

    // Save (this triggers the pre-save hook)
    await product.save();

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

// Delete product (admin only - requires admin token)
router.delete('/:id', verifyAdmin, async (req, res) => {
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
