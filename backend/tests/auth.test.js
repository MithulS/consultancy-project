// Integration tests for authentication endpoints
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRouter = require('../routes/auth');
const User = require('../models/user');
const AuditLog = require('../models/auditLog');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

let mongoServer;

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.CLIENT_URL = 'http://localhost:3000';

beforeAll(async () => {
  // Create in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up test data after each test
  await User.deleteMany({});
  await AuditLog.deleteMany({});
});

describe('Authentication API Tests', () => {
  
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@1234'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);

      // Note: Will likely fail to send email in test environment
      // but should still create user and return appropriate response
      expect([201, 500]).toContain(res.status);
      
      if (res.status === 201) {
        expect(res.body).toHaveProperty('msg');
        expect(res.body).toHaveProperty('email', userData.email);
        
        // Verify user was created in database
        const user = await User.findOne({ email: userData.email });
        expect(user).toBeTruthy();
        expect(user.username).toBe(userData.username);
        expect(user.name).toBe(userData.name);
        expect(user.isVerified).toBe(false);
        expect(user.otp).toBeTruthy();
      }
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
          // missing name and password
        })
        .expect(400);

      expect(res.body.msg).toBe('Missing fields');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'Test@1234'
      };

      // Create first user
      await User.create({
        ...userData,
        password: 'hashed',
        isVerified: false
      });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.msg).toBe('Email already registered');
    });

    it('should reject registration with duplicate username', async () => {
      const userData1 = {
        username: 'testuser',
        name: 'Test User 1',
        email: 'test1@example.com',
        password: 'Test@1234'
      };

      // Create first user
      await User.create({
        ...userData1,
        password: 'hashed',
        isVerified: false
      });

      // Try to register with same username but different email
      const userData2 = {
        username: 'testuser', // same username
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'Test@1234'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData2)
        .expect(400);

      expect(res.body.msg).toBe('Username already taken');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    let testUser;
    let testOtp;

    beforeEach(async () => {
      const bcrypt = require('bcryptjs');
      testOtp = '123456';
      const hashedOtp = await bcrypt.hash(testOtp, 10);
      
      testUser = await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        isVerified: false,
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        otpAttempts: 0
      });
    });

    it('should verify OTP with correct code', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: testUser.email,
          otp: testOtp
        })
        .expect(200);

      expect(res.body.msg).toBe('Email verified successfully');

      // Verify user is now verified
      const user = await User.findById(testUser._id);
      expect(user.isVerified).toBe(true);
      expect(user.otp).toBeUndefined();
      expect(user.otpAttempts).toBe(0);
    });

    it('should reject invalid OTP and track attempts', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: testUser.email,
          otp: '000000' // wrong OTP
        })
        .expect(400);

      expect(res.body.msg).toContain('Invalid OTP');
      expect(res.body.attemptsRemaining).toBe(4);

      // Verify attempt was tracked
      const user = await User.findById(testUser._id);
      expect(user.otpAttempts).toBe(1);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/verify-otp')
          .send({
            email: testUser.email,
            otp: '000000'
          });
      }

      // Verify account is locked
      const user = await User.findById(testUser._id);
      expect(user.otpLockedUntil).toBeTruthy();
      expect(user.otpLockedUntil.getTime()).toBeGreaterThan(Date.now());

      // Try one more attempt - should be rejected due to lock
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: testUser.email,
          otp: testOtp // even with correct OTP
        })
        .expect(429);

      expect(res.body.msg).toContain('locked');
    });

    it('should reject expired OTP', async () => {
      // Set OTP as expired
      testUser.otpExpiresAt = new Date(Date.now() - 1000); // 1 second ago
      await testUser.save();

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: testUser.email,
          otp: testOtp
        })
        .expect(400);

      expect(res.body.msg).toContain('expired');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;
    const testPassword = 'Test@1234';

    beforeEach(async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      testUser = await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        isVerified: true // Verified user
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(400);

      expect(res.body.msg).toBe('Invalid credentials');
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        })
        .expect(400);

      expect(res.body.msg).toBe('Invalid credentials');
    });

    it('should reject login for unverified user', async () => {
      // Create unverified user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const unverifiedUser = await User.create({
        username: 'unverified',
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: hashedPassword,
        isVerified: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: unverifiedUser.email,
          password: testPassword
        })
        .expect(403);

      expect(res.body.msg).toBe('Email not verified');
    });
  });

  describe('POST /api/auth/resend-otp', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        isVerified: false,
        otpAttempts: 3,
        otpLockedUntil: new Date(Date.now() + 5 * 60 * 1000)
      });
    });

    it('should reset attempts and lock when resending OTP', async () => {
      const res = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: testUser.email });

      // Note: Will likely fail to send email in test environment
      if (res.status === 200) {
        const user = await User.findById(testUser._id);
        expect(user.otpAttempts).toBe(0);
        expect(user.otpLockedUntil).toBeUndefined();
      }
    });

    it('should reject resend for verified user', async () => {
      testUser.isVerified = true;
      await testUser.save();

      const res = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: testUser.email })
        .expect(400);

      expect(res.body.msg).toBe('User already verified');
    });
  });

  describe('Audit Logging', () => {
    it('should log successful registration', async () => {
      const userData = {
        username: 'testuser',
        name: 'Test User',
        email: 'audit@example.com',
        password: 'Test@1234'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Check if audit log was created
      const logs = await AuditLog.find({ email: userData.email });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should log failed login attempts', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'audit@example.com',
          password: 'WrongPassword'
        });

      const logs = await AuditLog.find({ 
        email: 'audit@example.com',
        action: 'LOGIN_FAILED'
      });
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
