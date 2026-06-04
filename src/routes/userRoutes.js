'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { requireRole } = require('../middlewares/auth');

router.get('/',        requireRole('admin'), ctrl.list);
router.get('/:id',     requireRole('admin'), ctrl.show);
router.put('/:id',     requireRole('admin'), ctrl.update);
router.delete('/:id',  requireRole('admin'), ctrl.remove);

module.exports = router;
