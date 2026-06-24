const cron = require('node-cron');
const prisma = require('../config/db');
const { sendReminderDigest, sendOverdueAlert } = require('./email.service');

// Only users with plan ≥ PERSONAL get email digests
const EMAIL_ELIGIBLE_PLANS = ['PERSONAL', 'FAMILY', 'BUSINESS'];

// ── Helper: get reminders in a date range for a user ─────────────────────────

async function getUsersWithEmailPlan() {
  return prisma.user.findMany({
    where: { plan: { in: EMAIL_ELIGIBLE_PLANS } },
    select: { id: true, name: true, email: true, plan: true, simBalance: true },
  });
}

async function getRemindersForUser(userId, startDate, endDate) {
  return prisma.reminder.findMany({
    where: {
      userId,
      completed: false,
      dueDate: { gte: startDate, lt: endDate },
    },
    orderBy: { dueDate: 'asc' },
  });
}

function formatReminders(items) {
  return items.map((r) => ({ ...r, dueDate: r.dueDate.toISOString().split('T')[0] }));
}

// ── Job: Daily digest at 8:00 AM — reminders due today ───────────────────────

async function runDailyDigest() {
  console.log('[Cron] Running daily digest...');
  try {
    const users = await getUsersWithEmailPlan();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    let sent = 0;
    for (const user of users) {
      const reminders = await getRemindersForUser(user.id, today, tomorrow);
      if (reminders.length > 0) {
        await sendReminderDigest(user, formatReminders(reminders), 'Daily');
        sent++;
      }
    }
    console.log(`[Cron] Daily digest done — sent to ${sent}/${users.length} users`);
  } catch (err) {
    console.error('[Cron] Daily digest error:', err.message);
  }
}

// ── Job: Weekly digest every Monday at 7:00 AM — reminders due this week ─────

async function runWeeklyDigest() {
  console.log('[Cron] Running weekly digest...');
  try {
    const users = await getUsersWithEmailPlan();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

    let sent = 0;
    for (const user of users) {
      const reminders = await getRemindersForUser(user.id, today, weekEnd);
      if (reminders.length > 0) {
        await sendReminderDigest(user, formatReminders(reminders), 'Weekly');
        sent++;
      }
    }
    console.log(`[Cron] Weekly digest done — sent to ${sent}/${users.length} users`);
  } catch (err) {
    console.error('[Cron] Weekly digest error:', err.message);
  }
}

// ── Job: Monthly digest on 1st of month at 7:00 AM ───────────────────────────

async function runMonthlyDigest() {
  console.log('[Cron] Running monthly digest...');
  try {
    const users = await getUsersWithEmailPlan();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthEnd = new Date(today); monthEnd.setMonth(monthEnd.getMonth() + 1);

    let sent = 0;
    for (const user of users) {
      const reminders = await getRemindersForUser(user.id, today, monthEnd);
      if (reminders.length > 0) {
        await sendReminderDigest(user, formatReminders(reminders), 'Monthly');
        sent++;
      }
    }
    console.log(`[Cron] Monthly digest done — sent to ${sent}/${users.length} users`);
  } catch (err) {
    console.error('[Cron] Monthly digest error:', err.message);
  }
}

// ── Job: Overdue alert — every day at 9:00 AM ────────────────────────────────

async function runOverdueAlerts() {
  console.log('[Cron] Running overdue alerts...');
  try {
    const users = await getUsersWithEmailPlan();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    let sent = 0;
    for (const user of users) {
      const overdue = await prisma.reminder.findMany({
        where: { userId: user.id, completed: false, dueDate: { lt: today } },
        orderBy: { dueDate: 'desc' },
      });
      if (overdue.length > 0) {
        await sendOverdueAlert(user, formatReminders(overdue));
        sent++;
      }
    }
    console.log(`[Cron] Overdue alerts done — sent to ${sent}/${users.length} users`);
  } catch (err) {
    console.error('[Cron] Overdue alert error:', err.message);
  }
}

// ── Job: 3-day advance reminder at 7:30 AM ───────────────────────────────────

async function runAdvanceReminders() {
  console.log('[Cron] Running 3-day advance reminders...');
  try {
    const users = await getUsersWithEmailPlan();
    const in3 = new Date(); in3.setHours(0, 0, 0, 0); in3.setDate(in3.getDate() + 3);
    const in4 = new Date(in3); in4.setDate(in4.getDate() + 1);

    let sent = 0;
    for (const user of users) {
      const reminders = await getRemindersForUser(user.id, in3, in4);
      if (reminders.length > 0) {
        await sendReminderDigest(user, formatReminders(reminders), '3-Day Advance');
        sent++;
      }
    }
    console.log(`[Cron] 3-day advance done — sent to ${sent}/${users.length} users`);
  } catch (err) {
    console.error('[Cron] Advance reminder error:', err.message);
  }
}

// ── Register all cron jobs ────────────────────────────────────────────────────

function startCronJobs() {
  console.log('[Cron] Registering scheduled jobs...');

  // Daily digest — 8:00 AM every day
  cron.schedule('0 8 * * *', runDailyDigest, { timezone: 'Asia/Kolkata' });
  console.log('[Cron] ✓ Daily digest  → 08:00 IST daily');

  // Weekly digest — Monday 7:00 AM
  cron.schedule('0 7 * * 1', runWeeklyDigest, { timezone: 'Asia/Kolkata' });
  console.log('[Cron] ✓ Weekly digest → Mon 07:00 IST');

  // Monthly digest — 1st of month 7:00 AM
  cron.schedule('0 7 1 * *', runMonthlyDigest, { timezone: 'Asia/Kolkata' });
  console.log('[Cron] ✓ Monthly digest → 1st of month 07:00 IST');

  // Overdue alerts — 9:00 AM every day
  cron.schedule('0 9 * * *', runOverdueAlerts, { timezone: 'Asia/Kolkata' });
  console.log('[Cron] ✓ Overdue alerts → 09:00 IST daily');

  // 3-day advance reminders — 7:30 AM every day
  cron.schedule('30 7 * * *', runAdvanceReminders, { timezone: 'Asia/Kolkata' });
  console.log('[Cron] ✓ Advance reminders → 07:30 IST daily\n');
}

module.exports = { startCronJobs, runDailyDigest, runWeeklyDigest, runMonthlyDigest, runOverdueAlerts, runAdvanceReminders };
