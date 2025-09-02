const eventEmitter = require('../eventEmitter');
const { notificationQueue } = require('../../infrastructure/queue/bull.config');
const { CONTRIBUTION_DUE, CONTRIBUTION_PAID } = require('../events/contribution.events');
const userRepo = require('../../domains/auth/repositories/user.repository');

eventEmitter.on(CONTRIBUTION_DUE, async (contribution) => {
  const user = await userRepo.findById(contribution.userId);
  notificationQueue.add('sms', {
    to: user.mobile,
    message: `Your contribution of ${contribution.amountPaid} is due for Mandal ID ${contribution.mandalId}.`,
  });
});

eventEmitter.on(CONTRIBUTION_PAID, async (contribution) => {
  const user = await userRepo.findById(contribution.userId);
  notificationQueue.add('sms', {
    to: user.mobile,
    message: `Your contribution of ${contribution.amountPaid} for Mandal ID ${contribution.mandalId} has been paid.`,
  });
});