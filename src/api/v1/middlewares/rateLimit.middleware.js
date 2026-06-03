// src/api/v1/middlewares/rateLimit.middleware.js
const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

const globalLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          details: []
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

const authLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 login/OTP attempts per windowMs
      message: {
        success: false,
        message: 'Too many authentication or OTP attempts, please try again after 15 minutes.',
        error: {
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          details: []
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = { globalLimiter, authLimiter };
