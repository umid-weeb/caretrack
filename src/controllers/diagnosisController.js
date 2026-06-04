'use strict';
const svc = require('../services/diagnosisService');

async function list(req, res, next) {
  try { res.json(await svc.getAll(req.query)); } catch (e) { next(e); }
}
async function show(req, res, next) {
  try { res.json(await svc.getById(+req.params.id)); } catch (e) { next(e); }
}
async function create(req, res, next) {
  try { res.status(201).json(await svc.create(req.body, req.user)); } catch (e) { next(e); }
}
async function update(req, res, next) {
  try { res.json(await svc.update(+req.params.id, req.body)); } catch (e) { next(e); }
}
async function remove(req, res, next) {
  try { res.json(await svc.remove(+req.params.id)); } catch (e) { next(e); }
}

async function myDiagnoses(req, res, next) {
  try { res.json(await svc.getMyDiagnoses(req.user)); } catch (e) { next(e); }
}

module.exports = { list, show, create, update, remove, myDiagnoses };
