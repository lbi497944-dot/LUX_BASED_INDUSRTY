import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    errors: ['Rate limit exceeded'],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for public enquiry & consultation forms
 */
export const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 requests per window
  message: {
    success: false,
    message: 'Too many submissions received. Please wait a few moments before trying again.',
    errors: ['Rate limit exceeded'],
  },
  standardHeaders: true,
  legacyHeaders: false,
});
