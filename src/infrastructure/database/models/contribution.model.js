const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const Contribution = sequelize.define('Contribution', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mandalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amountPaid: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  paidDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Contribution;