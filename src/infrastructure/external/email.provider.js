// Mandal-Final/src/infrastructure/external/email.provider.js
const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

const { gmailUser, gmailPass } = require('../../config/environment.config');

if (!gmailUser || !gmailPass) {
  logger.error('GMAIL_USER or GMAIL_PASS is missing in .env');
  throw new Error('GMAIL_USER and GMAIL_PASS are required');
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: gmailUser,
    pass: gmailPass
  }
});

// Optional: verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error("Gmail SMTP Connection Failed", { error: error.message });
  } else {
    logger.info("Gmail SMTP Connected Successfully");
  }
});

module.exports = transporter;
