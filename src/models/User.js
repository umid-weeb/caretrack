'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(100), allowNull: false },
  full_name: { type: DataTypes.STRING(120), allowNull: false },
  phone: { type: DataTypes.STRING(30), defaultValue: '' },
  role: {
    type: DataTypes.ENUM('admin', 'clinician', 'receptionist', 'patient'),
    allowNull: false,
    defaultValue: 'patient',
  },
  doctor_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

module.exports = User;
