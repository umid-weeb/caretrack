'use strict';
const { User } = require('../models');

async function getAll() {
  return User.findAll({ order: [['full_name', 'ASC']] });
}

async function getById(id) {
  const u = await User.findByPk(id);
  if (!u) throw Object.assign(new Error('Foydalanuvchi topilmadi'), { status: 404 });
  return u;
}

async function update(id, data) {
  const u = await User.findByPk(id);
  if (!u) throw Object.assign(new Error('Foydalanuvchi topilmadi'), { status: 404 });
  // Only allow certain fields to be updated here
  const allowed = ['full_name', 'phone', 'role', 'username'];
  const patch = {};
  for (const k of allowed) if (k in data) patch[k] = data[k];
  await u.update(patch);
  return u;
}

async function remove(id) {
  const u = await User.findByPk(id);
  if (!u) throw Object.assign(new Error('Foydalanuvchi topilmadi'), { status: 404 });
  await u.destroy();
  return { ok: true };
}

module.exports = { getAll, getById, update, remove };
