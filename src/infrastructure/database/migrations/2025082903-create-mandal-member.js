'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MandalMembers', {
      mandalId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Mandals', key: 'id' },
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      role: {
        type: Sequelize.ENUM('admin', 'member'),
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
    await queryInterface.addIndex('MandalMembers', ['mandalId', 'userId'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('MandalMembers');
  }
};