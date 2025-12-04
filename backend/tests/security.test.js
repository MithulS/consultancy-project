// Security Test Suite - XSS, SQL Injection, CSRF, Rate Limiting
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRouter = require('../routes/auth');
const User = require('../models/user');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

let mongoServer;

process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.NODE_ENV = 'development';

beforeAll(async () => {
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
  await User.deleteMany({});
});

describe('Security Test Suite', () => {
  
  describe('XSS (Cross-Site Scripting) Prevention', () => {
    it('should escape HTML in registration name field', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      ];

      for (const payload of xssPayloads) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            name: payload,
            email: 'test@example.com',
            password: 'Test@1234'
          });

        if (res.status === 201) {
          const user = await User.findOne({ email: 'test@example.com' });
          
          // Name should not contain script tags
          expect(user.name).not.toContain('<script>');
          expect(user.name).not.toContain('<img');
          expect(user.name).not.toContain('javascript:');
          expect(user.name).not.toContain('onerror=');
          
          await User.deleteMany({ email: 'test@example.com' });
        }
      }
    });

    it('should escape HTML in username field', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: '<script>alert(1)</script>',
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      if (res.status === 201) {
        const user = await User.findOne({ email: 'test@example.com' });
        expect(user.username).not.toContain('<script>');
      }
    });

    it('should sanitize special characters in inputs', async () => {
      const specialChars = ['<', '>', '"', "'", '&', '/', '\\'];
      
      for (const char of specialChars) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: `test${char}user`,
            name: `Test${char}User`,
            email: `test${Date.now()}@example.com`,
            password: 'Test@1234'
          });

        // Should either reject or sanitize
        expect([400, 201]).toContain(res.status);
      }
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should reject SQL injection in email field', async () => {
      const sqlPayloads = [
        "admin'--",
        "admin' OR '1'='1",
        "'; DROP TABLE users--",
        "admin' OR 1=1--",
        "' UNION SELECT * FROM users--"
      ];

      for (const payload of sqlPayloads) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'Test@1234'
          });

        // Should be rejected or return invalid credentials
        expect([400, 403]).toContain(res.status);
        expect(res.body.msg).not.toContain('syntax');
      }
    });

    it('should handle MongoDB injection attempts', async () => {
      const mongoPayloads = [
        { $ne: null },
        { $gt: '' },
        { $regex: '.*' }
      ];

      for (const payload of mongoPayloads) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'Test@1234'
          });

        // Should reject non-string inputs
        expect(res.status).toBe(400);
      }
    });
  });

  describe('NoSQL Injection Prevention', () => {
    it('should reject object-based email in login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $ne: '' },
          password: { $ne: '' }
        });

      expect(res.status).toBe(400);
    });

    it('should reject array-based inputs', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: ['admin@test.com'],
          password: ['password']
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on registration endpoint', async () => {
      const requests = [];
      
      // Make 20 registration attempts
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .post('/api/auth/register')
            .send({
              username: `user${i}`,
              name: 'Test User',
              email: `test${i}@example.com`,
              password: 'Test@1234'
            })
        );
      }

      const results = await Promise.all(requests);
      
      // Some requests should be rate limited (429 status)
      const rateLimited = results.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 15000); // Increase timeout for this test

    it('should enforce rate limits on login endpoint', async () => {
      const requests = [];
      
      // Make 20 login attempts
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'Test@1234'
            })
        );
      }

      const results = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimited = results.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 15000);

    it('should enforce rate limits on OTP verification', async () => {
      // Create a test user first
      const bcrypt = require('bcryptjs');
      const testOtp = '123456';
      const hashedOtp = await bcrypt.hash(testOtp, 10);
      
      await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        isVerified: false,
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        otpAttempts: 0
      });

      const requests = [];
      
      // Make 20 OTP verification attempts
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .post('/api/auth/verify-otp')
            .send({
              email: 'test@example.com',
              otp: '000000'
            })
        );
      }

      const results = await Promise.all(requests);
      
      // Should be rate limited or account locked
      const blocked = results.filter(r => [429, 400].includes(r.status));
      expect(blocked.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Password Security', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        'password',        // No uppercase, numbers, symbols
        'Password',        // No numbers, symbols
        'Password123',     // No symbols
        'Pass@1',          // Too short
        '12345678',        // No letters
        'ALLUPPERCASE123@' // No lowercase
      ];

      for (const password of weakPasswords) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: password
          });

        // Should be rejected
        expect([400, 500]).toContain(res.status);
      }
    });

    it('should hash passwords before storing', async () => {
      const plainPassword = 'Test@1234';
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          password: plainPassword
        });

      if (res.status === 201) {
        const user = await User.findOne({ email: 'test@example.com' });
        
        // Password should be hashed, not plain text
        expect(user.password).not.toBe(plainPassword);
        expect(user.password.length).toBeGreaterThan(20); // bcrypt hashes are longer
        expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt format
      }
    });
  });

  describe('JWT Token Security', () => {
    it('should sign tokens with secret', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      
      await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        isVerified: true
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      if (res.status === 200) {
        const token = res.body.token;
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT format
      }
    });

    it('should include expiration in tokens', async () => {
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      
      await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        isVerified: true
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      if (res.status === 200) {
        const token = res.body.token;
        const decoded = jwt.decode(token);
        
        expect(decoded.exp).toBeDefined();
        expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
      }
    });
  });

  describe('Input Length Limits', () => {
    it('should reject excessively long email', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          name: 'Test User',
          email: longEmail,
          password: 'Test@1234'
        });

      expect(res.status).toBe(400);
    });

    it('should reject excessively long username', async () => {
      const longUsername = 'a'.repeat(100);
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: longUsername,
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      expect(res.status).toBe(400);
    });

    it('should reject excessively long name', async () => {
      const longName = 'a'.repeat(500);
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          name: longName,
          email: 'test@example.com',
          password: 'Test@1234'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Account Enumeration Prevention', () => {
    it('should return same error for existing and non-existing users on login', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      
      // Create existing user
      await User.create({
        username: 'existinguser',
        name: 'Existing User',
        email: 'existing@example.com',
        password: hashedPassword,
        isVerified: true
      });

      // Try with existing user
      const res1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'WrongPassword'
        });

      // Try with non-existing user
      const res2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexisting@example.com',
          password: 'WrongPassword'
        });

      // Both should return same generic message
      expect(res1.status).toBe(res2.status);
      expect(res1.body.msg).toBe(res2.body.msg);
    });
  });

  describe('Session Security', () => {
    it('should not expose sensitive data in responses', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      
      await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        isVerified: true
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      if (res.status === 200) {
        // Password should not be in response
        expect(res.body.user.password).toBeUndefined();
        expect(JSON.stringify(res.body)).not.toContain(hashedPassword);
      }
    });
  });
});
