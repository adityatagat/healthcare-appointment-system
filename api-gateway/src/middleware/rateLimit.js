const { createClient } = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const securityConfig = require('../config/security');
const logger = require('../utils/logger');

// Create Redis client for rate limiting
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
  enable_offline_queue: false
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  logger.error(`Rate Limiter Redis Error: ${err.message}`);
});

// Initialize rate limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limit',
  points: securityConfig.rateLimit.max, // Number of points
  duration: securityConfig.rateLimit.windowMs / 1000, // Per second
  blockDuration: 60 * 15, // Block for 15 minutes if limit is exceeded
  inmemoryBlockOnConsumed: securityConfig.rateLimit.max + 1,
  inmemoryBlockDuration: 60, // Block in memory to avoid hitting Redis for blocked IPs
  insuranceLimiter: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate_limit_fallback',
    points: securityConfig.rateLimit.max * 2, // Higher limit for fallback
    duration: 60, // Per minute
  })
});

// Rate limiting middleware
const rateLimiterMiddleware = (req, res, next) => {
  // Skip rate limiting for health checks
  if (req.path === '/health') {
    return next();
  }

  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const key = `ip:${clientIP}`;

  rateLimiter.consume(key, 1) // consume 1 point per request
    .then(rateLimiterRes => {
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', securityConfig.rateLimit.max);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
      
      next();
    })
    .catch(rateLimiterRes => {
      // Rate limit exceeded
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
      res.setHeader('Retry-After', retryAfter);
      
      logger.warn(`Rate limit exceeded for IP: ${clientIP}`, {
        path: req.path,
        method: req.method,
        retryAfter: `${retryAfter}s`
      });
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: securityConfig.rateLimit.message,
        retryAfter: `${retryAfter} seconds`
      });
    });
};

// Per-user rate limiting (to be used after authentication)
const userRateLimiter = (points = 10, duration = 60) => {
  const userRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'user_rate_limit',
    points: points,
    duration: duration,
  });

  return (req, res, next) => {
    // Skip if no user is authenticated
    if (!req.user || !req.user.id) {
      return next();
    }

    userRateLimiter.consume(`user:${req.user.id}`, 1)
      .then(() => next())
      .catch(() => {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'You have exceeded the number of allowed requests. Please try again later.'
        });
      });
  };
};

module.exports = {
  rateLimiterMiddleware,
  userRateLimiter
};
