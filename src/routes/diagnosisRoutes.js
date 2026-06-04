'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/diagnosisController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Patient: o'z tashxislarini ko'rish (specific route — :id dan oldin bo'lishi kerak)
router.get('/my', requireRole('patient'), ctrl.myDiagnoses);

router.get('/',       requireRole('admin','clinician'),  ctrl.list);
router.get('/:id',    requireRole('admin','clinician'),  ctrl.show);
router.post('/',      requireRole('admin','clinician'),  ctrl.create);
router.put('/:id',    requireRole('admin','clinician'),  ctrl.update);
router.delete('/:id', requireRole('admin'),              ctrl.remove);

module.exports = router;
