const Mandal = require('../entities/mandal.entity');
const MandalMember = require('../entities/mandalMember.entity');
const mandalRepo = require('../repositories/mandal.repository');
const mandalMemberRepo = require('../repositories/mandalMember.repository');
const userRepo = require('../../auth/repositories/user.repository');
const AppError = require('../../../utils/error');

const create = async (data, userId) => {
  const existing = await mandalRepo.findByName(data.name);
  if (existing) throw new AppError(400, 'Mandal name already exists');
  data.creatorUserId = userId;
  const mandal = await mandalRepo.create(data);
  await mandalMemberRepo.create({ mandalId: mandal.id, userId, role: 'admin' });
  return new Mandal(mandal);
};

const get = async (id) => {
  const mandal = await mandalRepo.findById(id);
  if (!mandal) throw new AppError(404, 'Mandal not found');
  return new Mandal(mandal);
};

const update = async (id, data) => {
  const mandal = await get(id);
  await mandalRepo.update(id, data);
  return new Mandal({ ...mandal, ...data });
};

const deleteMandal = async (id) => {
  const mandal = await get(id);
  await mandalRepo.deleteMandal(id);
};

const addMember = async (mandalId, userId) => {
  await get(mandalId);
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  const existing = await mandalMemberRepo.findByUserAndMandal(userId, mandalId);
  if (existing) throw new AppError(400, 'User already a member');
  await mandalMemberRepo.create({ mandalId, userId, role: 'member' });
  return new MandalMember({ mandalId, userId, role: 'member' });
};

const listMembers = async (mandalId) => {
  await get(mandalId);
  const members = await mandalMemberRepo.listByMandal(mandalId);
  return members.map(m => new MandalMember(m));
};

const removeMember = async (mandalId, userId) => {
  await get(mandalId);
  const member = await mandalMemberRepo.findByUserAndMandal(userId, mandalId);
  if (!member) throw new AppError(404, 'Member not found');
  if (member.role === 'admin') throw new AppError(400, 'Cannot remove admin');
  await mandalMemberRepo.deleteByUserAndMandal(userId, mandalId);
};

module.exports = { create, get, update, deleteMandal, addMember, listMembers, removeMember };