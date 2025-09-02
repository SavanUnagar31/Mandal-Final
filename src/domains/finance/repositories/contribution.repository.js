const { Contribution } = require('../../../infrastructure/database/models');

const create = async (data) => Contribution.create(data);
const findByUserAndMandal = async (userId, mandalId) => Contribution.findAll({ where: { userId, mandalId } });

module.exports = { create, findByUserAndMandal };