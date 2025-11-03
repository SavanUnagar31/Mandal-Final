const { Mandal } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');

const create = async (data) => {
  try {
    const mandal = await Mandal.create(data);
    logger.info('Mandal repository create successful', { mandalId: mandal.id });
    return mandal;
  } catch (err) {
    logger.error('Error in mandal repository create', { error: err.message, stack: err.stack });
    throw err;
  }
};

const findAll = async () => {
  try {
    const mandals = await Mandal.findAll();
    logger.info('Mandal repository findAll successful');
    return mandals;
  } catch (err) {
    logger.error('Error in mandal repository findAll', { error: err.message, stack: err.stack });
    throw err;
  }
};

const findById = async (id) => {
  try {
    const mandal = await Mandal.findByPk(id);
    if (!mandal) throw new AppError(404, 'Mandal not found');
    logger.info('Mandal repository findById successful', { id });
    return mandal;
  } catch (err) {
    logger.error('Error in mandal repository findById', { error: err.message, stack: err.stack });
    throw err;
  }
};

const findByName = async (name) => {
  try {
    const mandal = await Mandal.findOne({ where: { name } });
    logger.info('Mandal repository findByName successful', { name });
    return mandal;
  } catch (err) {
    logger.error('Error in mandal repository findByName', { error: err.message, stack: err.stack });
    throw err;
  }
};

const update = async (id, data) => {
  try {
    const [updated] = await Mandal.update(data, { where: { id } });
    if (!updated) throw new AppError(404, 'Mandal not found');
    logger.info('Mandal repository update successful', { id });
    return await findById(id);
  } catch (err) {
    logger.error('Error in mandal repository update', { error: err.message, stack: err.stack });
    throw err;
  }
};

const deleteMandal = async (id) => {
  try {
    const deleted = await Mandal.destroy({ where: { id } });
    if (!deleted) throw new AppError(404, 'Mandal not found');
    logger.info('Mandal repository delete successful', { id });
  } catch (err) {
    logger.error('Error in mandal repository delete', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { create, findById, findByName, update, deleteMandal, findAll };