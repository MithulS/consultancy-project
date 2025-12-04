// server/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and protect routes
 * Usage: Add this middleware to any route that requires authentication
 * Example: router.get('/profile', authMiddleware, (req, res) => {...})
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Extract token (format: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = decoded;
    
    // Continue to the next middleware or route handler
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
 * Checks if the token has isAdmin flag set to true
 */
const adminMiddleware = (req, res, next) => {
  try {
    // First verify the token (assumes authMiddleware was called first)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        msg: 'Access denied. Admin privileges required.' 
      });
    }

    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
module.exports.verifyToken = authMiddleware;
module.exports.verifyAdmin = adminMiddleware;
