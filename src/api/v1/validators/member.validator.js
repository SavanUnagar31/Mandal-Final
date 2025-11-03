const Joi = require('joi');

const addMemberSchema = Joi.object({
  userId: Joi.string().guid({ version: 'uuidv4' }).required(),
});

module.exports = { addMemberSchema };