'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { requireRole } = require('../middlewares/auth');

router.get('/summary', requireRole('admin'), ctrl.summary);

module.exports = router;
