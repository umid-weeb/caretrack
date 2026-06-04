'use strict';
const { Appointment, Doctor, Patient, User, Notification } = require('../models');
const { isWorkday, generateAllSlots } = require('../utils/slotGenerator');

async function getAll(currentUser) {
  const { Op } = require('sequelize');
  const where = {};
  if (currentUser.role === 'patient') {
    where.patient_user_id = currentUser.id;
  } else if (currentUser.role === 'clinician' && currentUser.doctor_id) {
    where.doctor_id = currentUser.doctor_id;
  }
  return Appointment.findAll({
    where,
    include: [
      { model: Doctor, as: 'doctor', attributes: ['id', 'full_name', 'specialty', 'department'] },
      { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'date_of_birth', 'gender'] },
    ],
    order: [['date', 'DESC'], ['time', 'ASC']],
  });
}

async function create(data, currentUser) {
  const { doctor_id, date, time, notes, patient_name: overrideName, patient_id } = data;
  if (!doctor_id || !date || !time) {
    throw Object.assign(new Error('Shifokor, sana va vaqt tanlanishi shart'), { status: 400 });
  }
  if (!isWorkday(date)) {
    throw Object.assign(new Error("Yakshanba kuni qabul yo'q"), { status: 400 });
  }

  const allSlots = generateAllSlots();
  if (!allSlots.includes(time)) {
    throw Object.assign(new Error("Noto'g'ri vaqt tanlandi"), { status: 400 });
  }

  // Check passed time only for today
  const today = new Date().toISOString().slice(0, 10);
  if (date === today) {
    const now = new Date();
    const [h, m] = time.split(':').map(Number);
    if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) {
      throw Object.assign(new Error("Bu vaqt allaqachon o'tib ketgan"), { status: 400 });
    }
  }

  const conflict = await Appointment.findOne({ where: { doctor_id, date, time, status: 'booked' } });
  if (conflict) throw Object.assign(new Error('Bu vaqt allaqachon band qilingan'), { status: 409 });

  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) throw Object.assign(new Error('Shifokor topilmadi'), { status: 404 });

  const canOverride = ['admin', 'receptionist'].includes(currentUser.role);
  if (!canOverride && doctor.available_status !== 'Available') {
    throw Object.assign(new Error("Bu shifokor hozir ishda emas"), { status: 400 });
  }

  const patientName = (canOverride && overrideName) ? overrideName : currentUser.full_name;
  const apt = await Appointment.create({
    patient_user_id: currentUser.id,
    patient_id: patient_id || null,
    patient_name: patientName,
    doctor_id,
    date,
    time,
    status: 'booked',
    notes: notes || '',
  });

  // Notify clinician
  if (currentUser.role === 'patient') {
    const docUser = await User.findOne({ where: { doctor_id, role: 'clinician' } });
    if (docUser) {
      const n = await Notification.create({
        to_user_id: docUser.id,
        type: 'new_appointment',
        message: `${patientName} bugun soat ${time} ga qabul yozdi`,
        appointment_id: apt.id,
      });
      // Emit realtime notification via socket service (if initialized)
      try {
        require('../sockets/socketService').notifyUser(docUser.id, 'notification', {
          id: n.id,
          type: n.type,
          message: n.message,
          appointment_id: n.appointment_id,
          read: n.read,
          created_at: n.created_at,
        });
      } catch (e) {
        // socket service may not be available in some environments (tests)
      }
    }
  }

  return apt;
}

async function updateStatus(id, status, currentUser) {
  if (!['booked', 'completed', 'cancelled'].includes(status)) {
    throw Object.assign(new Error("Noto'g'ri status"), { status: 400 });
  }
  const apt = await Appointment.findByPk(id);
  if (!apt) throw Object.assign(new Error('Appointment topilmadi'), { status: 404 });
  await apt.update({ status });
  return apt;
}

async function remove(id, currentUser) {
  const apt = await Appointment.findByPk(id);
  if (!apt) throw Object.assign(new Error('Appointment topilmadi'), { status: 404 });
  if (currentUser.role === 'patient' && apt.patient_user_id !== currentUser.id) {
    throw Object.assign(new Error('Ruxsat yo\'q'), { status: 403 });
  }
  await apt.update({ status: 'cancelled' });
  return { ok: true };
}

async function getClinicianQueue(currentUser) {
  if (!currentUser.doctor_id) return { queue: [], doctor: null };
  const doctor = await Doctor.findByPk(currentUser.doctor_id);
  const today = new Date().toISOString().slice(0, 10);
  const appointments = await Appointment.findAll({
    where: { doctor_id: currentUser.doctor_id, date: today },
    include: [{ model: Patient, as: 'patient', include: [{ model: require('../models').Diagnosis, as: 'diagnoses', order: [['diagnosis_date', 'DESC']] }] }],
    order: [['time', 'ASC']],
  });
  return { queue: appointments, doctor };
}

module.exports = { getAll, create, updateStatus, remove, getClinicianQueue };
