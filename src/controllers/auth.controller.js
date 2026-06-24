const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { ALL_COUNTRIES } = require('../constants/currencies');
const { sendWelcomeEmail } = require('../services/email.service');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, country } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (!ALL_COUNTRIES.includes(country)) {
      return res.status(422).json({ error: 'Invalid country selected.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, country },
    });

    const token = signToken({ userId: user.id });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(() => {});

    // Seed starter reminders for new user (non-blocking)
    const seedDate = (offset) => {
      const d = new Date(); d.setDate(d.getDate() + offset); d.setHours(0, 0, 0, 0); return d;
    };
    prisma.reminder.createMany({
      data: [
        { userId: user.id, title: 'Credit Card Bill', module: 'FINANCE', category: 'credit_card', amount: 5000, dueDate: seedDate(7), recurrence: 'MONTHLY', schedule: [3, 7], channels: ['push'] },
        { userId: user.id, title: 'Electricity Bill', module: 'FAMILY', category: 'electricity', amount: 2500, dueDate: seedDate(12), recurrence: 'MONTHLY', schedule: [3], channels: ['push'] },
        { userId: user.id, title: 'SIP Investment', module: 'FINANCE', category: 'sip', amount: 5000, dueDate: seedDate(1), recurrence: 'MONTHLY', schedule: [7], channels: ['push'] },
      ],
    }).catch(() => {});

    res.status(201).json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        country: user.country, plan: user.plan, simBalance: user.simBalance,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ userId: user.id });

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        country: user.country, plan: user.plan, simBalance: user.simBalance,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/sandbox  — guest login, no DB user created
const sandbox = (req, res) => {
  const token = signToken({ sandbox: true, userId: null });
  res.json({
    token,
    user: {
      id: 'sandbox', name: 'Guest User', email: 'guest@sandbox.com',
      country: 'India', plan: 'FREE', simBalance: 75000, avatarUrl: null, sandbox: true,
    },
  });
};

// GET /api/auth/me
const me = (req, res) => {
  const u = req.user;
  res.json({
    id: u.id, name: u.name, email: u.email,
    country: u.country, plan: u.plan, simBalance: u.simBalance,
    avatarUrl: u.avatarUrl || null,
    sandbox: u.sandbox || false,
  });
};

module.exports = { register, login, sandbox, me };
