const { Router } = require('express');
const { body, query } = require('express-validator');
const ctrl = require('../controllers/admin.controller');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validate');

const router = Router();

router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty(),
], validate, ctrl.login);

router.use(adminAuth);

router.get('/stats', ctrl.stats);

router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
], validate, ctrl.listUsers);

router.get('/users/:id', ctrl.getUser);

router.put('/users/:id/plan', [
  body('plan').isIn(['FREE', 'PERSONAL', 'FAMILY', 'BUSINESS']),
], validate, ctrl.updateUserPlan);

router.delete('/users/:id', ctrl.deleteUser);

module.exports = router;
