const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  try {
    logger.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ success: false, error: message });
  } catch (error) {
    console.log({ error });
  }
};