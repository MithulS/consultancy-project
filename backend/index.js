require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

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
      'POST /api/products (auth required)',
      'PUT /api/products/:id (auth required)',
      'DELETE /api/products/:id (auth required)'
    ]
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
