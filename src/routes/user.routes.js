const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const { getProfile, updateProfile, updatePlan, updateSimBalance, uploadAvatar, getCountries, markTrialSeen } = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype));
  },
});

/* Public — no auth needed (used on signup page before login) */
router.get('/countries', getCountries);

router.use(auth);

router.get('/profile', getProfile);
router.put('/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('country').optional().notEmpty().withMessage('Country cannot be empty'),
  ],
  validate,
  updateProfile
);

router.put('/plan',
  [body('plan').notEmpty().withMessage('plan is required')],
  validate,
  updatePlan
);

router.put('/sim-balance',
  [body('simBalance').isFloat({ min: 0 }).withMessage('simBalance must be a positive number')],
  validate,
  updateSimBalance
);

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.patch('/trial-seen', markTrialSeen);

module.exports = router;
