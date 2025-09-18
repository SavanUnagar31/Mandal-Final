const { Contribution } = require('../../../infrastructure/database/models');
const logger = require('../../../utils/logger');

const create = async (data) => {
  try {
    const contribution = await Contribution.create(data);
    logger.info('Contribution repository create successful', { contributionId: contribution.id });
    return contribution;
  } catch (err) {
    logger.error('Error in contribution repository create', { error: err.message, stack: err.stack });
    throw err;
  }
};

const findByUserAndMandal = async (userId, mandalId) => {
  try {
    const contributions = await Contribution.findAll({ where: { userId, mandalId } });
    logger.info('Contribution repository findByUserAndMandal successful', { userId, mandalId });
    return contributions;
  } catch (err) {
    logger.error('Error in contribution repository findByUserAndMandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { create, findByUserAndMandal };