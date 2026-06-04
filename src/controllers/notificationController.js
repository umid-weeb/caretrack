'use strict';
const svc = require('../services/notificationService');

async function list(req, res, next) {
  try { res.json(await svc.getForUser(req.user.id)); } catch (e) { next(e); }
}
async function markRead(req, res, next) {
  try { res.json(await svc.markRead(+req.params.id, req.user.id)); } catch (e) { next(e); }
}
async function markAllRead(req, res, next) {
  try { res.json(await svc.markAllRead(req.user.id)); } catch (e) { next(e); }
}

module.exports = { list, markRead, markAllRead };
