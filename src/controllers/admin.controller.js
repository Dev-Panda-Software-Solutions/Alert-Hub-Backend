const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { PLAN_RANK } = require('../middleware/planGuard');
const { safeEqual } = require('../utils/safeEqual');

const ADMIN_TOKEN_TTL = '12h';

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

    // 14 daily buckets for the signup-growth sparkline, oldest → newest
    const dayStart = (offsetDays) => {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - offsetDays); return d;
    };
    const growthDays = Array.from({ length: 14 }, (_, i) => 13 - i);

    const [totalUsers, planCounts, totalReminders, pendingReminders, overdueReminders,
      activeTrials, newUsers30d, countryCounts, moduleCounts, categoryCounts,
      recurrenceCounts, amountAgg, growthCounts] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['plan'], _count: { plan: true } }),
      prisma.reminder.count(),
      prisma.reminder.count({ where: { completed: false } }),
      prisma.reminder.count({ where: { completed: false, dueDate: { lt: now } } }),
      prisma.user.count({ where: { trialEndsAt: { gt: now } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.groupBy({ by: ['country'], _count: { country: true }, orderBy: { _count: { country: 'desc' } }, take: 6 }),
      prisma.reminder.groupBy({ by: ['module'], _count: { module: true } }),
      prisma.reminder.groupBy({ by: ['category'], _count: { category: true }, orderBy: { _count: { category: 'desc' } }, take: 8 }),
      prisma.reminder.groupBy({ by: ['recurrence'], _count: { recurrence: true } }),
      prisma.reminder.aggregate({ _sum: { amount: true } }),
      Promise.all(growthDays.map(async (offset) => {
        const start = dayStart(offset);
        const end = dayStart(offset - 1);
        const count = await prisma.user.count({ where: { createdAt: { gte: start, lt: end } } });
        return { date: start.toISOString().split('T')[0], count };
      })),
    ]);

    const byPlan = { FREE: 0, PERSONAL: 0, FAMILY: 0, BUSINESS: 0 };
    planCounts.forEach((p) => { byPlan[p.plan] = p._count.plan; });

    const byModule = { BUSINESS: 0, FAMILY: 0, FINANCE: 0 };
    moduleCounts.forEach((m) => { byModule[m.module] = m._count.module; });

    const byRecurrence = { NONE: 0, MONTHLY: 0, YEARLY: 0 };
    recurrenceCounts.forEach((r) => { byRecurrence[r.recurrence] = r._count.recurrence; });

    res.json({
      totalUsers, byPlan, activeTrials, newUsers30d,
      totalReminders, pendingReminders, overdueReminders,
      completedReminders: totalReminders - pendingReminders,
      avgRemindersPerUser: totalUsers > 0 ? Math.round((totalReminders / totalUsers) * 10) / 10 : 0,
      totalAmountTracked: amountAgg._sum.amount || 0,
      byModule, byRecurrence,
      topCountries: countryCounts.map((c) => ({ country: c.country, count: c._count.country })),
      topCategories: categoryCounts.map((c) => ({ category: c.category, count: c._count.category })),
      signupGrowth: growthCounts,
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
    const { id } = req.params;
    const now = new Date();

    const user = await prisma.user.findUnique({
      where: { id },
      include: { reminders: { orderBy: { dueDate: 'desc' }, take: 50 } },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const [total, pending, overdue, completed, amountAgg, moduleCounts] = await Promise.all([
      prisma.reminder.count({ where: { userId: id } }),
      prisma.reminder.count({ where: { userId: id, completed: false } }),
      prisma.reminder.count({ where: { userId: id, completed: false, dueDate: { lt: now } } }),
      prisma.reminder.count({ where: { userId: id, completed: true } }),
      prisma.reminder.aggregate({ where: { userId: id }, _sum: { amount: true } }),
      prisma.reminder.groupBy({ by: ['module'], where: { userId: id }, _count: { module: true } }),
    ]);

    const byModule = { BUSINESS: 0, FAMILY: 0, FINANCE: 0 };
    moduleCounts.forEach((m) => { byModule[m.module] = m._count.module; });

    const { passwordHash, ...safe } = user;
    res.json({
      ...safe,
      reminderStats: {
        total, pending, overdue, completed,
        totalAmount: amountAgg._sum.amount || 0,
        byModule,
      },
    });
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
