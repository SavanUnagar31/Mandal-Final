const { Worker } = require('bullmq');
const { sendSMSDirect } = require('../external/notification.provider');
const logger = require('../../utils/logger');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DB) || 0
};

if (process.env.REDIS_PASSWORD) {
  connection.password = process.env.REDIS_PASSWORD;
}

const worker = new Worker('notifications', async (job) => {
  if (job.name === 'sms') {
    const { to, message } = job.data;
    logger.info(`Processing SMS notification to ${to}`, { jobId: job.id });
    try {
      await sendSMSDirect(to, message);
      logger.info(`SMS sent successfully to ${to}`, { jobId: job.id });
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}`, { jobId: job.id, error: error.message });
      throw error;
    }
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Job failed in notification queue: ${job ? job.id : 'unknown'}`, { error: err.message });
});

module.exports = worker;
