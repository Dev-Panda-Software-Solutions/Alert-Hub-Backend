const { Router } = require('express');
const ctrl = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

const router = Router();
router.use(auth);

router.get('/stats',    ctrl.stats);
router.get('/today',    ctrl.today);
router.get('/upcoming', ctrl.upcoming);
router.get('/overdue',  ctrl.overdue);
router.get('/channels', ctrl.channels);

module.exports = router;
