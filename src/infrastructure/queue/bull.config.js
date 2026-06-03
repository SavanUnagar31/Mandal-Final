const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DB) || 0
};

if (process.env.REDIS_PASSWORD) {
  connection.password = process.env.REDIS_PASSWORD;
}

const notificationQueue = new Queue('notifications', { connection });

module.exports = { notificationQueue };