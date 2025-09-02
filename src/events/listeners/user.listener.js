const eventEmitter = require('../eventEmitter');
const { notificationQueue } = require('../../infrastructure/queue/bull.config');
const { USER_REGISTERED, USER_VERIFIED } = require('../events/user.events');

eventEmitter.on(USER_REGISTERED, (user) => {
  notificationQueue.add('sms', {
    to: user.mobile,
    message: `Welcome ${user.name}, your registration is complete. Verify your email to proceed.`,
  });
});

eventEmitter.on(USER_VERIFIED, (user) => {
  notificationQueue.add('sms', {
    to: user.mobile,
    message: `Email verified for ${user.email}. You can now log in.`,
  });
});