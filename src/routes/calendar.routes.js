const { Router } = require('express');
const ctrl = require('../controllers/calendar.controller');
const auth = require('../middleware/auth');

const router = Router();
router.use(auth);

router.get('/month', ctrl.month);
router.get('/day',   ctrl.day);

module.exports = router;
