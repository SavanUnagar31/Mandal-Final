'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Loans', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mandalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Mandals', key: 'id' },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      interestRate: {
        type: Sequelize.FLOAT,
      },
      durationMonths: {
        type: Sequelize.INTEGER,
      },
      startDate: {
        type: Sequelize.DATE,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      totalPayable: {
        type: Sequelize.FLOAT,
      },
      repaidAmount: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('requested', 'approved', 'active', 'repaid', 'overdue'),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Loans');
  }
};