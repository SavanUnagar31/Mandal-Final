const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const Mandal = sequelize.define('Mandal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creatorUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  contributionMode: {
    type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
    allowNull: false,
  },
  contributionAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  interestRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Mandal;