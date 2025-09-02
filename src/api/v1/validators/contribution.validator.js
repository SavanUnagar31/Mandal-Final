const Joi = require('joi');

const payContributionSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

module.exports = { payContributionSchema };