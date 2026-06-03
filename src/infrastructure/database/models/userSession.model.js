const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
    allowNull: false,
  },
  refreshTokenHash: {
    type: DataTypes.STRING,
    field: 'refresh_token_hash',
    allowNull: false,
  },
  deviceId: {
    type: DataTypes.STRING,
    field: 'device_id',
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    field: 'ip_address',
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at',
    allowNull: false,
  },
  revokedAt: {
    type: DataTypes.DATE,
    field: 'revoked_at',
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'user_sessions',
});

module.exports = UserSession;
