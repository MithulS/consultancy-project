/**
 * Auth Middleware – 15 Test Cases
 */
const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

process.env.JWT_SECRET = 'test-secret-key-12345';

// ─── helpers ────────────────────────────────────────────────────────────────
function makeReq(token) {
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : undefined
    }
  };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ═════════════════════════════════════════════════════════════════════════════
describe('Auth Middleware', () => {

  describe('verifyToken', () => {

    it('TC-M01: allows request with valid token', () => {
      const token = jwt.sign({ userId: 'abc123', isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toMatchObject({ userId: 'abc123' });
    });

    it('TC-M02: rejects request with no Authorization header', () => {
      const req = { headers: {} };
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('TC-M03: rejects token that does not start with Bearer', () => {
      const token = jwt.sign({ userId: 'abc' }, process.env.JWT_SECRET);
      const req = { headers: { authorization: `Token ${token}` } };
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('TC-M04: rejects expired token', () => {
      const token = jwt.sign({ userId: 'abc' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.stringContaining('expired') }));
      expect(next).not.toHaveBeenCalled();
    });

    it('TC-M05: rejects token signed with wrong secret', () => {
      const token = jwt.sign({ userId: 'abc' }, 'wrong-secret');
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('TC-M06: rejects tampered token payload', () => {
      const parts = jwt.sign({ userId: 'abc' }, process.env.JWT_SECRET).split('.');
      const tamperedToken = parts[0] + '.' + Buffer.from('{"userId":"hacker"}').toString('base64') + '.' + parts[2];
      const req = makeReq(tamperedToken);
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('TC-M07: attaches decoded user data to req.user', () => {
      const payload = { userId: 'user99', isAdmin: true, role: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(req.user).toMatchObject({ userId: 'user99', isAdmin: true });
    });

    it('TC-M08: rejects completely malformed token string', () => {
      const req = makeReq('this.is.notavalidtoken');
      const res = makeRes();
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

  });

  describe('verifyAdmin', () => {

    it('TC-M09: allows admin with isAdmin:true in token', () => {
      const token = jwt.sign({ userId: 'adminUser', isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('TC-M10: rejects regular user (isAdmin:false)', () => {
      const token = jwt.sign({ userId: 'regularUser', isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('TC-M11: rejects token missing isAdmin field', () => {
      const token = jwt.sign({ userId: 'someUser' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('TC-M12: rejects request with no token', () => {
      const req = { headers: {} };
      const res = makeRes();
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('TC-M13: rejects expired admin token', () => {
      const token = jwt.sign({ userId: 'adminUser', isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '-1s' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('TC-M14: rejects admin token signed with wrong secret', () => {
      const token = jwt.sign({ userId: 'adminUser', isAdmin: true }, 'wrong-secret');
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('TC-M15: attaches decoded user info to req.user on success', () => {
      const token = jwt.sign({ userId: 'superAdmin', isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(token);
      const res = makeRes();
      const next = jest.fn();

      verifyAdmin(req, res, next);

      expect(req.user).toMatchObject({ userId: 'superAdmin', isAdmin: true });
    });

  });
});
