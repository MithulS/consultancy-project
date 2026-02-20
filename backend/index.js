require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

const app = express();
connectDB();

// CORS Configuration - Development-friendly
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      console.warn('   Allowed origins:', allowedOrigins.join(', '));
      callback(null, true); // Allow anyway in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

app.use(express.json());

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
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '***HIDDEN***';
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
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    email: process.env.EMAIL_USER ? 'configured' : 'not configured',
    port: PORT
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Serve static files - uploaded images
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/adminManagement'));
app.use('/api/upload', require('./routes/upload'));
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    msg: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
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
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /health',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/verify-otp',
      'POST /api/auth/login',
      'POST /api/auth/admin-login (requires admin key)',
      'POST /api/auth/resend-otp',
      'GET /api/products',
      'GET /api/products/:id',
      'POST /api/products (admin required)',
      'PUT /api/products/:id (admin required)',
      'DELETE /api/products/:id (admin required)',
      'POST /api/orders (auth required)',
      'GET /api/orders/my-orders (auth required)',
      'GET /api/orders/:id (auth required)',
      'GET /api/orders (admin required)',
      'PUT /api/orders/:id/status (admin required)',
      'GET /api/reviews/product/:productId',
      'POST /api/reviews (auth required, verified purchase only)',
      'PUT /api/reviews/:id (auth required, own review)',
      'DELETE /api/reviews/:id (auth required, own review)',
      'GET /api/reviews/my-reviews (auth required)',
      'GET /api/reviews/can-review/:productId (auth required)',
      'GET /api/inventory/logs/:productId (admin required)',
      'GET /api/inventory/logs (admin required)',
      'GET /api/inventory/stats (admin required)',
      'GET /api/inventory/alerts/low-stock (admin required)',
      'GET /api/inventory/alerts/out-of-stock (admin required)',
      'POST /api/inventory/adjust (admin required)',
      'GET /api/inventory/report (admin required)'
    ]
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
app.listen(PORT, () => {
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
