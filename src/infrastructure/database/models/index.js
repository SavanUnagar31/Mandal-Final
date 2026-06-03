const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;
const User = require('./user.model');
const Mandal = require('./mandal.model');
const MandalMember = require('./mandalMember.model');
const Contribution = require('./contribution.model');
const Loan = require('./loan.model');
const LoanRepayment = require('./loanRepayment.model');
const UserRole = require('./userRole.model');
const UserOtp = require('./userOtp.model');
const UserSession = require('./userSession.model');

// Associations
User.hasMany(Mandal, { foreignKey: 'creatorUserId' });
Mandal.belongsTo(User, { foreignKey: 'creatorUserId' });

Mandal.hasMany(MandalMember, { foreignKey: 'mandalId' });
User.hasMany(MandalMember, { foreignKey: 'userId' });
MandalMember.belongsTo(Mandal, { foreignKey: 'mandalId' });
MandalMember.belongsTo(User, { foreignKey: 'userId' });

Mandal.hasMany(Contribution, { foreignKey: 'mandalId' });
User.hasMany(Contribution, { foreignKey: 'userId' });
Contribution.belongsTo(Mandal, { foreignKey: 'mandalId' });
Contribution.belongsTo(User, { foreignKey: 'userId' });

Mandal.hasMany(Loan, { foreignKey: 'mandalId' });
User.hasMany(Loan, { foreignKey: 'userId' });
Loan.belongsTo(Mandal, { foreignKey: 'mandalId' });
Loan.belongsTo(User, { foreignKey: 'userId' });

Loan.hasMany(LoanRepayment, { foreignKey: 'loanId' });
LoanRepayment.belongsTo(Loan, { foreignKey: 'loanId' });

User.hasMany(UserRole, { foreignKey: 'userId' });
UserRole.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserOtp, { foreignKey: 'userId' });
UserOtp.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserSession, { foreignKey: 'userId' });
UserSession.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Op,
  User,
  Mandal,
  MandalMember,
  Contribution,
  Loan,
  LoanRepayment,
  UserRole,
  UserOtp,
  UserSession
};