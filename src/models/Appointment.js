'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patient_id: { type: DataTypes.INTEGER, allowNull: true },
  doctor_id: { type: DataTypes.INTEGER, allowNull: false },
  patient_name: { type: DataTypes.STRING(120), allowNull: false },
  patient_user_id: { type: DataTypes.INTEGER, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING(5), allowNull: false },
  status: {
    type: DataTypes.ENUM('booked', 'completed', 'cancelled'),
    defaultValue: 'booked',
  },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
});

module.exports = Appointment;
