'use strict';
const svc = require('../services/doctorService');

async function list(req, res, next) {
  try { res.json(await svc.getAll()); } catch (e) { next(e); }
}
async function show(req, res, next) {
  try { res.json(await svc.getById(+req.params.id)); } catch (e) { next(e); }
}
async function create(req, res, next) {
  try { res.status(201).json(await svc.create(req.body)); } catch (e) { next(e); }
}
async function update(req, res, next) {
  try { res.json(await svc.update(+req.params.id, req.body)); } catch (e) { next(e); }
}
async function remove(req, res, next) {
  try { res.json(await svc.remove(+req.params.id)); } catch (e) { next(e); }
}
async function slots(req, res, next) {
  try { res.json(await svc.getSlots(+req.params.id, req.query.date)); } catch (e) { next(e); }
}

module.exports = { list, show, create, update, remove, slots };
