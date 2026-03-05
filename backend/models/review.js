// Review model for customer product ratings and reviews
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true // Must be from an actual order
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    trim: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true // All reviews must be from verified purchases
  },
  helpful: {
    type: Number,
    default: 0 // Number of users who found this review helpful
  },
  images: [{
    type: String // Customer can upload review images
  }]
}, {
  timestamps: true
});

// Compound index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Auto-recalculate product rating after save/remove
async function recalcProductRating(productId) {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');
  const result = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      numReviews: result[0].count
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  }
}

reviewSchema.post('save', async function() {
  await recalcProductRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) await recalcProductRating(doc.product);
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await recalcProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
