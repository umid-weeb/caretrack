'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { requireAuth } = require('../middlewares/auth');

router.get('/',              requireAuth, ctrl.list);
router.put('/read-all',      requireAuth, ctrl.markAllRead);
router.put('/:id/read',      requireAuth, ctrl.markRead);

module.exports = router;
