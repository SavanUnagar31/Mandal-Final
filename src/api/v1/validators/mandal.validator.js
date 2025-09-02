const Joi = require('joi');
const { CONTRIBUTION_MODES } = require('../../../utils/constants');

const createMandalSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  contributionMode: Joi.string().valid(...CONTRIBUTION_MODES).required(),
  contributionAmount: Joi.number().positive().required(),
  interestRate: Joi.number().min(0).max(100).required(),
});

const updateMandalSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  contributionMode: Joi.string().valid(...CONTRIBUTION_MODES),
  contributionAmount: Joi.number().positive(),
  interestRate: Joi.number().min(0).max(100),
}).min(1);

module.exports = { createMandalSchema, updateMandalSchema };