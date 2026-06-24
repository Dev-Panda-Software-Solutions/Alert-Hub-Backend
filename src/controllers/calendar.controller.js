const prisma = require('../config/db');

// GET /api/calendar/month?year=2026&month=6
const month = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (req.user.sandbox) return res.json({ days: {} });

    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const mon   = parseInt(req.query.month) || new Date().getMonth() + 1;

    const start = new Date(year, mon - 1, 1);
    const end   = new Date(year, mon, 1);

    const reminders = await prisma.reminder.findMany({
      where: { userId, dueDate: { gte: start, lt: end } },
      select: { id: true, title: true, dueDate: true, module: true, completed: true, amount: true },
      orderBy: { dueDate: 'asc' },
    });

    // Group by ISO date string "YYYY-MM-DD"
    const days = {};
    reminders.forEach((r) => {
      const key = r.dueDate.toISOString().split('T')[0];
      if (!days[key]) days[key] = [];
      days[key].push({ ...r, dueDate: key });
    });

    res.json({ year, month: mon, days });
  } catch (err) { next(err); }
};

// GET /api/calendar/day?date=2026-06-23
const day = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (req.user.sandbox) return res.json({ reminders: [] });

    const dateStr = req.query.date;
    if (!dateStr) return res.status(422).json({ error: 'date query param required (YYYY-MM-DD).' });

    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end   = new Date(`${dateStr}T23:59:59.999Z`);

    const reminders = await prisma.reminder.findMany({
      where: { userId, dueDate: { gte: start, lte: end } },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ date: dateStr, reminders: reminders.map((r) => ({ ...r, dueDate: dateStr })) });
  } catch (err) { next(err); }
};

module.exports = { month, day };
