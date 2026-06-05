// Mandal-Final/src/utils/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create dynamic log folder path based on date
const now = new Date();
const year = now.getFullYear().toString();
const month = String(now.getMonth() + 1).padStart(2, '0'); // 01-12
const day = String(now.getDate()).padStart(2, '0'); // 01-31

const logDir = path.join('logs', year, month);

// Ensure log directory exists
fs.mkdirSync(logDir, { recursive: true });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, `${day}.log`),
    }),
    new winston.transports.Console(),
  ],
});

module.exports = logger;
