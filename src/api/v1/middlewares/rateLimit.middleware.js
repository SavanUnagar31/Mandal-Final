// src/api/v1/middlewares/rateLimit.middleware.js
const { client } = require('../../../infrastructure/cache/redis.config');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/error');

const isTest = process.env.NODE_ENV === 'test';

// Sliding Window Rate Limiter using Redis
const createRedisRateLimiter = ({ windowMs, max, keyPrefix, errorCode }) => {
  return async (req, res, next) => {
    if (isTest || process.env.NODE_ENV === 'localhost') return next();
    if (req.path && req.path.startsWith('/api-docs')) return next();

    // Determine IP and/or User identifier
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    const identifier = req.user ? req.user.id : ip;
    const key = `rate_limit:${keyPrefix}:${identifier}`;

    try {
      if (!client || !client.isOpen) {
        // Fallback fail-open if Redis is down
        logger.warn(`Redis client is not ready. Bypassing rate limit for ${key}`);
        return next();
      }

      const now = Date.now();
      const clearBefore = now - windowMs;

      // Pipeline execution
      const multi = client.multi();
      multi.zRemRangeByScore(key, 0, clearBefore);
      multi.zAdd(key, { score: now, value: `${now}:${Math.random().toString(36).substring(2, 7)}` });
      multi.zCard(key);
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      const requestCount = results[2]; // ZCARD output is at index 2

      // Set standard headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestCount));

      if (requestCount > max) {
        const oldestRequest = await client.zRangeByScore(key, clearBefore, now, { LIMIT: { offset: 0, count: 1 } });
        let retryAfterSec = Math.ceil(windowMs / 1000);
        if (oldestRequest.length > 0) {
          const oldestTime = parseInt(oldestRequest[0].split(':')[0]);
          retryAfterSec = Math.ceil((oldestTime + windowMs - now) / 1000);
        }

        res.setHeader('Retry-After', retryAfterSec);
        return next(new AppError(429, `Too many requests. Please try again after ${retryAfterSec} seconds.`, errorCode || 'RATE_LIMIT_EXCEEDED'));
      }

      next();
    } catch (err) {
      logger.error(`Rate limiting error for ${key}: ${err.message}`, { error: err.stack });
      next(); // Fail open in production for reliability
    }
  };
};

const globalLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyPrefix: 'global',
  errorCode: 'RATE_LIMIT_EXCEEDED',
});

const authLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyPrefix: 'auth',
  errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
});

// Lockout middleware to restrict brute force login (5 failed attempts = 15 min lockout)
const checkLoginLockout = async (req, res, next) => {
  if (isTest || process.env.NODE_ENV === 'localhost') return next();
  const { mobile } = req.body;
  if (!mobile) return next();

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  const lockKey = `login_lockout:${mobile}`;
  const ipLockKey = `login_lockout:ip:${ip}`;

  try {
    if (client && client.isOpen) {
      const attempts = await client.get(lockKey);
      const ipAttempts = await client.get(ipLockKey);

      if (Number(attempts) >= 5 || Number(ipAttempts) >= 5) {
        let ttl = await client.ttl(lockKey);
        if (ttl < 0) ttl = await client.ttl(ipLockKey);
        if (ttl < 0) ttl = 900; // default 15 minutes

        res.setHeader('Retry-After', ttl);
        return next(new AppError(429, `Too many failed login attempts. Account locked for ${Math.ceil(ttl / 60)} minutes.`, 'LOGIN_LOCKED'));
      }
    }
    next();
  } catch (err) {
    logger.error(`Lockout check failed: ${err.message}`);
    next();
  }
};

const recordFailedLogin = async (mobile, ip) => {
  if (isTest || !client || !client.isOpen) return;
  const lockKey = `login_lockout:${mobile}`;
  const ipLockKey = `login_lockout:ip:${ip}`;
  try {
    const attempts = await client.incr(lockKey);
    if (attempts === 1) await client.expire(lockKey, 900); // 15 minutes

    const ipAttempts = await client.incr(ipLockKey);
    if (ipAttempts === 1) await client.expire(ipLockKey, 900); // 15 minutes

    logger.warn(`Failed login recorded for mobile: ${mobile}, IP: ${ip}. attempts=${attempts}, ipAttempts=${ipAttempts}`);
  } catch (err) {
    logger.error(`Failed to record failed login: ${err.message}`);
  }
};

const clearLoginLockout = async (mobile, ip) => {
  if (isTest || !client || !client.isOpen) return;
  const lockKey = `login_lockout:${mobile}`;
  const ipLockKey = `login_lockout:ip:${ip}`;
  try {
    await client.del(lockKey);
    await client.del(ipLockKey);
  } catch (err) {
    logger.error(`Failed to clear login lockout: ${err.message}`);
  }
};

module.exports = {
  globalLimiter,
  authLimiter,
  checkLoginLockout,
  recordFailedLogin,
  clearLoginLockout,
};
