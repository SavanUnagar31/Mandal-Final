// Mandal-Final/src/infrastructure/external/email.provider.js
const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

const { SENDGRID_API_KEY } = process.env;

if (!SENDGRID_API_KEY) {
  logger.error('SENDGRID_API_KEY is not set in .env');
  throw new Error('SENDGRID_API_KEY is required');
}

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: SENDGRID_API_KEY,
  },
});

module.exports = transporter;