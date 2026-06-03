const Joi = require('joi');
const AppError = require('../../../utils/error');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const details = error.details ? error.details.map(err => ({
      message: err.message,
      path: err.path,
      type: err.type
    })) : [];
    const message = error.details ? error.details.map(err => err.message).join(', ') : error.message;
    next(new AppError(400, message, 'VALIDATION_ERROR', details));
  }
};

module.exports = { validate };