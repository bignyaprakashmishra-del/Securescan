// SecureScan Rate Limiting Protections
const rateLimit = require('express-rate-limit');

// General API rate limiter: 120 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP address. Please try again later.',
  },
});

// Authentication rate limiter (prevent brute force): 15 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Scan creation rate limiter (prevent abuse): 10 scans per 10 minutes per IP
const scanLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Scan quota reached. Maximum 10 scans per 10 minutes.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  scanLimiter,
};
