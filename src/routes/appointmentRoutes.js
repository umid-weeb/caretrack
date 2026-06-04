'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/appointmentController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Specific named routes BEFORE parameterised /:id routes
router.get('/clinician/queue', requireRole('clinician'), ctrl.queue);

router.get('/',           requireAuth,                                    ctrl.list);
router.post('/',          requireRole('patient','receptionist','admin'),   ctrl.create);
router.put('/:id/status', requireRole('admin','receptionist','clinician'), ctrl.updateStatus);
router.delete('/:id',     requireAuth,                                    ctrl.remove);

module.exports = router;
