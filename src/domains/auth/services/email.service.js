// Mandal-Final/src/domains/auth/services/email.service.js
const transporter = require('../../../infrastructure/external/email.provider');
const logger = require('../../../utils/logger');

const sendVerification = async (email, code) => {
  if (!email || !code) {
    logger.error('Invalid email or verification code', { email, code });
    throw new Error('Email and verification code are required');
  }
  logger.info('Sending verification email', { email, code });
  try {
    await transporter.sendMail({
      from: 'savanunagar318@gmail.com',
      to: email,
      subject: 'Verify Your Email',
      text: `Your verification code is ${code}`,
    });
    logger.info('Verification email sent successfully', { email });
  } catch (error) {
    logger.error('Failed to send verification email', { email, error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = { sendVerification };