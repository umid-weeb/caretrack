'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');

router.post('/login',           ctrl.login);
router.post('/register',        ctrl.register);
router.post('/logout',          ctrl.logout);
router.get('/me',               requireAuth, ctrl.me);
router.put('/change-password',  requireAuth, ctrl.changePassword);

module.exports = router;
