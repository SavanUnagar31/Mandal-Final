const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const LoanRepayment = sequelize.define('LoanRepayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  loanId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('principal', 'interest'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = LoanRepayment;