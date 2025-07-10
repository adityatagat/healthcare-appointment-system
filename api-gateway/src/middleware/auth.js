const { createClient } = require('redis');
const securityConfig = require('../config/security');
const logger = require('../utils/logger');

// Create Redis client
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`
});

// Connect to Redis with error handling
redisClient.on('error', (err) => {
  logger.error(`Redis Client Error: ${err.message}`);
});

// Initialize Redis connection
(async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis for API key validation');
  } catch (err) {
    logger.error(`Failed to connect to Redis: ${err.message}`);
  }
})();

/**
 * Middleware to validate API key
 */
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers[securityConfig.apiKeys.headerName.toLowerCase()] || 
                req.query.api_key;

  if (!apiKey) {
    logger.warn('API key is missing');
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'API key is required' 
    });
  }

  try {
    // Check if API key exists in Redis cache
    const cachedKey = await redisClient.get(`api_key:${apiKey}`);
    
    if (cachedKey === 'valid') {
      logger.debug(`API key found in cache: ${apiKey.substring(0, 5)}...`);
      return next();
    }

    // If not in cache, check the configured API keys
    if (securityConfig.apiKeys.validKeys.has(apiKey)) {
      // Cache the valid API key for 1 hour
      await redisClient.set(`api_key:${apiKey}`, 'valid', {
        EX: 3600 // 1 hour expiration
      });
      logger.debug(`API key validated and cached: ${apiKey.substring(0, 5)}...`);
      return next();
    }

    // If we get here, the API key is invalid
    logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 5)}...`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid API key' 
    });
  } catch (err) {
    logger.error(`Error validating API key: ${err.message}`);
    // In case of Redis failure, fall back to in-memory validation
    if (securityConfig.apiKeys.validKeys.has(apiKey)) {
      return next();
    }
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Error validating API key' 
    });
  }
};

/**
 * Middleware to check for admin API key
 */
const requireAdmin = async (req, res, next) => {
  const apiKey = req.headers[securityConfig.apiKeys.headerName.toLowerCase()] || 
                req.query.api_key;
  
  if (apiKey === process.env.ADMIN_API_KEY) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Forbidden',
    message: 'Admin privileges required' 
  });
};

module.exports = {
  validateApiKey,
  requireAdmin
};
