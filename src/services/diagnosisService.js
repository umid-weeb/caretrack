'use strict';
const { Diagnosis, Patient, Doctor } = require('../models');

async function getAll({ patient_id, severity, search } = {}) {
  const { Op } = require('sequelize');
  const where = {};
  if (patient_id) where.patient_id = patient_id;
  if (severity) where.severity = severity;
  if (search) where.title = { [Op.like]: `%${search}%` };
  return Diagnosis.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'full_name'] },
      { model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty'] },
    ],
    order: [['diagnosis_date', 'DESC']],
  });
}

async function getById(id) {
  const diag = await Diagnosis.findByPk(id, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'date_of_birth', 'gender'] },
      { model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty'] },
    ],
  });
  if (!diag) throw Object.assign(new Error('Tashxis topilmadi'), { status: 404 });
  return diag;
}

async function create(data, currentUser) {
  const { patient_id, icd_code, title, description, severity, diagnosis_date, notes } = data;
  if (!patient_id || !icd_code || !title || !severity || !diagnosis_date) {
    throw Object.assign(new Error("Majburiy maydonlarni to'ldiring"), { status: 400 });
  }
  const patient = await Patient.findByPk(patient_id);
  if (!patient) throw Object.assign(new Error('Bemor topilmadi'), { status: 404 });

  let doctor_id = data.doctor_id || null;
  if (currentUser.role === 'clinician' && currentUser.doctor_id) {
    doctor_id = currentUser.doctor_id;
  }

  return Diagnosis.create({ patient_id, doctor_id, icd_code, title, description: description || '', severity, diagnosis_date, notes: notes || '' });
}

async function update(id, data) {
  const diag = await Diagnosis.findByPk(id);
  if (!diag) throw Object.assign(new Error('Tashxis topilmadi'), { status: 404 });
  await diag.update(data);
  return diag;
}

async function remove(id) {
  const diag = await Diagnosis.findByPk(id);
  if (!diag) throw Object.assign(new Error('Tashxis topilmadi'), { status: 404 });
  await diag.destroy();
  return { ok: true };
}

// Bemor o'z tashxislarini ko'radi — user.full_name bo'yicha patient topiladi
async function getMyDiagnoses(currentUser) {
  const { Op } = require('sequelize');
  // Patient record linked via full_name match (no direct patient_id on User)
  const patient = await Patient.findOne({
    where: { full_name: { [Op.like]: currentUser.full_name } },
  });
  if (!patient) return { diagnoses: [], found: false };

  const diagnoses = await Diagnosis.findAll({
    where: { patient_id: patient.id },
    include: [{ model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty'] }],
    order: [['diagnosis_date', 'DESC']],
  });
  return { diagnoses, found: true, patient };
}

module.exports = { getAll, getById, create, update, remove, getMyDiagnoses };
