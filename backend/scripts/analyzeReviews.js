// Script to analyze review rating system
require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/review');
const Product = require('../models/product');

async function analyzeReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hardware-ecommerce');
    console.log('Connected to database\n');

    console.log('=== REVIEW RATING ANALYSIS ===\n');

    // Total reviews
    const totalReviews = await Review.countDocuments();
    console.log('Total Reviews in Database:', totalReviews);

    // Products with reviews
    const productsWithReviews = await Product.find({ numReviews: { $gt: 0 } })
      .select('name rating numReviews')
      .sort('-numReviews');
    
    console.log('\n--- Products with Reviews ---');
    if (productsWithReviews.length === 0) {
      console.log('No products have reviews yet.');
    } else {
      productsWithReviews.forEach(p => {
        console.log(`  • ${p.name}: ${p.rating} ⭐ (${p.numReviews} reviews)`);
      });
    }

    // Sample reviews
    const sampleReviews = await Review.find()
      .populate('product', 'name')
      .populate('user', 'name')
      .limit(10);
    
    console.log('\n--- Sample Reviews ---');
    if (sampleReviews.length === 0) {
      console.log('No reviews found in database.');
    } else {
      sampleReviews.forEach(r => {
        console.log(`  • ${r.rating}⭐ for "${r.product?.name || 'Unknown'}" by ${r.user?.name || 'Unknown'}`);
      });
    }

    // Rating distribution
    const ratingDist = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n--- Rating Distribution ---');
    if (ratingDist.length === 0) {
      console.log('No rating data available.');
    } else {
      ratingDist.forEach(r => {
        const stars = '⭐'.repeat(r._id);
        console.log(`  ${stars} (${r._id} stars): ${r.count} reviews`);
      });
    }

    // Check for data integrity issues
    console.log('\n--- Data Integrity Checks ---');

    // Duplicate reviews
    const duplicates = await Review.aggregate([
      { $group: { _id: { product: '$product', user: '$user' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log(`Duplicate Reviews (same user, same product): ${duplicates.length}`);

    // Reviews with invalid ratings
    const invalidRatings = await Review.find({
      $or: [
        { rating: { $lt: 1 } },
        { rating: { $gt: 5 } }
      ]
    }).countDocuments();
    console.log(`Reviews with Invalid Ratings (not 1-5): ${invalidRatings}`);

    // Products with mismatched rating counts
    const allProducts = await Product.find().select('_id name rating numReviews');
    let mismatchCount = 0;
    
    for (const product of allProducts) {
      const actualReviewCount = await Review.countDocuments({ product: product._id });
      if (actualReviewCount !== product.numReviews) {
        console.log(`  ⚠️  Mismatch: "${product.name}" shows ${product.numReviews} reviews but has ${actualReviewCount}`);
        mismatchCount++;
      }

      if (actualReviewCount > 0) {
        const reviews = await Review.find({ product: product._id });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const calculatedAvg = Math.round((totalRating / reviews.length) * 10) / 10;
        
        if (Math.abs(calculatedAvg - product.rating) > 0.01) {
          console.log(`  ⚠️  Rating Mismatch: "${product.name}" shows ${product.rating}⭐ but calculated is ${calculatedAvg}⭐`);
          mismatchCount++;
        }
      }
    }

    if (mismatchCount === 0) {
      console.log('✅ All product ratings and review counts are accurate!');
    }

    console.log('\n=== ANALYSIS COMPLETE ===\n');

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

analyzeReviews();
