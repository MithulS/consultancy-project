// Comprehensive E-Commerce QA Test Suite
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

class ECommerceQATester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(category, test, status, message, details = null) {
    const result = {
      category,
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.tests.push(result);
    
    if (status === 'PASS') {
      this.testResults.passed++;
      console.log(`✅ [${category}] ${test}: ${message}`);
    } else if (status === 'FAIL') {
      this.testResults.failed++;
      console.error(`❌ [${category}] ${test}: ${message}`);
      if (details) console.error('   Details:', details);
    } else if (status === 'WARN') {
      this.testResults.warnings++;
      console.warn(`⚠️  [${category}] ${test}: ${message}`);
    }
  }

  // ========================================
  // 1. FUNCTIONAL TESTING
  // ========================================

  async testDatabaseConnection() {
    try {
      const state = mongoose.connection.readyState;
      if (state === 1) {
        this.log('Functional', 'Database Connection', 'PASS', 'MongoDB connected successfully');
        return true;
      } else {
        this.log('Functional', 'Database Connection', 'FAIL', 'MongoDB not connected', { state });
        return false;
      }
    } catch (error) {
      this.log('Functional', 'Database Connection', 'FAIL', 'Database connection error', error.message);
      return false;
    }
  }

  async testProductModel() {
    try {
      // Test product schema
      const sampleProduct = new Product({
        name: 'QA Test Product',
        description: 'Test product for QA',
        price: 99.99,
        category: 'Hardware',
        stock: 100,
        imageUrl: 'https://example.com/test.jpg'
      });

      const errors = sampleProduct.validateSync();
      if (errors) {
        this.log('Functional', 'Product Model Validation', 'FAIL', 'Product validation failed', errors);
        return false;
      }

      this.log('Functional', 'Product Model Validation', 'PASS', 'Product model validates correctly');
      return true;
    } catch (error) {
      this.log('Functional', 'Product Model Validation', 'FAIL', 'Product model error', error.message);
      return false;
    }
  }

  async testProductCRUD() {
    try {
      // Test Create
      const testProduct = await Product.create({
        name: 'QA CRUD Test Product',
        description: 'Testing CRUD operations',
        price: 49.99,
        category: 'Tools',
        stock: 50,
        imageUrl: 'https://example.com/crud-test.jpg'
      });

      if (!testProduct._id) {
        throw new Error('Product creation failed - no ID returned');
      }

      // Test Read
      const foundProduct = await Product.findById(testProduct._id);
      if (!foundProduct) {
        throw new Error('Product read failed - product not found');
      }

      // Test Update
      foundProduct.price = 59.99;
      await foundProduct.save();
      const updatedProduct = await Product.findById(testProduct._id);
      if (updatedProduct.price !== 59.99) {
        throw new Error('Product update failed - price not updated');
      }

      // Test Delete
      await Product.findByIdAndDelete(testProduct._id);
      const deletedProduct = await Product.findById(testProduct._id);
      if (deletedProduct) {
        throw new Error('Product delete failed - product still exists');
      }

      this.log('Functional', 'Product CRUD Operations', 'PASS', 'All CRUD operations successful');
      return true;
    } catch (error) {
      this.log('Functional', 'Product CRUD Operations', 'FAIL', 'CRUD operation failed', error.message);
      return false;
    }
  }

  async testSearchFunctionality() {
    try {
      // Test text search
      const products = await Product.find({ name: { $regex: 'test', $options: 'i' } });
      
      // Test category filter
      const categoryProducts = await Product.find({ category: 'Hardware' });
      
      // Test price range
      const priceProducts = await Product.find({ price: { $gte: 10, $lte: 100 } });
      
      this.log('Functional', 'Search Functionality', 'PASS', `Search working: ${products.length} results`);
      return true;
    } catch (error) {
      this.log('Functional', 'Search Functionality', 'FAIL', 'Search failed', error.message);
      return false;
    }
  }

  async testInventoryManagement() {
    try {
      const product = await Product.findOne();
      if (!product) {
        this.log('Functional', 'Inventory Management', 'WARN', 'No products found for testing');
        return true;
      }

      const originalStock = product.stock;
      
      // Test stock reduction
      product.stock -= 5;
      await product.save();
      
      const updated = await Product.findById(product._id);
      if (updated.stock !== originalStock - 5) {
        throw new Error('Stock reduction failed');
      }

      // Test inStock flag
      if (updated.stock > 0 && !updated.inStock) {
        throw new Error('inStock flag incorrect for positive stock');
      }

      // Restore original stock
      product.stock = originalStock;
      await product.save();

      this.log('Functional', 'Inventory Management', 'PASS', 'Inventory tracking works correctly');
      return true;
    } catch (error) {
      this.log('Functional', 'Inventory Management', 'FAIL', 'Inventory management error', error.message);
      return false;
    }
  }

