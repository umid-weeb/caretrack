'use strict';
const svc = require('../services/userService');

async function list(req, res, next) {
  try { res.json(await svc.getAll()); } catch (e) { next(e); }
}
async function show(req, res, next) {
  try { res.json(await svc.getById(+req.params.id)); } catch (e) { next(e); }
}
async function update(req, res, next) {
  try { res.json(await svc.update(+req.params.id, req.body)); } catch (e) { next(e); }
}
async function remove(req, res, next) {
  try { res.json(await svc.remove(+req.params.id)); } catch (e) { next(e); }
}

module.exports = { list, show, update, remove };
