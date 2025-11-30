// Rate limiting middleware for API security
const rateLimit = require('express-rate-limit');

// General API rate limiter - prevents abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Very strict limiter for OTP verification - prevent brute force
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow 10 OTP verification attempts per 15 minutes
  message: 'Too many OTP verification attempts. Please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for OTP resend - prevent spam
const resendOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Max 3 resend requests per 5 minutes
  message: 'Too many OTP resend requests. Please wait 5 minutes before trying again',
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration limiter - prevent registration spam
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 registrations per hour per IP
  message: 'Too many registration attempts. Please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  resendOtpLimiter,
  registrationLimiter
};
