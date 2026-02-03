// Data Integrity Validation Script
// Run this regularly to ensure review ratings are accurate

require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/review');
const Product = require('../models/product');

async function validateDataIntegrity() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hardware-ecommerce');
    console.log('✅ Connected to database\n');

    console.log('=== DATA INTEGRITY VALIDATION ===\n');

    let issuesFound = 0;
    const fixes = [];

    // Check 1: Duplicate Reviews
    console.log('📋 Check 1: Duplicate Reviews');
    const duplicates = await Review.aggregate([
      {
        $group: {
          _id: { product: '$product', user: '$user' },
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.log(`  ⚠️  Found ${duplicates.length} duplicate review(s)`);
      issuesFound += duplicates.length;
      duplicates.forEach(dup => {
        console.log(`     User has ${dup.count} reviews for same product`);
        console.log(`     Review IDs: ${dup.ids.join(', ')}`);
        fixes.push({
          type: 'duplicate',
          action: `Keep only the most recent review, delete others: ${dup.ids.slice(1).join(', ')}`
        });
      });
    } else {
      console.log('  ✅ No duplicate reviews found');
    }

    // Check 2: Invalid Ratings
    console.log('\n📋 Check 2: Invalid Ratings (outside 1-5 range)');
    const invalidRatings = await Review.find({
      $or: [
        { rating: { $lt: 1 } },
        { rating: { $gt: 5 } },
        { rating: { $exists: false } }
      ]
    });

    if (invalidRatings.length > 0) {
      console.log(`  ⚠️  Found ${invalidRatings.length} invalid rating(s)`);
      issuesFound += invalidRatings.length;
      invalidRatings.forEach(review => {
        console.log(`     Review ${review._id}: rating = ${review.rating}`);
        fixes.push({
          type: 'invalid_rating',
          id: review._id,
          action: 'Delete this review or set rating to valid value (1-5)'
        });
      });
    } else {
      console.log('  ✅ All ratings are valid (1-5)');
    }

    // Check 3: Product Rating Accuracy
    console.log('\n📋 Check 3: Product Rating Accuracy');
    const products = await Product.find();
    let ratingMismatches = 0;
    let countMismatches = 0;

    for (const product of products) {
      const reviews = await Review.find({ product: product._id });
      const actualCount = reviews.length;

      if (actualCount !== product.numReviews) {
        console.log(`  ⚠️  ${product.name}`);
        console.log(`     Stored count: ${product.numReviews}, Actual count: ${actualCount}`);
        countMismatches++;
        issuesFound++;
        fixes.push({
          type: 'count_mismatch',
          productId: product._id,
          productName: product.name,
          action: `Update numReviews from ${product.numReviews} to ${actualCount}`
        });
      }

      if (actualCount > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const calculatedRating = Math.round((totalRating / reviews.length) * 10) / 10;

        if (Math.abs(calculatedRating - product.rating) > 0.01) {
          console.log(`  ⚠️  ${product.name}`);
          console.log(`     Stored rating: ${product.rating}, Calculated rating: ${calculatedRating}`);
          ratingMismatches++;
          issuesFound++;
          fixes.push({
            type: 'rating_mismatch',
            productId: product._id,
            productName: product.name,
            action: `Update rating from ${product.rating} to ${calculatedRating}`
          });
        }
      } else if (product.rating !== 0 || product.numReviews !== 0) {
        console.log(`  ⚠️  ${product.name} has no reviews but rating=${product.rating}, numReviews=${product.numReviews}`);
        issuesFound++;
        fixes.push({
          type: 'no_reviews_but_rated',
          productId: product._id,
          productName: product.name,
          action: 'Reset rating to 0 and numReviews to 0'
        });
      }
    }

    if (ratingMismatches === 0 && countMismatches === 0) {
      console.log('  ✅ All product ratings are accurate');
    }

    // Check 4: Orphaned Reviews (product or user deleted)
    console.log('\n📋 Check 4: Orphaned Reviews');
    const allReviews = await Review.find()
      .populate('product')
      .populate('user')
      .populate('order');
    
    let orphanedReviews = 0;
    allReviews.forEach(review => {
      if (!review.product || !review.user || !review.order) {
        orphanedReviews++;
        console.log(`  ⚠️  Review ${review._id} is orphaned`);
        console.log(`     Product exists: ${!!review.product}`);
        console.log(`     User exists: ${!!review.user}`);
        console.log(`     Order exists: ${!!review.order}`);
        issuesFound++;
        fixes.push({
          type: 'orphaned',
          id: review._id,
          action: 'Delete this orphaned review'
        });
      }
    });

    if (orphanedReviews === 0) {
      console.log('  ✅ No orphaned reviews found');
    }

    // Check 5: Missing Review Timestamps
    console.log('\n📋 Check 5: Missing Timestamps');
    const noTimestamps = await Review.find({
      $or: [
        { createdAt: { $exists: false } },
        { updatedAt: { $exists: false } }
      ]
    });

    if (noTimestamps.length > 0) {
      console.log(`  ⚠️  Found ${noTimestamps.length} review(s) without timestamps`);
      issuesFound += noTimestamps.length;
    } else {
      console.log('  ✅ All reviews have timestamps');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (issuesFound === 0) {
      console.log('✅ DATA INTEGRITY: EXCELLENT');
      console.log('   No issues found. All data is accurate and consistent.');
    } else {
      console.log(`⚠️  DATA INTEGRITY: ${issuesFound} ISSUE(S) FOUND`);
      console.log('\n📝 Recommended Actions:');
      fixes.forEach((fix, index) => {
        console.log(`\n${index + 1}. [${fix.type.toUpperCase()}]`);
        if (fix.productName) console.log(`   Product: ${fix.productName}`);
        if (fix.id) console.log(`   ID: ${fix.id}`);
        console.log(`   Action: ${fix.action}`);
      });
      
      console.log('\n💡 To automatically fix these issues, run:');
      console.log('   node scripts/fixRatings.js');
    }
    console.log('='.repeat(50) + '\n');

    await mongoose.connection.close();
    process.exit(issuesFound > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Validation Error:', err);
    process.exit(1);
  }
}

validateDataIntegrity();
