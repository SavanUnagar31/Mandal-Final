const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database.config').sequelize;

const MandalMember = sequelize.define('MandalMember', {
  mandalId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['mandalId', 'userId'] }],
});

module.exports = MandalMember;