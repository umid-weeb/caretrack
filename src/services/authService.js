'use strict';
const { User, Doctor } = require('../models');
const { hashPassword, verifyPassword, signToken } = require('../token');

async function login(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) throw Object.assign(new Error("Foydalanuvchi nomi yoki parol noto'g'ri"), { status: 401 });
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw Object.assign(new Error("Foydalanuvchi nomi yoki parol noto'g'ri"), { status: 401 });
  const payload = { id: user.id, username: user.username, full_name: user.full_name, role: user.role, doctor_id: user.doctor_id };
  const token = signToken(payload);
  return { token, user: payload };
}

async function register(data) {
  const { username, password, full_name, phone } = data;
  if (!username || !password || !full_name) {
    throw Object.assign(new Error('Ism, foydalanuvchi nomi va parol majburiy'), { status: 400 });
  }
  if (username.length < 3) throw Object.assign(new Error("Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak"), { status: 400 });
  if (password.length < 6) throw Object.assign(new Error('Parol kamida 6 ta belgidan iborat'), { status: 400 });

  const existing = await User.findOne({ where: { username } });
  if (existing) throw Object.assign(new Error("Bu foydalanuvchi nomi band"), { status: 400 });

  const password_hash = await hashPassword(password);
  const user = await User.create({ username, password_hash, full_name, phone: phone || '', role: 'patient' });
  const payload = { id: user.id, username: user.username, full_name: user.full_name, role: user.role, doctor_id: null };
  const token = signToken(payload);
  return { token, user: payload };
}

async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw Object.assign(new Error('Joriy va yangi parol majburiy'), { status: 400 });
  }
  if (newPassword.length < 6) {
    throw Object.assign(new Error('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak'), { status: 400 });
  }
  const user = await User.findByPk(userId);
  if (!user) throw Object.assign(new Error('Foydalanuvchi topilmadi'), { status: 404 });

  const ok = await verifyPassword(currentPassword, user.password_hash);
  if (!ok) throw Object.assign(new Error('Joriy parol noto\'g\'ri'), { status: 401 });

  const password_hash = await hashPassword(newPassword);
  await user.update({ password_hash });
  return { ok: true };
}

module.exports = { login, register, changePassword };
