const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  try {
    const status = err.statusCode || 500;
    
    if (status >= 500) {
      logger.error(err.stack || err.message);
    } else {
      logger.warn(`${err.message} (Status: ${status})`);
    }
    
    // Mask internal error messages in production
    const isProduction = process.env.NODE_ENV === 'production';
    let message = (status === 500 && isProduction) 
      ? 'Internal server error' 
      : (err.message || 'Internal server error');
    if (typeof message === 'string') {
      message = message.replace(/"/g, '');
    }
    const code = (status === 500 && isProduction) 
      ? 'INTERNAL_ERROR' 
      : (err.errorCode || 'INTERNAL_ERROR');
    const details = (status === 500 && isProduction) ? [] : (err.details || []);

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