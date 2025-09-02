const Joi = require('joi');

const requestLoanSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

const approveLoanSchema = Joi.object({
  duration: Joi.number().integer().min(1).required(),
});

module.exports = { requestLoanSchema, approveLoanSchema };