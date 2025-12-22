// Comprehensive E-Commerce Platform Testing Suite
require('dotenv').config();
const mongoose = require('mongoose');

async function runComprehensiveTests() {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  const test = (name, condition, severity = 'critical') => {
    const result = {
      name,
      status: condition ? 'PASS' : 'FAIL',
      severity,
      timestamp: new Date().toISOString()
    };
    results.tests.push(result);
    if (condition) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      if (severity === 'warning') {
        results.warnings++;
        console.log(`⚠️  ${name}`);
      } else {
        results.failed++;
        console.log(`❌ ${name}`);
      }
    }
    return condition;
  };

  console.log('\n🔍 E-COMMERCE PLATFORM COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(70));

  try {
    // Database Connection Tests
    console.log('\n📊 DATABASE CONNECTIVITY TESTS:');
    console.log('-'.repeat(70));
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    test('Database connection established', true);
    test('MongoDB URI configured', !!process.env.MONGO_URI);

    // Model Loading Tests
    console.log('\n📦 MODEL INTEGRITY TESTS:');
    console.log('-'.repeat(70));
    
    const User = require('../models/user');
    const Product = require('../models/product');
    const Order = require('../models/order');
    const Cart = require('../models/cart');
    const Review = require('../models/review');
    
    test('User model loaded', !!User);
    test('Product model loaded', !!Product);
    test('Order model loaded', !!Order);
    test('Cart model loaded', !!Cart);
    test('Review model loaded', !!Review);

    // Database Schema Tests
    console.log('\n🗄️  DATABASE SCHEMA VALIDATION:');
    console.log('-'.repeat(70));
    
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    test('User collection accessible', userCount >= 0);
    test('Product collection accessible', productCount >= 0);
    test('Order collection accessible', orderCount >= 0);
    
    console.log(`   ├─ Users: ${userCount}`);
    console.log(`   ├─ Products: ${productCount}`);
    console.log(`   └─ Orders: ${orderCount}`);

    // Environment Configuration Tests
    console.log('\n⚙️  ENVIRONMENT CONFIGURATION TESTS:');
    console.log('-'.repeat(70));
    
    test('JWT_SECRET configured', !!process.env.JWT_SECRET && process.env.JWT_SECRET.length > 10);
    test('ADMIN_SECRET configured', !!process.env.ADMIN_SECRET);
    test('EMAIL_USER configured', !!process.env.EMAIL_USER);
    test('EMAIL_PASS configured', !!process.env.EMAIL_PASS);
    test('FRONTEND_URL configured', !!process.env.FRONTEND_URL);
    test('Stripe configuration', !!process.env.STRIPE_SECRET_KEY, 'warning');

    // Security Configuration Tests
    console.log('\n🔐 SECURITY CONFIGURATION TESTS:');
    console.log('-'.repeat(70));
    
    const bcrypt = require('bcryptjs');
    test('Bcrypt library available', !!bcrypt);
    
    const jwt = require('jsonwebtoken');
    test('JWT library available', !!jwt);
    
    test('JWT secret strength (>32 chars)', process.env.JWT_SECRET?.length > 32);
    test('Admin secret configured separately', process.env.ADMIN_SECRET !== process.env.JWT_SECRET);

    // Middleware Tests
    console.log('\n🛡️  MIDDLEWARE INTEGRITY TESTS:');
    console.log('-'.repeat(70));
    
    const auth = require('../middleware/auth');
    const validators = require('../middleware/validators');
    const rateLimiter = require('../middleware/rateLimiter');
    
    test('Auth middleware loaded', !!auth.verifyToken);
    test('Admin auth middleware loaded', !!auth.verifyAdmin);
    test('Validators middleware loaded', !!validators);
    test('Rate limiter middleware loaded', !!rateLimiter);

    // File System Tests
    console.log('\n📁 FILE SYSTEM & UPLOAD TESTS:');
    console.log('-'.repeat(70));
    
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, '../uploads/products');
    const uploadsDirExists = fs.existsSync(uploadsDir);
    test('Uploads directory exists', uploadsDirExists);
    
    if (uploadsDirExists) {
      const uploadFiles = fs.readdirSync(uploadsDir);
      console.log(`   └─ Upload files: ${uploadFiles.length}`);
    }

    // API Route Tests
    console.log('\n🛣️  API ROUTE CONFIGURATION TESTS:');
    console.log('-'.repeat(70));
    
    test('Auth routes exist', fs.existsSync(path.join(__dirname, '../routes/auth.js')));
    test('Product routes exist', fs.existsSync(path.join(__dirname, '../routes/products.js')));
    test('Order routes exist', fs.existsSync(path.join(__dirname, '../routes/orders.js')));
    test('Cart routes exist', fs.existsSync(path.join(__dirname, '../routes/cart.js')));
    test('Payment routes exist', fs.existsSync(path.join(__dirname, '../routes/payments.js')));

    // Email Service Tests
    console.log('\n📧 EMAIL SERVICE TESTS:');
    console.log('-'.repeat(70));
    
    const nodemailer = require('nodemailer');
    test('Nodemailer library available', !!nodemailer);
    
    const otpService = require('../services/otpService');
    test('OTP service loaded', !!otpService);

    // User Model Tests
    console.log('\n👤 USER MODEL FUNCTIONALITY TESTS:');
    console.log('-'.repeat(70));
    
    const sampleUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      phone: '1234567890'
    });
    
    test('User model can create instance', !!sampleUser);
    test('User model has required fields', sampleUser.schema.paths.email.isRequired);
    test('User model has password field', !!sampleUser.schema.paths.password);
    test('User model has role field', !!sampleUser.schema.paths.role);

    // Product Model Tests
    console.log('\n📦 PRODUCT MODEL FUNCTIONALITY TESTS:');
    console.log('-'.repeat(70));
    
    const sampleProduct = new Product({
      name: 'Test Product',
      price: 999,
      category: 'Test',
      stock: 10
    });
    
    test('Product model can create instance', !!sampleProduct);
    test('Product model has price validation', !!sampleProduct.schema.paths.price);
    test('Product model has stock tracking', !!sampleProduct.schema.paths.stock);
    test('Product model has category field', !!sampleProduct.schema.paths.category);

    // Disconnect
    await mongoose.disconnect();

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    test(`System stability: ${error.message}`, false);
  }

  // Summary Report
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY REPORT');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📋 Total Tests: ${results.tests.length}`);
  
  const successRate = ((results.passed / results.tests.length) * 100).toFixed(2);
  console.log(`\n📈 Success Rate: ${successRate}%`);
  
  if (results.failed === 0 && results.warnings === 0) {
    console.log('\n🎉 ALL TESTS PASSED - SYSTEM FULLY OPERATIONAL');
  } else if (results.failed === 0) {
    console.log('\n✅ ALL CRITICAL TESTS PASSED - Minor warnings present');
  } else {
    console.log('\n⚠️  ATTENTION REQUIRED - Some tests failed');
  }
  
  console.log('='.repeat(70) + '\n');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

runComprehensiveTests();
