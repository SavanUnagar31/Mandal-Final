const Contribution = require('../entities/contribution.entity');
const contributionRepo = require('../repositories/contribution.repository');
const mandalRepo = require('../../mandal/repositories/mandal.repository');
const mandalMemberRepo = require('../../mandal/repositories/mandalMember.repository');
const paymentService = require('./payment.service');
const AppError = require('../../../utils/error');
const { CONTRIBUTION_DUE } = require('../../../events/events/contribution.events');
const eventEmitter = require('../../../events/eventEmitter');

const pay = async (mandalId, userId, amount) => {
  const mandal = await mandalRepo.findById(mandalId);
  if (!mandal) throw new AppError(404, 'Mandal not found');
  const member = await mandalMemberRepo.findByUserAndMandal(userId, mandalId);
  if (!member) throw new AppError(403, 'Not a member of this mandal');
  if (amount < mandal.contributionAmount) throw new AppError(400, 'Amount less than required');
  const order = await paymentService.createOrder(amount);
  const contribution = await contributionRepo.create({
    mandalId,
    userId,
    amountPaid: amount,
    paidDate: new Date(),
    dueDate: new Date(),
    status: 'paid',
  });
  return { contribution: new Contribution(contribution), order };
};

const list = async (mandalId, userId) => {
  await mandalRepo.findById(mandalId);
  const contributions = await contributionRepo.findByUserAndMandal(userId, mandalId);
  return contributions.map(c => new Contribution(c));
};

const generateDues = async (mode) => {
  const mandals = await mandalRepo.findByMode(mode);
  for (const mandal of mandals) {
    const members = await mandalMemberRepo.listByMandal(mandal.id);
    for (const member of members) {
      const contribution = await contributionRepo.create({
        mandalId: mandal.id,
        userId: member.userId,
        amountPaid: 0,
        dueDate: new Date(),
        status: 'pending',
      });
      eventEmitter.emit(CONTRIBUTION_DUE, new Contribution(contribution));
    }
  }
};

module.exports = { pay, list, generateDues };