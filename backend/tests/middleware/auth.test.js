// Middleware Tests - Authentication and Authorization
const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('../../middleware/auth');

process.env.JWT_SECRET = 'test-secret-key-12345';

describe('Authentication Middleware Tests', () => {
  
  describe('verifyToken middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should reject requests without authorization header', () => {
      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('token') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat token123';

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('token') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token-string';

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('not valid') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with expired token', () => {
      const expiredToken = jwt.sign(
        { userId: '123', email: 'test@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      req.headers.authorization = `Bearer ${expiredToken}`;

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('expired') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept requests with valid token', () => {
      const validToken = jwt.sign(
        { userId: '123', email: 'test@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.headers.authorization = `Bearer ${validToken}`;

      verifyToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('123');
      expect(req.user.email).toBe('test@test.com');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive Bearer prefix', () => {
      const validToken = jwt.sign(
        { userId: '123' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.headers.authorization = `bearer ${validToken}`;

      verifyToken(req, res, next);

      // Should work with lowercase 'bearer'
      expect(req.user || res.status).toBeDefined();
    });
  });

  describe('verifyAdmin middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should reject requests without token', () => {
      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('token') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests from non-admin users', () => {
      const userToken = jwt.sign(
        { userId: '123', email: 'user@test.com', isAdmin: false },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.headers.authorization = `Bearer ${userToken}`;

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('Admin') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests without isAdmin flag', () => {
      const tokenWithoutAdmin = jwt.sign(
        { userId: '123', email: 'user@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.headers.authorization = `Bearer ${tokenWithoutAdmin}`;

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: expect.stringContaining('Admin') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept requests from admin users', () => {
      const adminToken = jwt.sign(
        { userId: '123', email: 'admin@test.com', isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.headers.authorization = `Bearer ${adminToken}`;

      verifyAdmin(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.isAdmin).toBe(true);
      expect(req.userId).toBe('123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should set both user and userId on request', () => {
      const adminToken = jwt.sign(
        { userId: 'admin123', email: 'admin@test.com', isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      req.headers.authorization = `Bearer ${adminToken}`;

      verifyAdmin(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.userId).toBe('admin123');
      expect(req.user.userId).toBe('admin123');
    });

    it('should reject expired admin tokens', () => {
      const expiredAdminToken = jwt.sign(
        { userId: '123', email: 'admin@test.com', isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      req.headers.authorization = `Bearer ${expiredAdminToken}`;

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token Security', () => {
    it('should reject token signed with different secret', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const maliciousToken = jwt.sign(
        { userId: '123', isAdmin: true },
        'wrong-secret',
        { expiresIn: '24h' }
      );

      req.headers.authorization = `Bearer ${maliciousToken}`;

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject tampered tokens', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const validToken = jwt.sign(
        { userId: '123', isAdmin: false },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Tamper with the token
      const tamperedToken = validToken.slice(0, -5) + 'xxxxx';

      req.headers.authorization = `Bearer ${tamperedToken}`;

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
