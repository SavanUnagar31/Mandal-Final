const eventEmitter = require('../eventEmitter');
const { notificationQueue } = require('../../infrastructure/queue/bull.config');
const { LOAN_REQUESTED, LOAN_APPROVED, LOAN_REPAID } = require('../events/loan.events');
const userRepo = require('../../domains/auth/repositories/user.repository');

eventEmitter.on(LOAN_REQUESTED, async (loan) => {
  const user = await userRepo.findById(loan.userId);
  notificationQueue.add('sms', {
    to: user.mobile,
    message: `Your loan request of ${loan.amount} for Mandal ID ${loan.mandalId} has been submitted.`,
  });
});

eventEmitter.on(LOAN_APPROVED, async (loan) => {
  const user = await userRepo.findById(loan.userId);
  notificationQueue.add('sms', {
    to: user.mobile,
    message: `Your loan of ${loan.amount} for Mandal ID ${loan.mandalId} has been approved.`,
  });
});

eventEmitter.on(LOAN_REPAID, async (loan) => {
  const user = await userRepo.findById(loan.userId);
  notificationQueue.add('sms', {
    to: user.mobile,
    message: `Your loan of ${loan.amount} for Mandal ID ${loan.mandalId} has been fully repaid.`,
  });
});