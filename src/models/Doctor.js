'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(120), allowNull: false },
  specialty: { type: DataTypes.STRING(100), allowNull: false },
  department: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(30), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  available_status: {
    type: DataTypes.ENUM('Available', 'Off-duty', 'On-leave'),
    defaultValue: 'Available',
  },
  emergency_contact: { type: DataTypes.STRING(30), defaultValue: '' },
}, {
  tableName: 'doctors',
  timestamps: true,
  underscored: true,
});

module.exports = Doctor;
