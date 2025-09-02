const { Queue } = require('bullmq');
const { client: redis } = require('../cache/redis.config');

const notificationQueue = new Queue('notifications', { connection: redis });

module.exports = { notificationQueue };