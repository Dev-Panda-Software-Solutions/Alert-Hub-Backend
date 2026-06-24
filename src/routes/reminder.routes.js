const { Router } = require('express');
const { body, query } = require('express-validator');
const ctrl = require('../controllers/reminder.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();
router.use(auth);

const reminderBody = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('module').isIn(['BUSINESS', 'FAMILY', 'FINANCE']).withMessage('Module must be BUSINESS, FAMILY or FINANCE'),
  body('category').notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
  body('dueDate').isISO8601().withMessage('dueDate must be a valid date (YYYY-MM-DD)'),
  body('recurrence').optional().isIn(['NONE', 'MONTHLY', 'YEARLY']).withMessage('Invalid recurrence'),
  body('schedule').optional().isArray().withMessage('schedule must be an array of integers'),
  body('channels').optional().isArray().withMessage('channels must be an array'),
];

router.get('/', [
  query('module').optional().isIn(['BUSINESS', 'FAMILY', 'FINANCE']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
], validate, ctrl.list);

router.get('/:id', ctrl.get);

router.post('/', reminderBody, validate, ctrl.create);

router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  body('recurrence').optional().isIn(['NONE', 'MONTHLY', 'YEARLY']),
  body('channels').optional().isArray(),
], validate, ctrl.update);

router.delete('/bulk', ctrl.bulkDelete);

router.delete('/:id', ctrl.remove);

router.patch('/:id/toggle', ctrl.toggle);

module.exports = router;
