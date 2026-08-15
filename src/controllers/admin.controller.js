const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { PLAN_RANK } = require('../middleware/planGuard');

const ADMIN_TOKEN_TTL = '12h';

// Constant-time string compare — avoids leaking password length/content via response timing.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // keep timing consistent even on length mismatch
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /api/admin/login
const login = (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return res.status(503).json({ error: 'Admin login is not configured on this server.' });
  }
  if (!username || !password || !safeEqual(username, expectedUser) || !safeEqual(password, expectedPass)) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: ADMIN_TOKEN_TTL });
  res.json({ token, expiresIn: ADMIN_TOKEN_TTL });
};

// GET /api/admin/stats
const stats = async (_req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, planCounts, totalReminders, pendingReminders, overdueReminders,
      activeTrials, newUsers30d] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['plan'], _count: { plan: true } }),
      prisma.reminder.count(),
      prisma.reminder.count({ where: { completed: false } }),
      prisma.reminder.count({ where: { completed: false, dueDate: { lt: now } } }),
      prisma.user.count({ where: { trialEndsAt: { gt: now } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    const byPlan = { FREE: 0, PERSONAL: 0, FAMILY: 0, BUSINESS: 0 };
    planCounts.forEach((p) => { byPlan[p.plan] = p._count.plan; });

    res.json({
      totalUsers, byPlan, activeTrials, newUsers30d,
      totalReminders, pendingReminders, overdueReminders,
      completedReminders: totalReminders - pendingReminders,
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users?search=&page=&limit=
const listUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 25 } = req.query;
    const where = search
      ? { OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ] }
      : {};

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true, name: true, email: true, country: true, plan: true,
          trialEndsAt: true, createdAt: true, simBalance: true,
          _count: { select: { reminders: true } },
        },
      }),
    ]);

    res.json({
      total, page: Number(page), limit: Number(limit),
      items: items.map((u) => ({ ...u, reminderCount: u._count.reminders, _count: undefined })),
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { reminders: { orderBy: { dueDate: 'desc' }, take: 20 } },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/plan
const updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const validPlans = Object.keys(PLAN_RANK);
    if (!validPlans.includes(plan)) {
      return res.status(422).json({ error: `Plan must be one of: ${validPlans.join(', ')}` });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { plan } }).catch(() => null);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: `Plan updated to ${plan}.`, id: user.id, plan: user.plan });
  } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found.' });
    next(err);
  }
};

module.exports = { login, stats, listUsers, getUser, updateUserPlan, deleteUser };
