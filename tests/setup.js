// Mandal-Final/tests/setup.js
const { sequelize } = require('../src/config/database.config');
const { client, disconnect: disconnectRedis } = require('../src/infrastructure/cache/redis.config');
const { stopCron } = require('../src/utils/cron');
const logger = require('../src/utils/logger');

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    logger.info('Test database setup completed');
  } catch (error) {
    logger.error('Test setup failed:', { error: error.message, stack: error.stack });
    throw error;
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    await disconnectRedis();
    stopCron();
    logger.info('Test cleanup completed');
  } catch (error) {
    logger.error('Test cleanup failed:', { error: error.message, stack: error.stack });
  }
});