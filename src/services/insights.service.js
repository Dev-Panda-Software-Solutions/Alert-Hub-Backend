const prisma = require('../config/db');

// ─── Core AI engine ───────────────────────────────────────────────────────────

async function generateInsights(userId, simBalance) {
  const insights = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
  const monthEnd = new Date(today); monthEnd.setMonth(monthEnd.getMonth() + 1);

  const allPending = await prisma.reminder.findMany({
    where: { userId, completed: false },
    select: { id: true, title: true, dueDate: true, amount: true, category: true, module: true, channels: true },
  });

  // ── 1. Weekly outflow ──────────────────────────────────────────────────────
  const weekItems = allPending.filter((r) => r.dueDate >= today && r.dueDate < weekEnd);
  const weekTotal = weekItems.reduce((s, r) => s + r.amount, 0);

  if (weekTotal > 0) {
    insights.push({
      type: 'weekly_outflow',
      severity: weekTotal > 50000 ? 'warning' : 'info',
      title: 'Weekly Cash Outflow',
      body: `₹${formatNum(weekTotal)} is due in the next 7 days across ${weekItems.length} reminder(s).`,
      affectedIds: weekItems.map((r) => r.id),
    });
  }

  // ── 2. Liquidity alert ─────────────────────────────────────────────────────
  const monthItems = allPending.filter((r) => r.dueDate >= today && r.dueDate < monthEnd);
  const monthTotal = monthItems.reduce((s, r) => s + r.amount, 0);
  const bufferRatio = simBalance > 0 ? monthTotal / simBalance : Infinity;

  if (bufferRatio > 0.5) {
    insights.push({
      type: 'liquidity_alert',
      severity: bufferRatio > 0.9 ? 'critical' : 'warning',
      title: 'Liquidity Alert',
      body: `Monthly obligations (₹${formatNum(monthTotal)}) consume ${Math.round(bufferRatio * 100)}% of your balance (₹${formatNum(simBalance)}). Consider maintaining a larger buffer.`,
      affectedIds: monthItems.map((r) => r.id),
    });
  }

  // ── 3. Overdue reminders ───────────────────────────────────────────────────
  const overdue = allPending.filter((r) => r.dueDate < today);
  if (overdue.length > 0) {
    insights.push({
      type: 'overdue',
      severity: 'critical',
      title: 'Overdue Reminders',
      body: `${overdue.length} reminder(s) are past due: ${overdue.slice(0, 3).map((r) => r.title).join(', ')}${overdue.length > 3 ? '…' : ''}.`,
      affectedIds: overdue.map((r) => r.id),
    });
  }

  // ── 4. Date overlap conflicts ──────────────────────────────────────────────
  const dateCounts = {};
  allPending.forEach((r) => {
    const key = r.dueDate.toISOString().split('T')[0];
    if (!dateCounts[key]) dateCounts[key] = [];
    dateCounts[key].push(r);
  });

  const conflictDays = Object.entries(dateCounts).filter(([, items]) => {
    const total = items.reduce((s, r) => s + r.amount, 0);
    return items.length >= 3 || total > 30000;
  });

  if (conflictDays.length > 0) {
    const [date, items] = conflictDays[0];
    insights.push({
      type: 'date_conflict',
      severity: 'warning',
      title: 'High-Load Payment Date',
      body: `${date} has ${items.length} payment(s) totalling ₹${formatNum(items.reduce((s, r) => s + r.amount, 0))}. Consider staggering some dates.`,
      affectedIds: items.map((r) => r.id),
    });
  }

  // ── 5. Subscription audit ─────────────────────────────────────────────────
  const subscriptionCategories = ['ott', 'mobile', 'broadband', 'sip', 'health_insurance', 'car_insurance', 'lic'];
  const subscriptions = allPending.filter((r) => subscriptionCategories.includes(r.category));

  if (subscriptions.length >= 3) {
    const total = subscriptions.reduce((s, r) => s + r.amount, 0);
    insights.push({
      type: 'subscription_audit',
      severity: 'info',
      title: 'Subscription Audit',
      body: `You have ${subscriptions.length} recurring subscriptions totalling ₹${formatNum(total)}/mo. Review for unused services.`,
      affectedIds: subscriptions.map((r) => r.id),
    });
  }

  // ── 6. No reminders nudge ─────────────────────────────────────────────────
  if (insights.length === 0) {
    insights.push({
      type: 'all_clear',
      severity: 'success',
      title: 'All Clear!',
      body: 'You have no overdue items and your cash flow looks healthy. Great job staying on top of your finances!',
      affectedIds: [],
    });
  }

  return insights;
}

