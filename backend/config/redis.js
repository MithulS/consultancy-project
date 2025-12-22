// Redis configuration for caching
const redis = require('redis');

let client = null;
let isConnected = false;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          // Fail fast - only try 3 times
          if (retries > 3) {
            return new Error('Redis reconnection failed');
          }
          return retries * 100;
        }
      }
    });

    // Suppress all error logging - we'll handle it in the catch block
    client.on('error', () => {
      isConnected = false;
    });

    client.on('ready', () => {
      console.log('✅ Redis: Connected and ready');
      isConnected = true;
    });

    client.on('end', () => {
      isConnected = false;
    });

    await client.connect();
    return client;
  } catch (error) {
    // Single clear message about Redis not being available
    return null;
  }
};

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!isConnected || !client) {
      return next();
    }

    // Skip caching for authenticated requests (user-specific data)
    if (req.headers.authorization) {
      return next();
    }

    const key = `cache:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      
      if (cached) {
        console.log(`📦 Cache HIT: ${key}`);
        return res.json(JSON.parse(cached));
      }
      
      console.log(`❌ Cache MISS: ${key}`);
      
      // Store original res.json function
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response
        client.setEx(key, duration, JSON.stringify(data))
          .catch(err => console.error('Cache set error:', err));
        
        // Send response normally
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = async (pattern = '*') => {
  if (!isConnected || !client) {
    return false;
  }

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`🗑️  Cleared ${keys.length} cache keys matching: ${pattern}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Clear cache error:', error);
    return false;
  }
};

// Get cache stats
const getCacheStats = async () => {
  if (!isConnected || !client) {
    return { connected: false };
  }

  try {
    const info = await client.info('stats');
    const keys = await client.dbSize();
    
    return {
      connected: true,
      totalKeys: keys,
      info: info
    };
  } catch (error) {
    console.error('Get cache stats error:', error);
    return { connected: false, error: error.message };
  }
};

module.exports = {
  connectRedis,
  cacheMiddleware,
  clearCache,
  getCacheStats,
  getClient: () => client,
  isConnected: () => isConnected
};
