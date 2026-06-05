const twilio = require('twilio');
const { notificationQueue } = require('../queue/bull.config');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendSMS = async (to, message) => {
  await notificationQueue.add('sms', { to, message });
};

const sendSMSDirect = async (to, message) => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_PHONE) {
    throw new Error('Twilio credentials or phone number missing');
  }
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: to,
  });
};

module.exports = { sendSMS, sendSMSDirect };