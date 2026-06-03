const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const UserRole = sequelize.define('UserRole', {
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
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'MANDAL_OWNER', 'HELPER', 'MEMBER'),
    allowNull: false,
  },
  mandalId: {
    type: DataTypes.UUID,
    field: 'mandal_id',
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'user_roles',
});

module.exports = UserRole;
