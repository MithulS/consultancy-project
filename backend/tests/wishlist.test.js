/**
 * Wishlist API – 20 Test Cases
 */
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const wishlistRouter = require('../routes/wishlist');
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');

process.env.JWT_SECRET = 'test-secret-key-12345';

const app = express();
app.use(express.json());
app.use('/api/wishlist', wishlistRouter);

let mongoServer;
let userId;
let authToken;
let productId;

function makeToken(uid) {
  return jwt.sign({ userId: uid.toString(), isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Wishlist.deleteMany({});
  await Product.deleteMany({});

  userId = new mongoose.Types.ObjectId();
  authToken = makeToken(userId);

  const prod = await Product.create({
    name: 'LED Bulb 9W',
    description: 'Energy-saving LED bulb',
    price: 89,
    imageUrl: 'https://example.com/bulb.jpg',
    category: 'Electrical',
    stock: 200,
    brand: 'Philips'
  });
  productId = prod._id;
});

// ═════════════════════════════════════════════════════════════════════════════
describe('Wishlist API', () => {

  // ── GET / ─────────────────────────────────────────────────────────────────
  describe('GET /api/wishlist', () => {

    it('TC-W01: returns empty wishlist for new user', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.wishlist.items).toHaveLength(0);
    });

    it('TC-W02: requires authentication', async () => {
      const res = await request(app).get('/api/wishlist');
      expect([401, 403]).toContain(res.status);
    });

    it('TC-W03: returns count of 0 for empty wishlist', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body.count).toBe(0);
    });

    it('TC-W04: returns items after adding a product', async () => {
      await Wishlist.create({ user: userId, items: [{ product: productId, addedAt: new Date() }] });
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body.wishlist.items.length).toBeGreaterThan(0);
    });

  });

  // ── POST /add ─────────────────────────────────────────────────────────────
  describe('POST /api/wishlist/add', () => {

    it('TC-W05: adds a product to wishlist', async () => {
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: productId.toString() })
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('TC-W06: requires authentication', async () => {
      const res = await request(app)
        .post('/api/wishlist/add')
        .send({ productId: productId.toString() });
      expect([401, 403]).toContain(res.status);
    });

    it('TC-W07: rejects missing productId', async () => {
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    it('TC-W08: rejects non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: fakeId.toString() });
      expect([400, 404]).toContain(res.status);
    });

    it('TC-W09: rejects duplicate add (product already in wishlist)', async () => {
      await Wishlist.create({ user: userId, items: [{ product: productId, addedAt: new Date() }] });
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: productId.toString() })
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    it('TC-W10: wishlist count increases by 1 after add', async () => {
      await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: productId.toString() });
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.body.count).toBe(1);
    });

  });

  // ── DELETE /remove/:productId ─────────────────────────────────────────────
  describe('DELETE /api/wishlist/remove/:productId', () => {

    it('TC-W11: removes a product from wishlist', async () => {
      await Wishlist.create({ user: userId, items: [{ product: productId, addedAt: new Date() }] });
      const res = await request(app)
        .delete(`/api/wishlist/remove/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect([200, 204]).toContain(res.status);
    });

    it('TC-W12: requires authentication to remove', async () => {
      const res = await request(app).delete(`/api/wishlist/remove/${productId}`);
      expect([401, 403]).toContain(res.status);
    });

    it('TC-W13: wishlist is empty after removing the only item', async () => {
      await Wishlist.create({ user: userId, items: [{ product: productId, addedAt: new Date() }] });
      await request(app)
        .delete(`/api/wishlist/remove/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.body.count).toBe(0);
    });

  });

  // ── DELETE /clear ─────────────────────────────────────────────────────────
  describe('DELETE /api/wishlist/clear', () => {

    it('TC-W14: clears entire wishlist', async () => {
      await Wishlist.create({ user: userId, items: [{ product: productId, addedAt: new Date() }] });
      const res = await request(app)
        .delete('/api/wishlist/clear')
        .set('Authorization', `Bearer ${authToken}`);
      expect([200, 204]).toContain(res.status);
    });

    it('TC-W15: requires authentication to clear', async () => {
      const res = await request(app).delete('/api/wishlist/clear');
      expect([401, 403]).toContain(res.status);
    });

    it('TC-W16: wishlist count is 0 after clear', async () => {
      await Wishlist.create({ user: userId, items: [{ product: productId, addedAt: new Date() }] });
      await request(app).delete('/api/wishlist/clear').set('Authorization', `Bearer ${authToken}`);
      const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${authToken}`);
      expect(res.body.count).toBe(0);
    });

  });

  // ── Isolation & edge cases ────────────────────────────────────────────────
  describe('Wishlist Isolation', () => {

    it('TC-W17: two users have isolated wishlists', async () => {
      const user2Id = new mongoose.Types.ObjectId();
      const token2 = makeToken(user2Id);

      await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: productId.toString() });

      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token2}`);
      expect(res.body.count).toBe(0);
    });

    it('TC-W18: can add multiple different products', async () => {
      const prod2 = await Product.create({
        name: 'Circuit Breaker',
        description: 'MCB 32A',
        price: 450,
        imageUrl: 'https://example.com/mcb.jpg',
        category: 'Electrical',
        stock: 50,
        brand: 'Schneider'
      });

      await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: productId.toString() });

      await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: prod2._id.toString() });

      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.body.count).toBe(2);
    });

    it('TC-W19: returns success + correct structure from GET', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('wishlist');
      expect(res.body).toHaveProperty('count');
    });

    it('TC-W20: expired token is rejected', async () => {
      const expiredToken = jwt.sign(
        { userId: userId.toString(), isAdmin: false },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect([401, 403]).toContain(res.status);
    });

  });
});
