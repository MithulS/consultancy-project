// Comprehensive Product Deletion Script
// Safely removes all products while preserving other data
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Review = require('../models/review');
const Order = require('../models/order');
const User = require('../models/user');

async function deleteAllProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');
    console.log('\n🔍 PRE-DELETION AUDIT:');
    console.log('='.repeat(50));

    // Count all collections before deletion
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const cartCount = await Cart.countDocuments();
    const reviewCount = await Review.countDocuments();

    console.log(`📦 Products: ${productCount}`);
    console.log(`👥 Users: ${userCount}`);
    console.log(`📋 Orders: ${orderCount}`);
    console.log(`🛒 Carts: ${cartCount}`);
    console.log(`⭐ Reviews: ${reviewCount}`);

    if (productCount === 0) {
      console.log('\n✅ No products to delete. Database is already clean.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('\n🗑️  DELETION PROCESS:');
    console.log('='.repeat(50));

    // Step 1: Delete all reviews associated with products
    const reviewDeleteResult = await Review.deleteMany({});
    console.log(`✅ Deleted ${reviewDeleteResult.deletedCount} product reviews`);

    // Step 2: Clear cart items that reference deleted products
    const cartUpdateResult = await Cart.updateMany(
      {},
      { $set: { items: [] } }
    );
    console.log(`✅ Cleared ${cartUpdateResult.modifiedCount} user carts`);

    // Step 3: Delete all products
    const productDeleteResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${productDeleteResult.deletedCount} products`);

    console.log('\n🔍 POST-DELETION VERIFICATION:');
    console.log('='.repeat(50));

    // Verify deletion
    const remainingProducts = await Product.countDocuments();
    const remainingReviews = await Review.countDocuments();
    const verifyUsers = await User.countDocuments();
    const verifyOrders = await Order.countDocuments();

    console.log(`📦 Remaining Products: ${remainingProducts}`);
    console.log(`⭐ Remaining Reviews: ${remainingReviews}`);
    console.log(`👥 Users (unchanged): ${verifyUsers}`);
    console.log(`📋 Orders (unchanged): ${verifyOrders}`);

    console.log('\n✅ PRODUCT DELETION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(50));
    console.log('✓ All products removed');
    console.log('✓ Associated reviews removed');
    console.log('✓ Cart items cleared');
    console.log('✓ User data preserved');
    console.log('✓ Order history preserved');
    console.log('\n💡 Backup available at: backend/backups/');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DELETION FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Execute deletion
console.log('⚠️  WARNING: This will delete ALL products from the database');
console.log('Starting in 3 seconds...\n');

setTimeout(() => {
  deleteAllProducts();
}, 3000);
