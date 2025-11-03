// Mandal-Final/src/domains/auth/services/email.service.js
const transporter = require('../../../infrastructure/external/email.provider');
const logger = require('../../../utils/logger');
const { GMAIL_USER } = process.env;

const sendVerification = async (email, code) => {
  if (!email || !code) {
    logger.error('Invalid email or verification code', { email, code });
    throw new Error('Email and verification code are required');
  }

  logger.info('Sending verification email', { email, code });

  try {
    await transporter.sendMail({
      from: `"Mandal" <${GMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email',
      text: `Your verification code is: ${code}`,
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color:#4A90E2">${code}</h1>
      `
    });

    logger.info('Verification email sent successfully', { email });

  } catch (error) {
    logger.error('Failed to send verification email', {
      email,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = { sendVerification };
