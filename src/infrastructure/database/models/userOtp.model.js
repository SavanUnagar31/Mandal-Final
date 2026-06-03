const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const UserOtp = sequelize.define('UserOtp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
    allowNull: true,
  },
  otpHash: {
    type: DataTypes.STRING,
    field: 'otp_hash',
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM('REGISTER', 'LOGIN', 'FORGOT_PASSWORD'),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at',
    allowNull: false,
  },
  attemptCount: {
    type: DataTypes.INTEGER,
    field: 'attempt_count',
    defaultValue: 0,
    allowNull: false,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    field: 'verified_at',
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'user_otps',
});

module.exports = UserOtp;
