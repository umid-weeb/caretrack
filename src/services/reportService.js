'use strict';
const { Doctor, Patient, Diagnosis, Appointment } = require('../models');
const { Op } = require('sequelize');

async function getSummary() {
  const [doctors, patients, diagnoses, appointments] = await Promise.all([
    Doctor.findAll(),
    Patient.findAll({ include: [{ model: Doctor, as: 'doctor', attributes: ['department'] }] }),
    Diagnosis.findAll(),
    Appointment.findAll(),
  ]);

  const severityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  diagnoses.forEach(d => { if (severityCounts[d.severity] !== undefined) severityCounts[d.severity]++; });

  const deptMap = {};
  patients.forEach(p => {
    const dept = p.doctor ? p.doctor.department : 'Belgilanmagan';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });

  const criticalAndHigh = diagnoses
    .filter(d => d.severity === 'Critical' || d.severity === 'High')
    .sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date))
    .slice(0, 10);

  const today = new Date().toISOString().slice(0, 10);
  const aptStats = {
    total: appointments.length,
    booked: appointments.filter(a => a.status === 'booked').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    today: appointments.filter(a => a.date === today && a.status === 'booked').length,
  };

  return {
    totals: {
      doctors: doctors.length,
      patients: patients.length,
      diagnoses: diagnoses.length,
      critical: severityCounts.Critical,
    },
    severityCounts,
    patientsByDepartment: deptMap,
    criticalAndHigh,
    aptStats,
  };
}

module.exports = { getSummary };