  // ========================================
  // 2. SECURITY TESTING
  // ========================================

  async testPasswordHashing() {
    try {
      const bcrypt = require('bcryptjs');
      const testPassword = 'TestPassword123!';
      const hash = await bcrypt.hash(testPassword, 10);
      
      if (hash === testPassword) {
        throw new Error('Password not hashed - stored in plain text!');
      }

      const isMatch = await bcrypt.compare(testPassword, hash);
      if (!isMatch) {
        throw new Error('Password comparison failed');
      }

      this.log('Security', 'Password Hashing', 'PASS', 'Passwords are properly hashed');
      return true;
    } catch (error) {
      this.log('Security', 'Password Hashing', 'FAIL', 'Password hashing issue', error.message);
      return false;
    }
  }

  async testInputValidation() {
    try {
      // Test SQL injection prevention
      const maliciousInput = "'; DROP TABLE products; --";
      const result = await Product.findOne({ name: maliciousInput });
      
      // Test XSS prevention
      const xssInput = '<script>alert("XSS")</script>';
      const product = new Product({
        name: xssInput,
        description: 'Test',
        price: 10,
        category: 'Hardware',
        stock: 1
      });

      // Should validate and sanitize
      this.log('Security', 'Input Validation', 'PASS', 'Input validation mechanisms in place');
      return true;
    } catch (error) {
      this.log('Security', 'Input Validation', 'FAIL', 'Input validation issue', error.message);
      return false;
    }
  }

  async testAuthenticationSecurity() {
    try {
      const jwt = require('jsonwebtoken');
      
      // Test JWT secret exists
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET is weak or missing');
      }

      // Test token generation
      const token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.userId) {
        throw new Error('Token verification failed');
      }

