const { MandalMember } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');

const create = async (data) => {
  try {
    const member = await MandalMember.create(data);
    logger.info('MandalMember repository create successful', { mandalId: data.mandalId, userId: data.userId });
    return member;
  } catch (err) {
    logger.error('Error in mandalMember repository create', { error: err.message, stack: err.stack });
    throw err;
  }
};

const getRole = async (userId, mandalId) => {
  try {
    const member = await MandalMember.findOne({ where: { userId, mandalId } });
    logger.info('MandalMember repository getRole successful', { userId, mandalId, role: member ? member.role : null });
    return member ? member.role : null;
  } catch (err) {
    logger.error('Error in mandalMember repository getRole', { error: err.message, stack: err.stack });
    throw err;
  }
};

const findByUserAndMandal = async (userId, mandalId) => {
  try {
    const member = await MandalMember.findOne({ where: { userId, mandalId } });
    logger.info('MandalMember repository findByUserAndMandal successful', { userId, mandalId, found: !!member });
    return member;
  } catch (err) {
    logger.error('Error in mandalMember repository findByUserAndMandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

const listByMandal = async (mandalId) => {
  try {
    const members = await MandalMember.findAll({ where: { mandalId } });
    logger.info('MandalMember repository listByMandal successful', { mandalId });
    return members;
  } catch (err) {
    logger.error('Error in mandalMember repository listByMandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

const deleteByUserAndMandal = async (userId, mandalId) => {
  try {
    const deleted = await MandalMember.destroy({ where: { userId, mandalId } });
    if (!deleted) throw new AppError(404, 'Member not found');
    logger.info('MandalMember repository deleteByUserAndMandal successful', { userId, mandalId });
  } catch (err) {
    logger.error('Error in mandalMember repository deleteByUserAndMandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { create, getRole, findByUserAndMandal, listByMandal, deleteByUserAndMandal };