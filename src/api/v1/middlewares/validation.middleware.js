const Joi = require('joi');
const AppError = require('../../../utils/error');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new AppError(400, error.details.map(err => err.message).join(', ')));
  }
};

module.exports = { validate };