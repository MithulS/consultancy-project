// Admin Management Tests - Credential update functionality
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const adminRouter = require('../routes/adminManagement');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);

let mongoServer;
let adminUser;
let adminToken;

process.env.JWT_SECRET = 'test-secret-key-12345';

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

beforeEach(async () => {
  // Create admin user before each test
  const hashedPassword = await bcrypt.hash('CurrentPass@123', 10);
  
  adminUser = await User.create({
    username: 'admintest',
    name: 'Admin Test',
    email: 'admin@test.com',
    password: hashedPassword,
    isVerified: true
  });

  adminToken = jwt.sign(
    { userId: adminUser._id, email: adminUser.email, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('PUT /api/admin/update-credentials', () => {
  
  describe('Authentication & Authorization', () => {
    it('should reject requests without token', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .send({ currentPassword: 'test' })
        .expect(401);

      expect(res.body.msg).toContain('token');
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', 'Bearer invalid-token')
        .send({ currentPassword: 'test' })
        .expect(401);

      expect(res.body.msg).toContain('not valid');
    });

    it('should reject requests from non-admin users', async () => {
      const userToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, isAdmin: false },
        process.env.JWT_SECRET
      );

      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ currentPassword: 'test' })
        .expect(403);

      expect(res.body.msg).toContain('Admin');
    });

    it('should reject requests with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ currentPassword: 'test' })
        .expect(401);

      expect(res.body.msg).toContain('expired');
    });
  });

  describe('Input Validation', () => {
    it('should reject request without current password', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newEmail: 'new@test.com' })
        .expect(400);

      expect(res.body.msg).toContain('Current password');
    });

    it('should reject request with empty current password', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: '   ' })
        .expect(400);

      expect(res.body.msg).toContain('password');
    });

    it('should reject request with no fields to update', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'CurrentPass@123' })
        .expect(400);

      expect(res.body.msg).toContain('at least one field');
    });

    it('should reject invalid email format', async () => {
      const invalidEmails = ['notanemail', '@test.com', 'test@', 'test@.com'];

      for (const email of invalidEmails) {
        const res = await request(app)
          .put('/api/admin/update-credentials')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            currentPassword: 'CurrentPass@123',
            newEmail: email
          })
          .expect(400);

        expect(res.body.msg).toContain('email');
      }
    });

    it('should reject weak passwords', async () => {
      const weakPasswords = [
        'short',
        'onlylowercase',
        'ONLYUPPERCASE',
        '12345678',
        'NoSpecial123'
      ];

      for (const password of weakPasswords) {
        const res = await request(app)
          .put('/api/admin/update-credentials')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            currentPassword: 'CurrentPass@123',
            newPassword: password,
            confirmPassword: password
          })
          .expect(400);

        expect(res.body.msg || res.body.success).toBeDefined();
      }
    });

    it('should reject mismatched password confirmation', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'CurrentPass@123',
          newPassword: 'NewPass@123',
          confirmPassword: 'DifferentPass@123'
        })
        .expect(400);

      expect(res.body.msg).toContain('match');
    });

    it('should reject username with invalid characters', async () => {
      const invalidUsernames = [
        'user name',
        'user@name',
        'user<name>',
        'user/name',
        'ab' // too short
      ];

      for (const username of invalidUsernames) {
        const res = await request(app)
          .put('/api/admin/update-credentials')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            currentPassword: 'CurrentPass@123',
            newUsername: username
          })
          .expect(400);

        expect(res.body.success).toBe(false);
      }
    });
  });

  describe('Password Verification', () => {
    it('should reject incorrect current password', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'WrongPassword@123',
          newEmail: 'newemail@test.com'
        })
        .expect(401);

      expect(res.body.msg).toContain('incorrect');
    });
  });

  describe('Duplicate Prevention', () => {
    it('should reject email already taken by another user', async () => {
      // Create another user with different email
      await User.create({
        username: 'otheruser',
        name: 'Other User',
        email: 'taken@test.com',
        password: await bcrypt.hash('Pass@123', 10),
        isVerified: true
      });

      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'CurrentPass@123',
          newEmail: 'taken@test.com'
        })
        .expect(409);

      expect(res.body.msg).toContain('already');
    });

    it('should reject username already taken by another user', async () => {
      await User.create({
        username: 'takenusername',
        name: 'Other User',
        email: 'other@test.com',
        password: await bcrypt.hash('Pass@123', 10),
        isVerified: true
      });

      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'CurrentPass@123',
          newUsername: 'takenusername'
        })
        .expect(409);

      expect(res.body.msg).toContain('already');
    });

    it('should allow updating to same email (no change)', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'CurrentPass@123',
          newEmail: adminUser.email
        })
        .expect(400);

      expect(res.body.msg).toContain('at least one field');
    });
  });

  describe('Successful Updates', () => {
    it('should successfully update email', async () => {
      const newEmail = 'newemail@test.com';
      
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'CurrentPass@123',
          newEmail: newEmail
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.msg).toContain('updated');

      // Verify email was updated
      const updatedUser = await User.findById(adminUser._id);
      expect(updatedUser.email).toBe(newEmail.toLowerCase());
    });

    it('should successfully update username', async () => {
      const newUsername = 'newusername';
      
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'CurrentPass@123',
          newUsername: newUsername
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      const updatedUser = await User.findById(adminUser._id);
      expect(updatedUser.username).toBe(newUsername);
    });

    it('should successfully update password and hash it', async () => {
      const newPassword = 'NewSecurePass@123';
      
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'CurrentPass@123',
          newPassword: newPassword,
          confirmPassword: newPassword
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify password was updated and hashed
      const updatedUser = await User.findById(adminUser._id);
      expect(updatedUser.password).not.toBe(newPassword); // Should be hashed
      
      const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
      expect(isMatch).toBe(true);
    });

    it('should successfully update multiple fields at once', async () => {
      const updates = {
        currentPassword: 'CurrentPass@123',
        newEmail: 'newemail@test.com',
        newUsername: 'newusername',
        newPassword: 'NewPass@123',
        confirmPassword: 'NewPass@123'
      };
      
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify all updates
      const updatedUser = await User.findById(adminUser._id);
      expect(updatedUser.email).toBe(updates.newEmail.toLowerCase());
      expect(updatedUser.username).toBe(updates.newUsername);
      
      const isMatch = await bcrypt.compare(updates.newPassword, updatedUser.password);
      expect(isMatch).toBe(true);
    });

    it('should trim whitespace from inputs', async () => {
      const res = await request(app)
        .put('/api/admin/update-credentials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: '  CurrentPass@123  ',
          newEmail: '  trimmed@test.com  ',
          newUsername: '  trimmeduser  '
        })
        .expect(200);

      const updatedUser = await User.findById(adminUser._id);
      expect(updatedUser.email).toBe('trimmed@test.com');
      expect(updatedUser.username).toBe('trimmeduser');
    });
  });

  describe('Concurrent Updates', () => {
    it('should handle concurrent update attempts', async () => {
      const updates = Array(3).fill().map((_, i) => 
        request(app)
          .put('/api/admin/update-credentials')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            currentPassword: 'CurrentPass@123',
            newUsername: `concurrent${i}`
          })
      );

      const results = await Promise.all(updates);
      const successCount = results.filter(r => r.status === 200).length;
      
      // At least one should succeed
      expect(successCount).toBeGreaterThan(0);
    });
  });
});

describe('GET /api/admin/profile', () => {
  it('should return admin profile with valid token', async () => {
    const res = await request(app)
      .get('/api/admin/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(adminUser.email);
  });

  it('should not return password in profile', async () => {
    const res = await request(app)
      .get('/api/admin/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject requests without admin token', async () => {
    const userToken = jwt.sign(
      { userId: adminUser._id, email: adminUser.email, isAdmin: false },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get('/api/admin/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
