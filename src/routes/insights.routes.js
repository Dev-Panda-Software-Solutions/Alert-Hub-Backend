const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/insights.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();
router.use(auth);

router.get('/',          ctrl.insights);
router.get('/cashflow',  ctrl.cashflow);
router.post('/query',
  [body('question').trim().notEmpty().withMessage('question is required')],
  validate,
  ctrl.query
);

module.exports = router;
