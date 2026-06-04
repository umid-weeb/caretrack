'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Patient = sequelize.define('Patient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(120), allowNull: false },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
  gender: {
    type: DataTypes.ENUM('Erkak', 'Ayol', 'Boshqa'),
    allowNull: false,
  },
  phone: { type: DataTypes.STRING(30), defaultValue: '' },
  email: { type: DataTypes.STRING(120), defaultValue: '' },
  address: { type: DataTypes.STRING(255), defaultValue: '' },
  doctor_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
}, {
  tableName: 'patients',
  timestamps: true,
  underscored: true,
});

module.exports = Patient;
