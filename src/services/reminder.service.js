const prisma = require('../config/db');
const { sanitiseChannels, PLAN_RANK } = require('../middleware/planGuard');
const { ALL_CATEGORY_VALUES } = require('../constants/categories');

const FREE_REMINDER_CAP = 30;

// ─── helpers ──────────────────────────────────────────────────────────────────

function toDbDate(dateStr) {
  // Accept "YYYY-MM-DD" → convert to DateTime at midnight UTC
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function formatReminder(r) {
  return {
    ...r,
    dueDate: r.dueDate.toISOString().split('T')[0],
  };
}

// ─── service functions ────────────────────────────────────────────────────────

async function listReminders(userId, { module, completed, page = 1, limit = 50 } = {}) {
  const where = { userId };
  if (module)                where.module = module;
  if (completed !== undefined) where.completed = completed === 'true' || completed === true;

  const [total, items] = await Promise.all([
    prisma.reminder.count({ where }),
    prisma.reminder.findMany({
      where,
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
      skip: (page - 1) * limit,
      take: Number(limit),
    }),
  ]);

  return { total, page: Number(page), limit: Number(limit), items: items.map(formatReminder) };
}

async function getReminder(id, userId) {
  const r = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!r) { const e = new Error('Reminder not found.'); e.status = 404; throw e; }
  return formatReminder(r);
}

async function createReminder(userId, data, plan) {
  if (PLAN_RANK[plan] === 0) {
    const count = await prisma.reminder.count({ where: { userId } });
    if (count >= FREE_REMINDER_CAP) {
      const e = new Error(`Free plan is limited to ${FREE_REMINDER_CAP} reminders. Upgrade to add more.`);
      e.status = 403;
      throw e;
    }
  }

  // Business module needs BUSINESS plan
  if (data.module === 'BUSINESS' && PLAN_RANK[plan] < PLAN_RANK.BUSINESS) {
    const e = new Error('Business reminders require the BUSINESS plan.');
    e.status = 403;
    throw e;
  }

  if (!ALL_CATEGORY_VALUES.includes(data.category)) {
    const e = new Error('Invalid category.'); e.status = 422; throw e;
  }

  const channels = sanitiseChannels(data.channels || [], plan);

  const r = await prisma.reminder.create({
    data: {
      userId,
      title: data.title,
      module: data.module,
      category: data.category,
      amount: parseFloat(data.amount),
      dueDate: toDbDate(data.dueDate),
      recurrence: data.recurrence || 'NONE',
      schedule: data.schedule || [],
      channels,
    },
  });
  return formatReminder(r);
}

async function updateReminder(id, userId, data, plan) {
  const existing = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!existing) { const e = new Error('Reminder not found.'); e.status = 404; throw e; }

  const channels = data.channels !== undefined
    ? sanitiseChannels(data.channels, plan)
    : existing.channels;

  const r = await prisma.reminder.update({
    where: { id },
    data: {
      ...(data.title      && { title: data.title }),
      ...(data.module     && { module: data.module }),
      ...(data.category   && { category: data.category }),
      ...(data.amount !== undefined  && { amount: parseFloat(data.amount) }),
      ...(data.dueDate    && { dueDate: toDbDate(data.dueDate) }),
      ...(data.recurrence && { recurrence: data.recurrence }),
      ...(data.schedule   && { schedule: data.schedule }),
      ...('priority' in data && { priority: data.priority || null }),
      channels,
    },
  });
  return formatReminder(r);
}

async function deleteReminder(id, userId) {
  const existing = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!existing) { const e = new Error('Reminder not found.'); e.status = 404; throw e; }
  await prisma.reminder.delete({ where: { id } });
}

async function toggleComplete(id, userId) {
  const existing = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!existing) { const e = new Error('Reminder not found.'); e.status = 404; throw e; }

  const markingComplete = !existing.completed;

  const r = await prisma.reminder.update({
    where: { id },
    data: {
      completed: markingComplete,
      completedAt: markingComplete ? new Date() : null,
    },
  });

  // Auto-generate next recurring instance when marking complete
  if (markingComplete && existing.recurrence !== 'NONE') {
    const nextDue = new Date(existing.dueDate);
    if (existing.recurrence === 'MONTHLY') {
      nextDue.setUTCMonth(nextDue.getUTCMonth() + 1);
    } else {
      nextDue.setUTCFullYear(nextDue.getUTCFullYear() + 1);
    }
    // Only create if no identical pending instance already exists
    const duplicate = await prisma.reminder.findFirst({
      where: { userId, title: existing.title, dueDate: nextDue, completed: false },
    });
    if (!duplicate) {
      await prisma.reminder.create({
        data: {
          userId: existing.userId,
          title: existing.title,
          module: existing.module,
          category: existing.category,
          amount: existing.amount,
          dueDate: nextDue,
          recurrence: existing.recurrence,
          schedule: existing.schedule,
          channels: existing.channels,
        },
      });
    }
  }

  return formatReminder(r);
}

async function bulkDelete(userId, ids) {
  const result = await prisma.reminder.deleteMany({
    where: { id: { in: ids }, userId },
  });
  return result.count;
}

module.exports = { listReminders, getReminder, createReminder, updateReminder, deleteReminder, toggleComplete, bulkDelete };
