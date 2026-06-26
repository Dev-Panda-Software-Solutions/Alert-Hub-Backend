const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, sandbox, me, forgotPassword, resetPassword, sendOtp, verifyOtp, sendSignupOtp, verifySignupOtp } = require('../controllers/auth.controller');
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
  validate, register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate, login
);

router.post('/sandbox', sandbox);

router.get('/me', auth, me);

// Password reset (public — no auth)
router.post('/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate, forgotPassword
);

router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate, resetPassword
);

// Signup email verification (public — no auth)
router.post('/send-signup-otp',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('country').notEmpty().withMessage('Country is required'),
  ],
  validate, sendSignupOtp
);
router.post('/verify-signup-otp',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').notEmpty().withMessage('OTP is required'),
  ],
  validate, verifySignupOtp
);

// OTP-based password change (authenticated)
router.post('/send-otp',  auth, sendOtp);
router.post('/verify-otp', auth,
  [
    body('otp').notEmpty().withMessage('OTP is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate, verifyOtp
);

module.exports = router;
