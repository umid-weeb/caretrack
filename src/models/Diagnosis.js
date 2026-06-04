'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Diagnosis = sequelize.define('Diagnosis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patient_id: { type: DataTypes.INTEGER, allowNull: false },
  doctor_id: { type: DataTypes.INTEGER, allowNull: true },
  icd_code: { type: DataTypes.STRING(20), allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Low',
  },
  diagnosis_date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  tableName: 'diagnoses',
  timestamps: true,
  underscored: true,
});

module.exports = Diagnosis;
