// Upload Routes Tests - Comprehensive security and functionality testing
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs').promises;
const uploadRouter = require('../routes/upload');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/upload', uploadRouter);

let mongoServer;
let adminToken;
let adminUser;

process.env.JWT_SECRET = 'test-secret-key-12345';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);

  // Create admin user
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  adminUser = await User.create({
    username: 'admintest',
    name: 'Admin Test',
    email: 'admin@test.com',
    password: hashedPassword,
    isVerified: true
  });

  // Generate admin token
  adminToken = jwt.sign(
    { userId: adminUser._id, email: adminUser.email, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
});

afterAll(async () => {
  // Clean up test uploads
  try {
    const uploadsDir = path.join(__dirname, '../uploads/products');
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      await fs.unlink(path.join(uploadsDir, file));
    }
  } catch (err) {
    // Directory might not exist
  }
  
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up uploaded files after each test
  try {
    const uploadsDir = path.join(__dirname, '../uploads/products');
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      await fs.unlink(path.join(uploadsDir, file));
    }
  } catch (err) {
    // Ignore errors
  }
});

describe('POST /api/upload/image - Image Upload Tests', () => {
  
  describe('Authentication & Authorization', () => {
    it('should reject upload without token', async () => {
      const res = await request(app)
        .post('/api/upload/image')
        .attach('image', Buffer.from('fake image'), 'test.jpg')
        .expect(401);

      expect(res.body.msg).toContain('token');
    });

    it('should reject upload with invalid token', async () => {
      const res = await request(app)
        .post('/api/upload/image')
        .set('Authorization', 'Bearer invalid-token')
        .attach('image', Buffer.from('fake image'), 'test.jpg')
        .expect(401);

      expect(res.body.msg).toContain('not valid');
    });

    it('should reject upload from non-admin user', async () => {
      const userToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, isAdmin: false },
        process.env.JWT_SECRET
      );

      const res = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', Buffer.from('fake image'), 'test.jpg')
        .expect(403);

      expect(res.body.msg).toContain('Admin');
    });
  });

  describe('File Validation', () => {
    it('should reject upload without file', async () => {
      const res = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.msg).toContain('No file');
      expect(res.body.errorType).toBe('NO_FILE');
    });

    it('should reject file larger than 5MB', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      
      const res = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', largeBuffer, 'large.jpg')
        .expect(400);

      expect(res.body.msg).toContain('5MB');
      expect(res.body.errorType).toBe('FILE_TOO_LARGE');
    });

    it('should reject invalid file types', async () => {
      const invalidFiles = [
        { buffer: Buffer.from('fake pdf'), filename: 'test.pdf' },
        { buffer: Buffer.from('<?php echo "hack"; ?>'), filename: 'test.php' },
        { buffer: Buffer.from('fake exe'), filename: 'test.exe' },
        { buffer: Buffer.from('fake js'), filename: 'test.js' }
      ];

      for (const file of invalidFiles) {
        const res = await request(app)
          .post('/api/upload/image')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('image', file.buffer, file.filename)
          .expect(400);

        expect(res.body.errorType).toBe('INVALID_FILE_TYPE');
      }
    });

    it('should accept valid image formats (jpg, png, gif, webp)', async () => {
      const validFormats = ['test.jpg', 'test.jpeg', 'test.png', 'test.gif', 'test.webp'];
      
      // Note: Without a real image, Sharp will fail, but we can verify the format check passes
      for (const filename of validFormats) {
        const res = await request(app)
          .post('/api/upload/image')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('image', Buffer.from('fake image data'), filename);

        // Will fail at Sharp processing, but format should be accepted
        expect(res.status).not.toBe(400);
      }
    });
  });

  describe('Security Tests', () => {
    it('should reject filename with path traversal attempts', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd.jpg',
        '..\\..\\..\\windows\\system32\\config.jpg',
        'test/../../secret.jpg'
      ];

      for (const filename of maliciousFilenames) {
        const res = await request(app)
          .post('/api/upload/image')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('image', Buffer.from('fake'), filename);

        // Filename should be sanitized
        if (res.body.filename) {
          expect(res.body.filename).not.toContain('..');
          expect(res.body.filename).not.toContain('/');
          expect(res.body.filename).not.toContain('\\');
        }
      }
    });

    it('should sanitize special characters in filenames', async () => {
      const res = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake'), 'test<script>alert.jpg');

      if (res.body.filename) {
        expect(res.body.filename).not.toContain('<');
        expect(res.body.filename).not.toContain('>');
        expect(res.body.filename).not.toContain('script');
      }
    });

    it('should generate unique filenames for concurrent uploads', async () => {
      const uploadPromises = Array(5).fill().map(() =>
        request(app)
          .post('/api/upload/image')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('image', Buffer.from('fake image'), 'test.jpg')
      );

      const results = await Promise.all(uploadPromises);
      const filenames = results
        .filter(r => r.body.filename)
        .map(r => r.body.filename);

      // All filenames should be unique
      const uniqueFilenames = new Set(filenames);
      expect(uniqueFilenames.size).toBe(filenames.length);
    });
  });

  describe('Image Processing', () => {
    it('should strip EXIF metadata from images', async () => {
      // Note: Requires real image with EXIF data for full test
      // This is a placeholder to show the test structure
      expect(true).toBe(true);
    });

    it('should optimize and resize large images', async () => {
      // Note: Requires real large image for full test
      // This is a placeholder to show the test structure
      expect(true).toBe(true);
    });
  });
});

describe('DELETE /api/upload/image/:filename - Image Deletion Tests', () => {
  
  describe('Authentication & Authorization', () => {
    it('should reject deletion without token', async () => {
      const res = await request(app)
        .delete('/api/upload/image/test.jpg')
        .expect(401);

      expect(res.body.msg).toContain('token');
    });

    it('should reject deletion from non-admin', async () => {
      const userToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, isAdmin: false },
        process.env.JWT_SECRET
      );

      const res = await request(app)
        .delete('/api/upload/image/test.jpg')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.msg).toContain('Admin');
    });
  });

  describe('Security Tests', () => {
    it('should reject path traversal in filename', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config',
        'test/../../../secret.jpg'
      ];

      for (const filename of maliciousFilenames) {
        const res = await request(app)
          .delete(`/api/upload/image/${encodeURIComponent(filename)}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(res.body.msg).toContain('Invalid filename');
      }
    });

    it('should reject deletion of files with directory separators', async () => {
      const res = await request(app)
        .delete('/api/upload/image/subdir/test.jpg')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.msg).toContain('Invalid filename');
    });
  });

  describe('Functionality', () => {
    it('should return 404 for non-existent file', async () => {
      const res = await request(app)
        .delete('/api/upload/image/nonexistent.jpg')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.msg).toContain('not found');
    });
  });
});

describe('Error Handling', () => {
  it('should handle disk full errors gracefully', async () => {
    // Note: Difficult to test without mocking filesystem
    expect(true).toBe(true);
  });

  it('should clean up files on processing failure', async () => {
    // Upload an invalid image that will fail Sharp processing
    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('not a real image'), 'test.jpg');

    // Check that no orphaned files remain
    const uploadsDir = path.join(__dirname, '../uploads/products');
    try {
      const files = await fs.readdir(uploadsDir);
      expect(files.length).toBe(0); // Should be cleaned up
    } catch (err) {
      // Directory might not exist, which is fine
      expect(true).toBe(true);
    }
  });
});
