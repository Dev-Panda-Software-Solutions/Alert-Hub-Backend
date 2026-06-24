const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, sandbox, me } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = Router();

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('country').notEmpty().withMessage('Country is required'),
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/sandbox', sandbox);

router.get('/me', auth, me);

module.exports = router;
