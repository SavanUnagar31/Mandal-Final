const twilio = require('twilio');
const { notificationQueue } = require('../queue/bull.config');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendSMS = async (to, message) => {
  await notificationQueue.add('sms', { to, message });
};

module.exports = { sendSMS };