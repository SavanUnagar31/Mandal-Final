const Joi = require('joi');
const AppError = require('../../../utils/error');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const message = error.details ? error.details.map(err => err.message.replace(/"/g, '')).join(', ') : error.message.replace(/"/g, '');
    next(new AppError(400, message));
  }
};

module.exports = { validate };