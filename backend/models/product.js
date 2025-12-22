// Product model for e-commerce platform
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: null // For showing discounts
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required'],
    default: 'https://via.placeholder.com/300x300?text=No+Image'
  },
  imageAltText: {
    type: String,
    maxlength: [125, 'Alt text cannot exceed 125 characters'],
    trim: true
  },
  images: [{
    type: String // Additional product images
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Electrical', 'Plumbing', 'Hardware', 'Tools', 'Lighting', 'Paints', 'Heating', 'Safety', 'Accessories'],
    default: 'Hardware'
  },
  brand: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    // This is calculated from customer reviews, not set by admin
    // See Review model and calculateProductRating function
  },
  numReviews: {
    type: Number,
    default: 0,
    // This is calculated from customer reviews count
  },
  specifications: {
    type: Map,
    of: String
  },
  tags: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
productSchema.index({ category: 1, price: 1 }); // Category browsing with price sorting
productSchema.index({ featured: 1, createdAt: -1 }); // Featured products
productSchema.index({ stock: 1 }); // Low-stock queries
productSchema.index({ isActive: 1, createdAt: -1 }); // Active products listing
productSchema.index({ brand: 1 }); // Brand filtering
productSchema.index({ tags: 1 }); // Tag-based search

// Update inStock based on stock quantity before saving
productSchema.pre('save', function() {
  this.inStock = this.stock > 0;
});

// Also handle findOneAndUpdate scenarios
productSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  if (update.stock !== undefined) {
    update.inStock = update.stock > 0;
  }
});

module.exports = mongoose.model('Product', productSchema);
