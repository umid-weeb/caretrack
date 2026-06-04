'use strict';
const svc = require('../services/appointmentService');

async function list(req, res, next) {
  try { res.json(await svc.getAll(req.user)); } catch (e) { next(e); }
}
async function create(req, res, next) {
  try { res.status(201).json(await svc.create(req.body, req.user)); } catch (e) { next(e); }
}
async function updateStatus(req, res, next) {
  try { res.json(await svc.updateStatus(+req.params.id, req.body.status, req.user)); } catch (e) { next(e); }
}
async function remove(req, res, next) {
  try { res.json(await svc.remove(+req.params.id, req.user)); } catch (e) { next(e); }
}
async function queue(req, res, next) {
  try { res.json(await svc.getClinicianQueue(req.user)); } catch (e) { next(e); }
}

module.exports = { list, create, updateStatus, remove, queue };
