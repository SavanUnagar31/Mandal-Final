// Mandal-Final/src/utils/cron.js
const cron = require('node-cron');
const logger = require('../utils/logger');

const tasks = [];

tasks.push(cron.schedule('0 0 * * 0', () => {
  const contributionService = require('../domains/finance/services/contribution.service');
  contributionService.generateDues('weekly');
}, { timezone: 'Asia/Kolkata' }));

tasks.push(cron.schedule('0 0 1 * *', () => {
  const contributionService = require('../domains/finance/services/contribution.service');
  contributionService.generateDues('monthly');
}, { timezone: 'Asia/Kolkata' }));

tasks.push(cron.schedule('0 0 1 1 *', () => {
  const contributionService = require('../domains/finance/services/contribution.service');
  contributionService.generateDues('yearly');
}, { timezone: 'Asia/Kolkata' }));

const stopCron = () => {
  tasks.forEach(task => task.stop());
  logger.info('Cron jobs stopped');
};

module.exports = { stopCron };