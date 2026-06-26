const prisma = require('../config/db');
const { ALL_COUNTRIES } = require('../constants/currencies');
const { PLAN_RANK } = require('../middleware/planGuard');

// GET /api/user/profile
const getProfile = (req, res) => {
  const u = req.user;
  res.json({
    id: u.id, name: u.name, email: u.email,
    country: u.country, plan: u.plan, simBalance: u.simBalance,
    avatarUrl: u.avatarUrl || null, whatsApp: u.whatsApp || null,
    createdAt: u.createdAt,
  });
};

// PUT /api/user/profile
const updateProfile = async (req, res, next) => {
  try {
    if (req.user.sandbox) return res.status(403).json({ error: 'Not available in sandbox mode.' });

    const { name, email, whatsApp, country } = req.body;
    if (country && !ALL_COUNTRIES.includes(country)) {
      return res.status(422).json({ error: 'Invalid country.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(422).json({ error: 'Invalid email address.' });
    }

    const data = {};
    if (name)    data.name    = name;
    if (email)   data.email   = email;
    if (country) data.country = country;
    if (whatsApp !== undefined) data.whatsApp = whatsApp || null;

    const updated = await prisma.user.update({ where: { id: req.user.id }, data });

    res.json({
      message: 'Profile updated.',
      user: { id: updated.id, name: updated.name, email: updated.email, country: updated.country, whatsApp: updated.whatsApp },
    });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'That email is already in use.' });
    next(err);
  }
};

// PUT /api/user/plan
const updatePlan = async (req, res, next) => {
  try {
    if (req.user.sandbox) return res.status(403).json({ error: 'Not available in sandbox mode.' });

    const { plan } = req.body;
    const validPlans = Object.keys(PLAN_RANK);
    if (!validPlans.includes(plan)) {
      return res.status(422).json({ error: `Plan must be one of: ${validPlans.join(', ')}` });
    }

    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { plan } });
    res.json({ message: `Plan updated to ${plan}.`, plan: updated.plan });
  } catch (err) { next(err); }
};

// PUT /api/user/sim-balance
const updateSimBalance = async (req, res, next) => {
  try {
    if (req.user.sandbox) return res.status(403).json({ error: 'Not available in sandbox mode.' });

    const { simBalance } = req.body;
    if (typeof simBalance !== 'number' || simBalance < 0) {
      return res.status(422).json({ error: 'simBalance must be a non-negative number.' });
    }

    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { simBalance } });
    res.json({ message: 'Simulated balance updated.', simBalance: updated.simBalance });
  } catch (err) { next(err); }
};

// POST /api/user/avatar  (multer sets req.file)
const uploadAvatar = async (req, res, next) => {
  try {
    if (req.user.sandbox) return res.status(403).json({ error: 'Not available in sandbox mode.' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const avatarUrl = `/uploads/${req.file.filename}`;
    await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl } });
    res.json({ message: 'Avatar updated.', avatarUrl });
  } catch (err) { next(err); }
};

// GET /api/user/countries
const getCountries = (_req, res) => {
  res.json({ countries: ALL_COUNTRIES });
};

// PATCH /api/user/trial-seen  — mark the trial welcome popup as seen
const markTrialSeen = async (req, res, next) => {
  try {
    if (req.user.sandbox) return res.json({ ok: true });
    await prisma.user.update({ where: { id: req.user.id }, data: { trialSeen: true } });
    res.json({ ok: true });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, updatePlan, updateSimBalance, uploadAvatar, getCountries, markTrialSeen };
