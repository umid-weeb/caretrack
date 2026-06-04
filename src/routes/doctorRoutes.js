'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/doctorController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/',           requireAuth,                     ctrl.list);
router.get('/:id',        requireAuth,                     ctrl.show);
router.get('/:id/slots',  requireAuth,                     ctrl.slots);
router.post('/',          requireRole('admin'),             ctrl.create);
router.put('/:id',        requireRole('admin'),             ctrl.update);
router.delete('/:id',     requireRole('admin'),             ctrl.remove);

module.exports = router;
