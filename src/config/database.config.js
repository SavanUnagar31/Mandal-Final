// Mandal-Final/src/config/database.config.js
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4', // Use utf8mb4 instead of cesu8
  },
  logging: (msg) => logger.info(msg),
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({force:true});
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed:', { error: error.message });
    throw error; // Avoid process.exit in tests
  }
};

module.exports = { sequelize, connectDB };