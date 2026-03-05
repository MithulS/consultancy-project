// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Fail fast if JWT_SECRET is not configured
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

/**
 * Middleware to verify JWT token and protect routes
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.userId = decoded.userId; // Consistent access via req.userId
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }

    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * Middleware to verify admin access
 * Must be used AFTER authMiddleware: [authMiddleware, adminMiddleware]
 */
const adminMiddleware = (req, res, next) => {
  // If authMiddleware was already called, req.user is populated
  if (!req.user) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      msg: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

module.exports = authMiddleware;
module.exports.verifyToken = authMiddleware;
module.exports.verifyAdmin = adminMiddleware;
