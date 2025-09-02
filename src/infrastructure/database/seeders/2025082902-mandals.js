'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Mandals', [
      {
        name: 'Test Mandal',
        creatorUserId: 1,
        contributionMode: 'monthly',
        contributionAmount: 1000,
        interestRate: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
    await queryInterface.bulkInsert('MandalMembers', [
      {
        mandalId: 1,
        userId: 1,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('MandalMembers', null, {});
    await queryInterface.bulkDelete('Mandals', null, {});
  }
};