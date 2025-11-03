const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  try {
    logger.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ success: false, error: message });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};