'use strict';
const sequelize = require('../config/db');
const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Diagnosis = require('./Diagnosis');
const Appointment = require('./Appointment');
const Notification = require('./Notification');

// Doctor <-> User  (1:1 — clinician user links to a doctor)
Doctor.hasOne(User, { foreignKey: 'doctor_id', as: 'userAccount', onDelete: 'SET NULL' });
User.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Doctor -> Patient (1:N)
Doctor.hasMany(Patient, { foreignKey: 'doctor_id', as: 'patients', onDelete: 'RESTRICT' });
Patient.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Patient -> Diagnosis (1:N)
Patient.hasMany(Diagnosis, { foreignKey: 'patient_id', as: 'diagnoses', onDelete: 'CASCADE' });
Diagnosis.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor -> Diagnosis (1:N)
Doctor.hasMany(Diagnosis, { foreignKey: 'doctor_id', as: 'diagnoses', onDelete: 'SET NULL' });
Diagnosis.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Patient -> Appointment (1:N)
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments', onDelete: 'CASCADE' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor -> Appointment (1:N)
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments', onDelete: 'RESTRICT' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// User -> Notification (1:N)
User.hasMany(Notification, { foreignKey: 'to_user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'to_user_id', as: 'recipient' });

// Appointment -> Notification (optional)
Appointment.hasMany(Notification, { foreignKey: 'appointment_id', as: 'notifications', onDelete: 'SET NULL' });
Notification.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

// Backwards-compatibility: some Sequelize versions use `findById` instead of `findByPk`.
const models = { User, Doctor, Patient, Diagnosis, Appointment, Notification };
for (const name of Object.keys(models)) {
	const m = models[name];
	if (m && typeof m.findByPk === 'undefined' && typeof m.findById === 'function') {
		m.findByPk = m.findById.bind(m);
	}
}

module.exports = { sequelize, ...models };
