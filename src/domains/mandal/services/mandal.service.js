const Mandal = require('../entities/mandal.entity');
const MandalMember = require('../entities/mandalMember.entity');
const mandalRepo = require('../repositories/mandal.repository');
const mandalMemberRepo = require('../repositories/mandalMember.repository');
const userRepo = require('../../auth/repositories/user.repository');
const AppError = require('../../../utils/error');
const logger = require('../../../utils/logger');

const create = async (data, userId) => {
  try {
    const existing = await mandalRepo.findByName(data.name);
    if (existing) throw new AppError(400, 'Mandal name already exists');
    data.creatorUserId = userId;
    const mandal = await mandalRepo.create(data);
    await mandalMemberRepo.create({ mandalId: mandal.id, userId, role: 'admin' });
    logger.info('Mandal created successfully', { mandalId: mandal.id });
    return new Mandal(mandal);
  } catch (err) {
    logger.error('Error creating mandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

const get = async (id) => {
  try {
    const mandal = await mandalRepo.findById(id);
    if (!mandal) throw new AppError(404, 'Mandal not found');
    logger.info('Mandal retrieved successfully', { mandalId: id });
    return new Mandal(mandal);
  } catch (err) {
    logger.error('Error getting mandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

const update = async (id, data) => {
  try {
    const mandal = await mandalRepo.update(id, data);
    logger.info('Mandal updated successfully', { mandalId: id });
    return new Mandal(mandal);
  } catch (err) {
    logger.error('Error updating mandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

const deleteMandal = async (id) => {
  try {
    await mandalRepo.delete(id);
    logger.info('Mandal deleted successfully', { mandalId: id });
  } catch (err) {
    logger.error('Error deleting mandal', { error: err.message, stack: err.stack });
    throw err;
  }
};

const addMember = async (mandalId, userId) => {
  try {
    const mandal = await mandalRepo.findById(mandalId);
    if (!mandal) throw new AppError(404, 'Mandal not found');
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    const existing = await mandalMemberRepo.findByUserAndMandal(userId, mandalId);
    if (existing) throw new AppError(400, 'User already a member');
    const member = await mandalMemberRepo.create({ mandalId, userId, role: 'member' });
    logger.info('Member added successfully', { mandalId, userId });
    return new MandalMember(member);
  } catch (err) {
    logger.error('Error adding member', { error: err.message, stack: err.stack });
    throw err;
  }
};

const listMembers = async (mandalId) => {
  try {
    const members = await mandalMemberRepo.listByMandal(mandalId);
    logger.info('Members listed successfully', { mandalId });
    return members;
  } catch (err) {
    logger.error('Error listing members', { error: err.message, stack: err.stack });
    throw err;
  }
};

const removeMember = async (mandalId, userId) => {
  try {
    await mandalMemberRepo.deleteByUserAndMandal(userId, mandalId);
    logger.info('Member removed successfully', { mandalId, userId });
  } catch (err) {
    logger.error('Error removing member', { error: err.message, stack: err.stack });
    throw err;
  }
};

module.exports = { create, get, update, deleteMandal, addMember, listMembers, removeMember };