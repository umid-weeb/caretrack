'use strict';
const { Notification } = require('../models');

async function getForUser(userId) {
  return Notification.findAll({
    where: { to_user_id: userId },
    order: [['created_at', 'DESC']],
    limit: 50,
  });
}

async function markRead(id, userId) {
  const n = await Notification.findOne({ where: { id, to_user_id: userId } });
  if (!n) throw Object.assign(new Error('Bildirishnoma topilmadi'), { status: 404 });
  await n.update({ read: true });
  return { ok: true };
}

async function markAllRead(userId) {
  await Notification.update({ read: true }, { where: { to_user_id: userId, read: false } });
  return { ok: true };
}

module.exports = { getForUser, markRead, markAllRead };
