// Mandal-Final/src/infrastructure/cache/redis.config.js
const { createClient } = require('redis');
const logger = require('../../utils/logger');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => logger.error('Redis Client Error:', { error: err.message, stack: err.stack }));

client.connect().catch((err) => logger.error('Redis Connection Failed:', { error: err.message, stack: err.stack }));

const disconnect = async () => {
  try {
    await client.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Failed to close Redis connection:', { error: error.message, stack: error.stack });
  }
};

module.exports = { client, disconnect };