// ─── Cash flow chart — rolling 7 days ─────────────────────────────────────────

async function cashflowChart(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    days.push(d);
  }

  const start = days[0];
  const end   = new Date(days[days.length - 1]); end.setDate(end.getDate() + 1);

  const reminders = await prisma.reminder.findMany({
    where: { userId, dueDate: { gte: start, lt: end } },
    select: { dueDate: true, amount: true, completed: true },
  });

  const points = days.map((d) => {
    const dateStr = d.toISOString().split('T')[0];
    const dayItems = reminders.filter((r) => r.dueDate.toISOString().split('T')[0] === dateStr);
    const outflow = dayItems.reduce((s, r) => s + r.amount, 0);
    const paid    = dayItems.filter((r) => r.completed).reduce((s, r) => s + r.amount, 0);
    return { date: dateStr, outflow, paid };
  });

  return points;
}

// ─── NLP query processor ──────────────────────────────────────────────────────

async function processQuery(userId, query, simBalance) {
  const q = query.toLowerCase().trim();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today); dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const weekEnd  = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
  const monthEnd = new Date(today); monthEnd.setMonth(monthEnd.getMonth() + 1);
  const next30End = new Date(today); next30End.setDate(next30End.getDate() + 30);

  const pending = await prisma.reminder.findMany({
    where: { userId, completed: false },
    select: { id: true, title: true, dueDate: true, amount: true, category: true, module: true },
    orderBy: [{ dueDate: 'asc' }, { amount: 'desc' }],
  });

  const inRange = (start, end) => pending.filter((r) => r.dueDate >= start && r.dueDate < end);
  const total = (items) => items.reduce((s, r) => s + r.amount, 0);
  const listTitles = (items) => items.slice(0, 5).map((r) => `${r.title} (${formatDate(r.dueDate)}, ₹${formatNum(r.amount)})`).join(', ');
  const summarise = (label, items) => {
    if (items.length === 0) return `No pending reminders found for ${label}.`;
    return `${label}: ₹${formatNum(total(items))} across ${items.length} reminder(s). ${listTitles(items)}${items.length > 5 ? '...' : ''}.`;
  };
  const byCategory = (categories) => pending.filter((r) => categories.includes(r.category));
  const byModule = (module) => pending.filter((r) => r.module === module);

  if (/due today|today/.test(q)) {
    return summarise('Due today', inRange(today, tomorrow));
  }

  if (/due tomorrow|tomorrow/.test(q)) {
    return summarise('Due tomorrow', inRange(tomorrow, dayAfterTomorrow));
  }

  // Intent: total this month
  if (/this month|monthly|month total/.test(q)) {
    return summarise('This month', inRange(today, monthEnd));
  }

  // Intent: this week
  if (/this week|week total|next 7 days|next week|cash flow next week/.test(q)) {
    return summarise('This week', inRange(today, weekEnd));
  }

  if (/next 30 days|30 days|upcoming bills|upcoming payments|upcoming reminders/.test(q)) {
    return summarise('Next 30 days', inRange(today, next30End));
  }

  // Intent: overdue
  if (/overdue|missed|late|past due/.test(q)) {
    const over = pending.filter((r) => r.dueDate < today);
    if (over.length === 0) return 'Great news — you have no overdue reminders!';
    return `You have ${over.length} overdue payment(s): ${over.map((r) => r.title).join(', ')}.`;
  }

  // Intent: largest expense
  if (/biggest|largest|highest|top expense/.test(q)) {
    if (pending.length === 0) return 'No pending reminders to analyse.';
    const sorted = [...pending].sort((a, b) => b.amount - a.amount);
    const top = sorted[0];
    return `Your largest upcoming expense is "${top.title}" at ₹${formatNum(top.amount)}, due on ${formatDate(top.dueDate)}.`;
  }

  // Intent: can I afford
  if (/can i afford|afford|enough money/.test(q)) {
    const month = inRange(today, monthEnd);
    const monthTotal = total(month);
    const balance = simBalance;
    if (balance >= monthTotal) {
      return `Yes. Your balance of ₹${formatNum(balance)} can cover this month's pending obligations of ₹${formatNum(monthTotal)}, leaving ₹${formatNum(balance - monthTotal)}.`;
    }
    return `Caution: your balance of ₹${formatNum(balance)} falls short of this month's pending obligations of ₹${formatNum(monthTotal)} by ₹${formatNum(monthTotal - balance)}.`;
  }

  if (/cash.*remain|remaining cash|cash remaining|left after/.test(q)) {
    const monthTotal = total(inRange(today, monthEnd));
    return `After this month's pending reminders, your simulated cash balance would be ₹${formatNum(simBalance - monthTotal)} (₹${formatNum(simBalance)} balance - ₹${formatNum(monthTotal)} due).`;
  }

  // Intent: EMI / loans
  if (/emi|loan|credit card/.test(q)) {
    if (/credit card/.test(q)) {
      return summarise('Credit card payments', byCategory(['credit_card']));
    }
    return summarise('Loan and EMI payments', byCategory(['emi', 'home_loan', 'personal_loan', 'credit_card']));
  }

  // Intent: subscriptions
  if (/subscription|ott|streaming|services/.test(q)) {
    return summarise('Subscriptions and services', byCategory(['ott', 'mobile', 'broadband']));
  }

  // Intent: business taxes
  if (/gst|tax|tds|professional tax/.test(q)) {
    return summarise('Tax and GST payments', byCategory(['gst', 'tds', 'income_tax', 'professional_tax']));
  }

  // Intent: investments/SIP
  if (/sip|invest|mutual fund|fd|fixed deposit/.test(q)) {
    return summarise('Investment reminders', byCategory(['sip', 'fixed_deposit']));
  }

  if (/insurance/.test(q)) {
    return summarise('Insurance payments', byCategory(['lic', 'health_insurance', 'car_insurance']));
  }

  if (/family|household|home bills/.test(q)) {
    return summarise('Family bills', byModule('FAMILY'));
  }

  if (/business/.test(q)) {
    return summarise('Business payments', byModule('BUSINESS'));
  }

  if (/finance|financial payments/.test(q)) {
    return summarise('Finance payments', byModule('FINANCE'));
  }

  if (/module.*cost|costs the most|which module/.test(q)) {
    if (pending.length === 0) return 'No pending reminders to compare by module.';
    const modules = ['BUSINESS', 'FAMILY', 'FINANCE'].map((module) => ({
      module,
      amount: total(byModule(module)),
      count: byModule(module).length,
    })).sort((a, b) => b.amount - a.amount);
    const top = modules[0];
    return `${top.module} costs the most right now: ₹${formatNum(top.amount)} across ${top.count} pending reminder(s). Breakdown: ${modules.map((m) => `${m.module} ₹${formatNum(m.amount)}`).join(', ')}.`;
  }

  if (/pay first|priority|urgent|first/.test(q)) {
    const ordered = [...pending].sort((a, b) => {
      const dateDiff = a.dueDate - b.dueDate;
      return dateDiff || b.amount - a.amount;
    });
    if (ordered.length === 0) return 'No pending reminders need payment priority right now.';
    return `Pay these first based on due date and amount: ${listTitles(ordered)}${ordered.length > 5 ? '...' : ''}.`;
  }

  if (/saving tips|save money|reduce spending|spending tips/.test(q)) {
    const subs = byCategory(['ott', 'mobile', 'broadband']);
    const overdue = pending.filter((r) => r.dueDate < today);
    const monthTotal = total(inRange(today, monthEnd));
    return [
      `This month has ₹${formatNum(monthTotal)} pending.`,
      overdue.length ? `Clear ${overdue.length} overdue reminder(s) first to avoid penalties.` : 'You have no overdue reminders, so keep paying before due dates.',
      subs.length ? `Review ${subs.length} subscription/service reminder(s) worth ₹${formatNum(total(subs))}.` : 'No subscription reminders are currently visible.',
      'Prioritise high-value and nearest-due payments before discretionary spending.',
    ].join(' ');
  }

  // Intent: count / how many
  if (/how many|count|total reminders/.test(q)) {
    return `You currently have ${pending.length} pending reminder(s).`;
  }

  // Intent: hello / help
  if (/hello|hi|hey|help|what can you do/.test(q)) {
    return "Hello! I can help you with: monthly totals, weekly dues, overdue payments, your largest expense, affordability checks, EMIs, subscriptions, tax payments, and investment reminders. Try asking something like 'Can I afford this month?' or 'What are my overdue items?'";
  }

  return "I'm not sure about that. Try asking: 'What's due this week?', 'Show overdue reminders', or 'Can I afford this month?'";
}

function formatNum(n) {
  return Math.round(n).toLocaleString('en-IN');
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

module.exports = { generateInsights, cashflowChart, processQuery };
