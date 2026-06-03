const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING,
    field: 'password_hash',
    allowNull: true,
  },
  isMobileVerified: {
    type: DataTypes.BOOLEAN,
    field: 'is_mobile_verified',
    defaultValue: false,
  },
  isPasswordSet: {
    type: DataTypes.BOOLEAN,
    field: 'is_password_set',
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED'),
    defaultValue: 'ACTIVE',
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = User;