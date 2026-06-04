'use strict';
const svc = require('../services/reportService');

async function summary(req, res, next) {
  try { res.json(await svc.getSummary()); } catch (e) { next(e); }
}

module.exports = { summary };
