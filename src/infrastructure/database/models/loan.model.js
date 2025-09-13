const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mandalId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  interestRate: {
    type: DataTypes.FLOAT,
  },
  durationMonths: {
    type: DataTypes.INTEGER,
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  totalPayable: {
    type: DataTypes.FLOAT,
  },
  repaidAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('requested', 'approved', 'active', 'repaid', 'overdue'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Loan;