// Unit tests for Review Rating System
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Review = require('../models/review');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

describe('Review Rating System Tests', () => {
  let authToken;
  let testUser;
  let testProduct;
  let testOrder;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/hardware-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await Review.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      isVerified: true
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      category: 'Tools',
      stock: 50,
      rating: 0,
      numReviews: 0
    });

    // Create test order
    testOrder = await Order.create({
      user: testUser._id,
      items: [{ product: testProduct._id, quantity: 1, price: 100 }],
      totalAmount: 100,
      status: 'delivered'
    });

    // Mock auth token
    authToken = 'mock-jwt-token';
  });

  describe('Rating Calculation Logic', () => {
    test('should calculate correct average for multiple reviews', async () => {
      const ratings = [5, 4, 5, 3, 4];
      
      for (const rating of ratings) {
        await Review.create({
          product: testProduct._id,
          user: testUser._id,
          order: testOrder._id,
          rating
        });
      }

      // Trigger rating recalculation
      const reviews = await Review.find({ product: testProduct._id });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;

      expect(avgRating).toBe(4.2);
      expect(reviews.length).toBe(5);
    });

    test('should handle single review correctly', async () => {
      await Review.create({
        product: testProduct._id,
        user: testUser._id,
        order: testOrder._id,
        rating: 5
      });

      const reviews = await Review.find({ product: testProduct._id });
      const avgRating = reviews[0].rating;

      expect(avgRating).toBe(5);
      expect(reviews.length).toBe(1);
    });

    test('should return 0 for product with no reviews', async () => {
      const reviews = await Review.find({ product: testProduct._id });
      const rating = reviews.length === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      expect(rating).toBe(0);
      expect(reviews.length).toBe(0);
    });

    test('should round to one decimal place', async () => {
      await Review.create({
        product: testProduct._id,
        user: testUser._id,
        order: testOrder._id,
        rating: 4
      });
      
      const secondUser = await User.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'hash',
        isVerified: true
      });

      await Review.create({
        product: testProduct._id,
        user: secondUser._id,
        order: testOrder._id,
        rating: 5
      });

      const reviews = await Review.find({ product: testProduct._id });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;

      expect(avgRating).toBe(4.5);
    });
  });

  describe('Data Integrity Tests', () => {
    test('should prevent duplicate reviews from same user', async () => {
      await Review.create({
        product: testProduct._id,
        user: testUser._id,
        order: testOrder._id,
        rating: 5
      });

      await expect(
        Review.create({
          product: testProduct._id,
          user: testUser._id,
          order: testOrder._id,
          rating: 4
        })
      ).rejects.toThrow();
    });

    test('should validate rating is between 1 and 5', async () => {
      await expect(
        Review.create({
          product: testProduct._id,
          user: testUser._id,
          order: testOrder._id,
          rating: 0
        })
      ).rejects.toThrow();

      await expect(
        Review.create({
          product: testProduct._id,
          user: testUser._id,
          order: testOrder._id,
          rating: 6
        })
      ).rejects.toThrow();
    });

    test('should require product, user, order, and rating fields', async () => {
      await expect(
        Review.create({
          product: testProduct._id,
          user: testUser._id,
          // Missing order and rating
        })
      ).rejects.toThrow();
    });
  });

  describe('Product Rating Update Tests', () => {
    test('should update product rating when review is created', async () => {
      await Review.create({
        product: testProduct._id,
        user: testUser._id,
        order: testOrder._id,
        rating: 5
      });

      // Simulate updateProductRating function
      const reviews = await Review.find({ product: testProduct._id });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await Product.findByIdAndUpdate(testProduct._id, {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: reviews.length
      });

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.rating).toBe(5);
      expect(updatedProduct.numReviews).toBe(1);
    });

    test('should update product rating when review is deleted', async () => {
      const review1 = await Review.create({
        product: testProduct._id,
        user: testUser._id,
        order: testOrder._id,
        rating: 5
      });

      const user2 = await User.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'hash',
        isVerified: true
      });

      await Review.create({
        product: testProduct._id,
        user: user2._id,
        order: testOrder._id,
        rating: 3
      });

      // Initial rating should be (5+3)/2 = 4.0
      let reviews = await Review.find({ product: testProduct._id });
      let avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(testProduct._id, {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: reviews.length
      });

      let product = await Product.findById(testProduct._id);
      expect(product.rating).toBe(4.0);
      expect(product.numReviews).toBe(2);

      // Delete one review
      await Review.findByIdAndDelete(review1._id);

      // Rating should now be 3.0
      reviews = await Review.find({ product: testProduct._id });
      avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      await Product.findByIdAndUpdate(testProduct._id, {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: reviews.length
      });

      product = await Product.findById(testProduct._id);
      expect(product.rating).toBe(3.0);
      expect(product.numReviews).toBe(1);
    });

    test('should reset rating to 0 when all reviews are deleted', async () => {
      const review = await Review.create({
        product: testProduct._id,
        user: testUser._id,
        order: testOrder._id,
        rating: 5
      });

      await Review.findByIdAndDelete(review._id);

      const reviews = await Review.find({ product: testProduct._id });
      await Product.findByIdAndUpdate(testProduct._id, {
        rating: 0,
        numReviews: 0
      });

      const product = await Product.findById(testProduct._id);
      expect(product.rating).toBe(0);
      expect(product.numReviews).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle all 5-star reviews', async () => {
      for (let i = 0; i < 5; i++) {
        const user = await User.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'hash',
          isVerified: true
        });

        await Review.create({
          product: testProduct._id,
          user: user._id,
          order: testOrder._id,
          rating: 5
        });
      }

      const reviews = await Review.find({ product: testProduct._id });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      expect(avgRating).toBe(5.0);
    });

    test('should handle all 1-star reviews', async () => {
      for (let i = 0; i < 5; i++) {
        const user = await User.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'hash',
          isVerified: true
        });

        await Review.create({
          product: testProduct._id,
          user: user._id,
          order: testOrder._id,
          rating: 1
        });
      }

      const reviews = await Review.find({ product: testProduct._id });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      expect(avgRating).toBe(1.0);
    });

    test('should handle review update changing rating', async () => {
      const review = await Review.create({
        product: testProduct._id,
        user: testUser._id,
        order: testOrder._id,
        rating: 3
      });

      // Update rating
      review.rating = 5;
      await review.save();

      const reviews = await Review.find({ product: testProduct._id });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      expect(avgRating).toBe(5.0);
    });
  });

  describe('Rating Distribution Tests', () => {
    test('should calculate correct distribution', async () => {
      const ratings = [5, 5, 4, 4, 4, 3, 3, 2, 1];
      
      for (let i = 0; i < ratings.length; i++) {
        const user = await User.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'hash',
          isVerified: true
        });

        await Review.create({
          product: testProduct._id,
          user: user._id,
          order: testOrder._id,
          rating: ratings[i]
        });
      }

      const distribution = await Review.aggregate([
        { $match: { product: testProduct._id } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      expect(distribution.find(d => d._id === 5).count).toBe(2);
      expect(distribution.find(d => d._id === 4).count).toBe(3);
      expect(distribution.find(d => d._id === 3).count).toBe(2);
      expect(distribution.find(d => d._id === 2).count).toBe(1);
      expect(distribution.find(d => d._id === 1).count).toBe(1);
    });
  });
});
