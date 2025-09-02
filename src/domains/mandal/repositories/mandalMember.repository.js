const { MandalMember } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');

const create = async (data) => MandalMember.create(data);
const getRole = async (userId, mandalId) => {
  const member = await MandalMember.findOne({ where: { userId, mandalId } });
  return member ? member.role : null;
};
const findByUserAndMandal = async (userId, mandalId) => MandalMember.findOne({ where: { userId, mandalId } });
const listByMandal = async (mandalId) => MandalMember.findAll({ where: { mandalId } });
const deleteByUserAndMandal = async (userId, mandalId) => {
  const deleted = await MandalMember.destroy({ where: { userId, mandalId } });
  if (!deleted) throw new AppError(404, 'Member not found');
};

module.exports = { create, getRole, findByUserAndMandal, listByMandal, deleteByUserAndMandal };