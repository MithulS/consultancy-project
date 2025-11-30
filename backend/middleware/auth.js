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

module.exports = authMiddleware;
