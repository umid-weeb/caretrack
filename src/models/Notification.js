'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  to_user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(50), defaultValue: 'info' },
  message: { type: DataTypes.TEXT, allowNull: false },
  appointment_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

module.exports = Notification;
