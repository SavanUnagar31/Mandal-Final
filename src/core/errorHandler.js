const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  try {
    logger.error(err.stack || err.message);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const code = err.errorCode || 'INTERNAL_ERROR';
    const details = err.details || [];

    res.status(status).json({
      success: false,
      message: message,
      error: {
        code: code,
        details: details
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: []
      }
    });
  }
};