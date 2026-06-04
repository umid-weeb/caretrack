'use strict';
const { Doctor, User, Patient } = require('../models');
const { hashPassword } = require('../token');

async function getAll() {
  return Doctor.findAll({ order: [['full_name', 'ASC']] });
}

async function getById(id) {
  const doc = await Doctor.findByPk(id);
  if (!doc) throw Object.assign(new Error('Shifokor topilmadi'), { status: 404 });
  return doc;
}

async function create(data) {
  const { full_name, specialty, department, phone, email, available_status, emergency_contact } = data;
  if (!full_name || !specialty || !department || !phone || !email) {
    throw Object.assign(new Error("Barcha majburiy maydonlarni to'ldiring"), { status: 400 });
  }
  const existing = await Doctor.findOne({ where: { email } });
  if (existing) throw Object.assign(new Error("Bu email allaqachon ro'yxatda bor"), { status: 400 });

  const doctor = await Doctor.create({ full_name, specialty, department, phone, email,
    available_status: available_status || 'Available',
    emergency_contact: emergency_contact || '' });

  // Auto-create clinician user account
  const defaultPassword = email.split('@')[0];
  const password_hash = await hashPassword(defaultPassword);
  await User.create({
    username: email,
    password_hash,
    full_name,
    phone: phone || '',
    role: 'clinician',
    doctor_id: doctor.id,
  });

  return { ...doctor.toJSON(), defaultPassword };
}

async function update(id, data) {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) throw Object.assign(new Error('Shifokor topilmadi'), { status: 404 });
  if (data.email && data.email !== doctor.email) {
    const dup = await Doctor.findOne({ where: { email: data.email } });
    if (dup) throw Object.assign(new Error("Bu email allaqachon ro'yxatda bor"), { status: 400 });
  }
  await doctor.update(data);
  return doctor;
}

async function remove(id) {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) throw Object.assign(new Error('Shifokor topilmadi'), { status: 404 });
  const hasPatients = await Patient.count({ where: { doctor_id: id } });
  if (hasPatients > 0) {
    throw Object.assign(new Error("Bu shifokorga bemorlar biriktirilgan. Avval bemorlarni boshqa shifokorga o'tkazing."), { status: 400 });
  }
  // Delete linked clinician user
  await User.destroy({ where: { doctor_id: id } });
  await doctor.destroy();
  return { ok: true };
}

async function getSlots(id, date) {
  if (!date) throw Object.assign(new Error('date parametri kerak'), { status: 400 });
  const { isWorkday, generateAllSlots, getAvailableSlots } = require('../utils/slotGenerator');
  const { Appointment } = require('../models');
  const { Op } = require('sequelize');

  if (!isWorkday(date)) return { isWorkday: false, slots: [], bookedSlots: [], allSlots: [] };

  const doctor = await Doctor.findByPk(id);
  if (!doctor) throw Object.assign(new Error('Shifokor topilmadi'), { status: 404 });

  const allSlots = generateAllSlots();
  const bookedAppts = await Appointment.findAll({
    where: { doctor_id: id, date, status: 'booked' },
    attributes: ['time'],
  });
  const bookedSlots = bookedAppts.map(a => a.time);
  const available = getAvailableSlots(allSlots, bookedSlots, date);
  return { isWorkday: true, slots: available, bookedSlots, allSlots };
}

module.exports = { getAll, getById, create, update, remove, getSlots };
