const Joi = require('joi');

const addMemberSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
});

module.exports = { addMemberSchema };