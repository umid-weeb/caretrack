'use strict';
const { Patient, Doctor, Diagnosis } = require('../models');

async function getAll({ search, doctor_id } = {}) {
  const { Op } = require('sequelize');
  const where = {};
  if (search) where.full_name = { [Op.like]: `%${search}%` };
  if (doctor_id) where.doctor_id = doctor_id;
  return Patient.findAll({
    where,
    include: [{ model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty', 'department'] }],
    order: [['full_name', 'ASC']],
  });
}

async function getById(id) {
  const p = await Patient.findByPk(id, {
    include: [{ model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty', 'department', 'phone', 'email'] }],
  });
  if (!p) throw Object.assign(new Error('Bemor topilmadi'), { status: 404 });
  return p;
}

async function getProfile(id, role) {
  const patient = await Patient.findByPk(id, {
    include: [{ model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty', 'department', 'phone', 'email'] }],
  });
  if (!patient) throw Object.assign(new Error('Bemor topilmadi'), { status: 404 });

  let diagnoses = [];
  if (['admin', 'clinician'].includes(role)) {
    diagnoses = await Diagnosis.findAll({
      where: { patient_id: id },
      include: [{ model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty'] }],
      order: [['diagnosis_date', 'DESC']],
    });
  }
  return { patient, diagnoses };
}

async function create(data) {
  const { full_name, date_of_birth, gender, phone, email, address, doctor_id } = data;
  if (!full_name || !date_of_birth || !gender) {
    throw Object.assign(new Error("Ism, tug'ilgan sana va jins majburiy"), { status: 400 });
  }
  return Patient.create({ full_name, date_of_birth, gender, phone: phone || '', email: email || '', address: address || '', doctor_id: doctor_id || null });
}

async function update(id, data) {
  const patient = await Patient.findByPk(id);
  if (!patient) throw Object.assign(new Error('Bemor topilmadi'), { status: 404 });
  await patient.update(data);
  return patient;
}

async function remove(id) {
  const patient = await Patient.findByPk(id);
  if (!patient) throw Object.assign(new Error('Bemor topilmadi'), { status: 404 });
  await Diagnosis.destroy({ where: { patient_id: id } });
  await patient.destroy();
  return { ok: true };
}

module.exports = { getAll, getById, getProfile, create, update, remove };
