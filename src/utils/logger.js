// Mandal-Final/src/utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', new Date().getFullYear().toString(), 'August', '29.log'),
    }),
    new winston.transports.Console(),
  ],
});

module.exports = logger;