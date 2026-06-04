'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/patientController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/',           requireAuth,                              ctrl.list);
router.get('/:id',        requireRole('admin','clinician','receptionist'), ctrl.show);
router.get('/:id/profile',requireRole('admin','clinician'),         ctrl.profile);
router.post('/',          requireRole('admin','receptionist'),       ctrl.create);
router.put('/:id',        requireRole('admin','clinician'),          ctrl.update);
router.delete('/:id',     requireRole('admin'),                      ctrl.remove);

module.exports = router;
