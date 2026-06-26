const prisma = require('../config/db');
const { sanitiseChannels, PLAN_RANK, effectivePlan } = require('../middleware/planGuard');

function isSandbox(req) { return req.user.sandbox; }

// GET /api/dashboard/stats
const stats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (isSandbox(req)) return res.json(sandboxStats());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(today); monthEnd.setMonth(monthEnd.getMonth() + 1);

    const [total, completed, todayCount, weekCount, monthCount, overdueCount] = await Promise.all([
      prisma.reminder.count({ where: { userId } }),
      prisma.reminder.count({ where: { userId, completed: true } }),
      prisma.reminder.count({ where: { userId, completed: false, dueDate: { gte: today, lt: tomorrow } } }),
      prisma.reminder.count({ where: { userId, completed: false, dueDate: { gte: today, lt: weekEnd } } }),
      prisma.reminder.count({ where: { userId, completed: false, dueDate: { gte: today, lt: monthEnd } } }),
      prisma.reminder.count({ where: { userId, completed: false, dueDate: { lt: today } } }),
    ]);

    // Total pending amount this month
    const monthlyReminders = await prisma.reminder.findMany({
      where: { userId, completed: false, dueDate: { gte: today, lt: monthEnd } },
      select: { amount: true },
    });
    const monthlyAmount = monthlyReminders.reduce((s, r) => s + r.amount, 0);

    res.json({ total, completed, pending: total - completed, todayCount, weekCount, monthCount, overdueCount, monthlyAmount });
  } catch (err) { next(err); }
};

// GET /api/dashboard/today
const today = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (isSandbox(req)) return res.json({ reminders: [] });

    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    const reminders = await prisma.reminder.findMany({
      where: { userId, dueDate: { gte: start, lt: end } },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ reminders: reminders.map(formatR) });
  } catch (err) { next(err); }
};

// GET /api/dashboard/upcoming
const upcoming = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (isSandbox(req)) return res.json({ reminders: [] });

    const days = parseInt(req.query.days) || 30;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + days);

    const reminders = await prisma.reminder.findMany({
      where: { userId, completed: false, dueDate: { gte: start, lt: end } },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });

    res.json({ reminders: reminders.map(formatR) });
  } catch (err) { next(err); }
};

// GET /api/dashboard/overdue
const overdue = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (isSandbox(req)) return res.json({ reminders: [] });

    const today = new Date(); today.setHours(0, 0, 0, 0);

    const reminders = await prisma.reminder.findMany({
      where: { userId, completed: false, dueDate: { lt: today } },
      orderBy: { dueDate: 'desc' },
      take: 20,
    });

    res.json({ reminders: reminders.map(formatR) });
  } catch (err) { next(err); }
};

// GET /api/dashboard/channels
const channels = (req, res) => {
  const plan = effectivePlan(req.user);
  const rank = PLAN_RANK[plan];
  res.json({
    push:      { enabled: true, locked: false },
    email:     { enabled: rank >= PLAN_RANK.PERSONAL, locked: rank < PLAN_RANK.PERSONAL },
    whatsapp:  { enabled: rank >= PLAN_RANK.PERSONAL, locked: rank < PLAN_RANK.PERSONAL },
    sms:       { enabled: rank >= PLAN_RANK.FAMILY,   locked: rank < PLAN_RANK.FAMILY },
  });
};

// ── helpers ──────────────────────────────────────────────────────────────────

function formatR(r) {
  return { ...r, dueDate: r.dueDate.toISOString().split('T')[0] };
}

function sandboxStats() {
  return { total: 8, completed: 2, pending: 6, todayCount: 1, weekCount: 3, monthCount: 6, overdueCount: 1, monthlyAmount: 42500 };
}

module.exports = { stats, today, upcoming, overdue, channels };
