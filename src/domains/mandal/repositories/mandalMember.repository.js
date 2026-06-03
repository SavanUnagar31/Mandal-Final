const { MandalMember } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');
const cacheService = require('../../../infrastructure/cache/cache.service');

const create = async (data) => {
  try {
    const member = await MandalMember.create(data);
    await cacheService.invalidateMandalMember(data.userId, data.mandalId);
    logger.info('MandalMember repository create successful', { mandalId: data.mandalId, userId: data.userId });
    return member;
  } catch (err) {
    logger.error('Error in mandalMember repository create', { error: err.message, stack: err.stack });
    throw err;
  }
};

const getRole = async (userId, mandalId) => {
  try {
    const cachedRole = await cacheService.getMandalMemberRole(userId, mandalId);
    if (cachedRole !== null) {
      return cachedRole === "" ? null : cachedRole;
    }

    const member = await MandalMember.findOne({ where: { userId, mandalId } });
    const role = member ? member.role : null;
    
    await cacheService.setMandalMemberRole(userId, mandalId, role);
    logger.info('MandalMember repository getRole successful', { userId, mandalId, role });
    return role;
  } catch (err) {
    logger.error('Error in mandalMember repository getRole', { error: err.message, stack: err.stack });
    throw err;
  }
};

const findByUserAndMandal = async (userId, mandalId) => {
  try {
    const cached = await cacheService.getMandalMemberRelation(userId, mandalId);
    if (cached) return cached;

    const member = await MandalMember.findOne({ where: { userId, mandalId } });
    if (member) {
      const plainMember = member.toJSON ? member.toJSON() : member;
      await cacheService.setMandalMemberRelation(userId, mandalId, plainMember);
      await cacheService.setMandalMemberRole(userId, mandalId, member.role);
    }
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
    
    await cacheService.invalidateMandalMember(userId, mandalId);
    logger.info('MandalMember repository deleteByUserAndMandal successful', { userId, mandalId });
  } catch (err) {
    logger.error('Error in mandalMember repository deleteByUserAndMandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { create, getRole, findByUserAndMandal, listByMandal, deleteByUserAndMandal };