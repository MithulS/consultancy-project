// Review Rating Correction Script
require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/review');
const Product = require('../models/product');

async function recalculateAllRatings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hardware-ecommerce');
    console.log('✅ Connected to database\n');

    console.log('🔄 Recalculating all product ratings...\n');

    const products = await Product.find();
    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        const reviews = await Review.find({ product: product._id });
        
        if (reviews.length === 0) {
          // No reviews - set to 0
          if (product.rating !== 0 || product.numReviews !== 0) {
            await Product.findByIdAndUpdate(product._id, {
              rating: 0,
              numReviews: 0
            });
            console.log(`  ✓ ${product.name}: Reset to 0 (no reviews)`);
            updatedCount++;
          }
        } else {
          // Calculate average
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
          
          if (product.rating !== avgRating || product.numReviews !== reviews.length) {
            await Product.findByIdAndUpdate(product._id, {
              rating: avgRating,
              numReviews: reviews.length
            });
            console.log(`  ✓ ${product.name}: ${avgRating}⭐ (${reviews.length} reviews)`);
            updatedCount++;
          }
        }
      } catch (err) {
        console.error(`  ✗ Error processing ${product.name}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Recalculation complete!`);
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total products: ${products.length}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

recalculateAllRatings();
