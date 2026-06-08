// Mandal-Final/src/config/database.config.js
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  timezone: '+00:00',
  dialectOptions: {
    charset: 'utf8mb4',
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: true
    } : false
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX) || 10,
    min: Number(process.env.DB_POOL_MIN) || 0,
    acquire: Number(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: Number(process.env.DB_POOL_IDLE) || 10000,
  },
  logging: (msg) => logger.debug(msg),
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed:', { error: error.message });
    throw error; // Avoid process.exit in tests
  }
};

module.exports = { sequelize, connectDB };