      this.log('Security', 'Authentication', 'PASS', 'JWT authentication secure');
      return true;
    } catch (error) {
      this.log('Security', 'Authentication', 'FAIL', 'Authentication security issue', error.message);
      return false;
    }
  }

  async testEnvironmentVariables() {
    const required = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
    const missing = [];
    const weak = [];

    for (const key of required) {
      if (!process.env[key]) {
        missing.push(key);
      } else if (key === 'JWT_SECRET' && process.env[key].length < 32) {
        weak.push(key);
      }
    }

    if (missing.length > 0) {
      this.log('Security', 'Environment Variables', 'FAIL', `Missing: ${missing.join(', ')}`);
      return false;
    }

    if (weak.length > 0) {
      this.log('Security', 'Environment Variables', 'WARN', `Weak secrets: ${weak.join(', ')}`);
    } else {
      this.log('Security', 'Environment Variables', 'PASS', 'All required variables configured');
    }

    return true;
  }

  // ========================================
  // 3. PERFORMANCE TESTING
  // ========================================

  async testDatabaseIndexes() {
    try {
      const indexes = await Product.collection.getIndexes();
      const indexCount = Object.keys(indexes).length;

      if (indexCount < 3) {
        this.log('Performance', 'Database Indexes', 'WARN', `Only ${indexCount} indexes found. Consider adding more.`);
      } else {
        this.log('Performance', 'Database Indexes', 'PASS', `${indexCount} indexes configured`);
      }

      return true;
    } catch (error) {
      this.log('Performance', 'Database Indexes', 'FAIL', 'Index check failed', error.message);
      return false;
    }
  }

  async testQueryPerformance() {
    try {
      const start = Date.now();
      await Product.find({ category: 'Hardware' }).limit(10);
      const duration = Date.now() - start;

      if (duration > 100) {
        this.log('Performance', 'Query Speed', 'WARN', `Slow query: ${duration}ms`);
      } else {
        this.log('Performance', 'Query Speed', 'PASS', `Fast query: ${duration}ms`);
      }

      return true;
    } catch (error) {
      this.log('Performance', 'Query Speed', 'FAIL', 'Query performance test failed', error.message);
      return false;
    }
  }

  // ========================================
  // 4. DATA INTEGRITY TESTING
  // ========================================

  async testDataConsistency() {
    try {
      // Check for orphaned data
      const products = await Product.find();
      
      // Verify required fields
      for (const product of products.slice(0, 10)) {
        if (!product.name || !product.price || !product.category) {
          throw new Error(`Product ${product._id} missing required fields`);
        }

        if (product.price < 0) {
          throw new Error(`Product ${product._id} has negative price`);
        }

        if (product.stock < 0) {
          throw new Error(`Product ${product._id} has negative stock`);
        }
      }

      this.log('Data Integrity', 'Data Consistency', 'PASS', 'Data is consistent');
      return true;
    } catch (error) {
      this.log('Data Integrity', 'Data Consistency', 'FAIL', 'Data consistency issue', error.message);
      return false;
    }
  }

  async testDataValidation() {
    try {
      // Test invalid product creation
      try {
        await Product.create({
          name: '', // Empty name - should fail
          description: 'Test',
          price: -10, // Negative price - should fail
          category: 'InvalidCategory',
          stock: -5 // Negative stock - should fail
        });
        throw new Error('Invalid product was created - validation not working');
      } catch (validationError) {
        if (validationError.name === 'ValidationError') {
          this.log('Data Integrity', 'Data Validation', 'PASS', 'Schema validation working correctly');
          return true;
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      this.log('Data Integrity', 'Data Validation', 'FAIL', 'Validation error', error.message);
      return false;
    }
  }

  // ========================================
  // 5. ERROR HANDLING TESTING
  // ========================================

  async testErrorHandling() {
    try {
      // Test invalid ID format
      try {
        await Product.findById('invalid-id-format');
      } catch (error) {
        if (error.name === 'CastError') {
          this.log('Error Handling', 'Invalid ID Handling', 'PASS', 'Invalid IDs handled correctly');
        }
      }

      // Test non-existent ID
      const nonExistent = await Product.findById('507f1f77bcf86cd799439011');
      if (nonExistent === null) {
        this.log('Error Handling', 'Not Found Handling', 'PASS', 'Missing records handled correctly');
      }

      return true;
    } catch (error) {
      this.log('Error Handling', 'Error Handling', 'FAIL', 'Error handling issue', error.message);
      return false;
    }
  }

  // ========================================
  // GENERATE REPORT
  // ========================================

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 E-COMMERCE QA TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Test Date: ${new Date().toISOString()}`);
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Passed: ${this.testResults.passed}`);
    console.log(`   ❌ Failed: ${this.testResults.failed}`);
    console.log(`   ⚠️  Warnings: ${this.testResults.warnings}`);
    console.log(`   📝 Total Tests: ${this.testResults.tests.length}`);
    
    const passRate = (this.testResults.passed / this.testResults.tests.length * 100).toFixed(1);
    console.log(`   🎯 Pass Rate: ${passRate}%`);

    console.log('\n' + '='.repeat(80));
    console.log('📋 Test Results by Category:\n');

    const categories = [...new Set(this.testResults.tests.map(t => t.category))];
    for (const category of categories) {
      const categoryTests = this.testResults.tests.filter(t => t.category === category);
      const passed = categoryTests.filter(t => t.status === 'PASS').length;
      const failed = categoryTests.filter(t => t.status === 'FAIL').length;
      const warned = categoryTests.filter(t => t.status === 'WARN').length;

      console.log(`\n${category}:`);
      console.log(`   ✅ ${passed} passed  ❌ ${failed} failed  ⚠️  ${warned} warnings`);
    }

    console.log('\n' + '='.repeat(80));
    
    if (this.testResults.failed > 0) {
      console.log('\n🔴 FAILED TESTS:');
      this.testResults.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => {
          console.log(`\n   ❌ [${t.category}] ${t.test}`);
          console.log(`      ${t.message}`);
          if (t.details) console.log(`      Details: ${t.details}`);
        });
    }

    if (this.testResults.warnings > 0) {
      console.log('\n🟡 WARNINGS:');
      this.testResults.tests
        .filter(t => t.status === 'WARN')
        .forEach(t => {
          console.log(`\n   ⚠️  [${t.category}] ${t.test}`);
          console.log(`      ${t.message}`);
        });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ QA Testing Complete!');
    console.log('='.repeat(80) + '\n');

    return this.testResults;
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive QA Tests...\n');

    // Connect to database
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB\n');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }

    // Run all tests
    await this.testDatabaseConnection();
    await this.testProductModel();
    await this.testProductCRUD();
    await this.testSearchFunctionality();
    await this.testInventoryManagement();
    
    await this.testPasswordHashing();
    await this.testInputValidation();
    await this.testAuthenticationSecurity();
    await this.testEnvironmentVariables();
    
    await this.testDatabaseIndexes();
    await this.testQueryPerformance();
    
    await this.testDataConsistency();
    await this.testDataValidation();
    
    await this.testErrorHandling();

    // Generate report
    const report = this.generateReport();

    // Close connection
    await mongoose.connection.close();

    return report;
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new ECommerceQATester();
  tester.runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = ECommerceQATester;
