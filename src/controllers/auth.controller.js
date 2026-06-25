const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const { ALL_COUNTRIES } = require('../constants/currencies');
const {
  sendWelcomeEmail, sendLoginAlertEmail,
  sendPasswordResetEmail, sendOtpEmail,
} = require('../services/email.service');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// In-memory stores (cleared on restart — fine for short-lived tokens)
const resetTokens = new Map(); // token  → { userId, expiresAt }
const otpStore    = new Map(); // userId → { otp, expiresAt }

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, country } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    if (!ALL_COUNTRIES.includes(country)) return res.status(422).json({ error: 'Invalid country selected.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, country },
    });
    const token = signToken({ userId: user.id });

    sendWelcomeEmail(user).catch(() => {});

    const seedDate = (offset) => {
      const d = new Date(); d.setDate(d.getDate() + offset); d.setHours(0, 0, 0, 0); return d;
    };
    prisma.reminder.createMany({
      data: [
        { userId: user.id, title: 'Credit Card Bill', module: 'FINANCE', category: 'credit_card', amount: 5000, dueDate: seedDate(7),  recurrence: 'MONTHLY', schedule: [3, 7], channels: ['push'] },
        { userId: user.id, title: 'Electricity Bill',  module: 'FAMILY',  category: 'electricity',  amount: 2500, dueDate: seedDate(12), recurrence: 'MONTHLY', schedule: [3],    channels: ['push'] },
        { userId: user.id, title: 'SIP Investment',    module: 'FINANCE', category: 'sip',          amount: 5000, dueDate: seedDate(1),  recurrence: 'MONTHLY', schedule: [7],    channels: ['push'] },
      ],
    }).catch(() => {});

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, country: user.country, plan: user.plan, simBalance: user.simBalance, avatarUrl: user.avatarUrl },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = signToken({ userId: user.id });
    sendLoginAlertEmail(user, {
      time: new Date(),
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'Unknown',
      device: req.headers['user-agent']?.split('(')[0]?.trim() || 'Web browser',
    }).catch(() => {});

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, country: user.country, plan: user.plan, simBalance: user.simBalance, avatarUrl: user.avatarUrl },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/sandbox
const sandbox = (req, res) => {
  const token = signToken({ sandbox: true, userId: null });
  res.json({
    token,
    user: { id: 'sandbox', name: 'Guest User', email: 'guest@sandbox.com', country: 'India', plan: 'FREE', simBalance: 75000, avatarUrl: null, sandbox: true },
  });
};

// GET /api/auth/me
const me = (req, res) => {
  const u = req.user;
  res.json({ id: u.id, name: u.name, email: u.email, country: u.country, plan: u.plan, simBalance: u.simBalance, avatarUrl: u.avatarUrl || null, sandbox: u.sandbox || false });
};

// POST /api/auth/forgot-password  — send reset link
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Always respond 200 so we don't reveal whether email exists
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.json({ ok: true });

    // Invalidate any existing token for this user
    for (const [t, v] of resetTokens.entries()) {
      if (v.userId === user.id) resetTokens.delete(t);
    }

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 });

    const CLIENT_URL = process.env.CLIENT_URL || 'https://alert-hub-roan.vercel.app';
    const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
    sendPasswordResetEmail(user, resetUrl).catch(() => {});

    res.json({ ok: true });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password  — validate token and set new password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and new password are required.' });
    if (password.length < 6) return res.status(422).json({ error: 'Password must be at least 6 characters.' });

    const entry = resetTokens.get(token);
    if (!entry) return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    if (Date.now() > entry.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: entry.userId }, data: { passwordHash } });
    resetTokens.delete(token);

    res.json({ ok: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) { next(err); }
};

// POST /api/auth/send-otp  — send 6-digit OTP to authenticated user
const sendOtp = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { email: true, name: true } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(req.user.id, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendOtpEmail(user, otp);
    res.json({ ok: true, message: `OTP sent to ${user.email}` });
  } catch (err) { next(err); }
};

// POST /api/auth/verify-otp  — verify OTP and change password
const verifyOtp = async (req, res, next) => {
  try {
    const { otp, password } = req.body;
    if (!otp || !password) return res.status(400).json({ error: 'OTP and new password are required.' });
    if (password.length < 6) return res.status(422).json({ error: 'Password must be at least 6 characters.' });

    const entry = otpStore.get(req.user.id);
    if (!entry) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(req.user.id);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (entry.otp !== otp.trim()) return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    otpStore.delete(req.user.id);

    res.json({ ok: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, sandbox, me, forgotPassword, resetPassword, sendOtp, verifyOtp };
