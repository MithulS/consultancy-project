require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();

// Trust first proxy (needed for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Connect to DB before accepting requests
(async () => {
  await connectDB();
})();

// CORS Configuration - Development-friendly
const allowedOrigins = [
  ...(process.env.NODE_ENV !== 'production' ? [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
  ] : []),
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  CORS allowing unrecognized origin in dev:', origin);
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers (CSP, X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com", ...allowedOrigins],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
    }
  },
  crossOriginEmbedderPolicy: false, // Allow cross-origin resources (images, CDN)
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded cross-origin
}));

// Enable gzip compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Balance between compression and speed
}));

app.use(express.json({ limit: '100kb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  
  console.log(`📥 [${requestId}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode < 300 ? '✅' : res.statusCode < 400 ? '↪️' : '❌';
    console.log(`📤 [${requestId}] ${statusEmoji} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Body logging for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
      const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'confirmPassword', 'otp', 'token', 'creditCard', 'cvv', 'cardNumber'];
      const sanitizedBody = { ...req.body };
      for (const field of sensitiveFields) {
        if (sanitizedBody[field]) sanitizedBody[field] = '***HIDDEN***';
      }
      console.log('📦 Request body:', sanitizedBody);
    }
    next();
  });
}

// DB readiness middleware — returns 503 for API routes when MongoDB is not yet connected
app.use('/api', (req, res, next) => {
  const mongoose = require('mongoose');
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState !== 1) {
    // Allow auth/google (OAuth redirect) and health routes through regardless
    const bypassPaths = ['/api/auth/google', '/api/auth/google/callback', '/api/health'];
    if (bypassPaths.some(p => req.path.startsWith(p.replace('/api', '')))) {
      return next();
    }
    return res.status(503).json({
      success: false,
      msg: 'Database is not available. Please try again in a few seconds.',
      retryAfter: 5
    });
  }
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  // Only expose details in non-production
  if (process.env.NODE_ENV !== 'production') {
    healthData.uptime = process.uptime();
    healthData.environment = process.env.NODE_ENV || 'development';
    healthData.email = process.env.EMAIL_USER ? 'configured' : 'not configured';
  }
  res.json(healthData);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Serve static files - uploaded images (kept for backward compatibility during migration)
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/adminManagement'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/images', require('./routes/images'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/comparison', require('./routes/comparison'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/contact', require('./routes/contact'));

// Error handling middleware — delegates to the global handler below
app.use((err, req, res, next) => {
  next(err);
});

// Initialize Redis (optional - will continue without it if not available)
const { connectRedis } = require('./config/redis');
connectRedis().then((redisClient) => {
  if (redisClient) {
    console.log('✅ Redis caching enabled');
  } else {
    console.log('⚠️  Redis not available - continuing without caching');
  }
}).catch(() => {
  console.log('⚠️  Redis failed to initialize - continuing without caching');
});

// Initialize backup scheduler in production
if (process.env.NODE_ENV === 'production') {
  const { scheduleBackups } = require('./scripts/backup');
  scheduleBackups();
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global error handler - must be after all routes
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:');
  console.error('   Path:', req.path);
  console.error('   Method:', req.method);
  console.error('   Error:', err.message);
  console.error('   Stack:', err.stack);

  // Handle Mongoose buffering timeout specifically
  if (err.name === 'MongooseError' || (err.message && err.message.includes('buffering timed out'))) {
    return res.status(503).json({
      success: false,
      msg: 'Database connection unavailable. Please try again shortly.',
      retryAfter: 5
    });
  }
  
  // Log to audit system if available
  try {
    const { logAuditEvent } = require('./utils/auditLogger');
    logAuditEvent({ 
      action: 'UNHANDLED_ERROR', 
      req, 
      details: `${err.message} at ${req.path}` 
    }).catch(() => {});
  } catch (logErr) {
    // Ignore logging errors
  }
  
  // Send error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Server Started Successfully!');
  console.log('='.repeat(60));
  console.log(`📍 Local:            http://localhost:${PORT}`);
  console.log(`📍 Health Check:     http://localhost:${PORT}/health`);
  console.log(`📍 API Health:       http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email:            ${process.env.EMAIL_USER || 'NOT CONFIGURED'}`);
  console.log(`🔌 Allowed Origins:  ${allowedOrigins.join(', ')}`);
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nℹ️  ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    // Close database connections
    const mongoose = require('mongoose');
    mongoose.connection.close(false).then(() => {
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    }).catch(() => {
      process.exit(1);
    });
  });

  // Force shutdown after 10s
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
