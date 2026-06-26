'use strict';

const APP_NAME = 'Alert-Guard';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fmt(n) { if (!n && n !== 0) return ''; return '₹' + Math.round(n).toLocaleString('en-IN'); }

// ── Test Push — 20 variants ───────────────────────────────────────────────────
const TEST_PUSH = [
  { title: `${APP_NAME} — Alerts Active! 🔔`, body: "Push notifications are working perfectly. You'll be notified for every due payment in real time." },
  { title: '✅ Notifications Enabled', body: `Perfect! ${APP_NAME} will now alert you for due payments even when the app is closed.` },
  { title: "🚀 You're all set!", body: "Real-time push alerts are ready. Never miss an EMI, GST filing, or bill payment again." },
  { title: "🛡️ Alert-Guard is watching", body: "Your payment guardian is active. We'll notify you before every due date so you never pay a late fee." },
  { title: '🔔 Push Test Successful', body: `${APP_NAME} can now reach you directly. Expect alerts for reminders, overdue notices, and daily digests.` },
  { title: '⚡ Real-time alerts ready', body: "Instant payment alerts are enabled. You'll hear from us before every due date." },
  { title: `📡 ${APP_NAME} Connected`, body: "Your device is linked. Payment reminders will arrive even when the tab is closed." },
  { title: '🎯 Test notification received!', body: `${APP_NAME} push delivery is confirmed. Your financial alerts are fully operational.` },
  { title: '💡 Notifications: On', body: `Great news — ${APP_NAME} can now push alerts directly to your device. Stay on top of every payment.` },
  { title: '🔐 Secure alerts enabled', body: "Payment notifications are active and secured. You'll receive real-time updates for every due reminder." },
  { title: '📲 Device registered', body: `Your device is now receiving ${APP_NAME} alerts. EMIs, bills, and GST due dates will push directly to you.` },
  { title: '🌟 Alert system live', body: "Your notification setup is complete. Sit back — we'll remind you before every payment is due." },
  { title: '✔️ Delivery confirmed', body: `${APP_NAME} test notification delivered successfully. You're all set to receive payment reminders.` },
  { title: '🎉 Alerts are on!', body: "You'll never miss a payment again. Real-time reminders will reach you wherever you are." },
  { title: '📬 Test delivered!', body: `${APP_NAME} notification system is fully operational. Expect timely alerts for all your payment obligations.` },
  { title: '🔔 Ready to remind you', body: "Push alerts confirmed! We'll notify you for every EMI, rent, insurance, and bill that's coming up." },
  { title: "💪 You're in control", body: `${APP_NAME} alerts are active. Every due date, every overdue notice — directly on your device.` },
  { title: '🌐 Connected & ready', body: `${APP_NAME} is linked to your browser. Payment alerts will push through even when offline.` },
  { title: '⏰ Never miss a deadline', body: `${APP_NAME} is now configured to send you payment reminders. Your financial obligations are covered.` },
  { title: '🏆 Alert-Guard activated', body: "Your personal payment watchdog is live. We'll alert you before due dates so you always pay on time." },
];

// ── Reminder Due Push — 20 variants ──────────────────────────────────────────
const REMINDER_DUE_PUSH = [
  { title: '📅 Due Today: {title}', body: '{title} — {amount} is due today. Mark it complete once paid.' },
  { title: '💳 Payment Due: {title}', body: '{amount} is due today for {title}. Tap to view and mark complete.' },
  { title: '⏰ {title} due now', body: "Your {title} payment of {amount} is due today. Don't let it slip past you." },
  { title: '🔔 Reminder: {title}', body: '{amount} due today — {title}. Open Alert-Guard to mark it as paid.' },
  { title: '⚠️ Payment due: {amount}', body: '{title} is due today. Tap to review and complete the payment.' },
  { title: "📋 Today's obligation: {title}", body: '{title} requires a payment of {amount} today. Stay on schedule!' },
  { title: '💰 {amount} due — {title}', body: "Don't forget your {title} payment due today. Mark it done once complete." },
  { title: '🗓️ {title} — today is the day', body: 'Your {title} payment of {amount} is scheduled for today. Tap to confirm.' },
  { title: '⚡ Act now: {title}', body: '{title} ({amount}) is due today. Take action to avoid late fees or penalties.' },
  { title: '📌 Pinned: {title} due today', body: '{amount} due for {title}. Log in to Alert-Guard and mark it complete.' },
  { title: '🏦 {title} payment today', body: 'Your scheduled payment of {amount} for {title} falls due today.' },
  { title: '📅 Due date arrived: {title}', body: 'The due date for {title} is here. {amount} is owed — pay now to stay current.' },
  { title: '✅ Ready to mark done? {title}', body: '{title} is due today — {amount}. Once paid, mark it complete in Alert-Guard.' },
  { title: '💼 Reminder: {title}', body: '{title} payment of {amount} is due. Take care of it today to avoid complications.' },
  { title: '🕐 Time-sensitive: {title}', body: '{amount} must be paid today for {title}. Due date is now — act promptly.' },
  { title: '📢 Alert: {title} is due', body: 'Your {title} obligation of {amount} is due today. Open the app to mark it paid.' },
  { title: '🔑 Due: {title} ({amount})', body: 'Pay {amount} for {title} today and keep your financial record clean.' },
  { title: '🧾 Invoice due: {title}', body: '{title} — {amount} falls due today. Please ensure timely payment.' },
  { title: '🌟 Stay ahead: {title}', body: 'Paying {title} ({amount}) today keeps you ahead of deadlines. Mark it done!' },
  { title: '💡 Payment day: {title}', body: 'Today is the due date for {title}. {amount} needs to be settled — tap to confirm.' },
];

// ── Overdue Alert Push — 20 variants ─────────────────────────────────────────
const OVERDUE_PUSH = [
  { title: '⚠️ {count} Overdue Payment{s}', body: '{count} payment{s} totalling {total} {are} past due. Clear them now to avoid penalties.' },
  { title: '🚨 Action required: {count} overdue', body: '{total} in overdue payments. Resolve them immediately to protect your financial record.' },
  { title: '🔴 {count} Payment{s} Overdue', body: 'You have {count} overdue payment{s} worth {total}. Tap to review and settle them now.' },
  { title: '💸 {total} overdue — act now', body: '{count} payment{s} {have} passed their due date. Immediate action required to avoid late fees.' },
  { title: '⏰ Past due: {count} item{s}', body: '{count} reminder{s} worth {total} {are} overdue. Open Alert-Guard to mark them resolved.' },
  { title: '🚩 Overdue notice: {total}', body: '{count} payment{s} {have} expired. Settle {total} as soon as possible to stay current.' },
  { title: "❗ Don't ignore: {count} overdue", body: 'You have {count} unresolved payment{s} totalling {total}. Clearing them now prevents further charges.' },
  { title: '📛 {count} Payment{s} Past Due', body: '{total} in obligations {are} overdue. Review your reminders and resolve them today.' },
  { title: '⚡ Urgent: Clear overdue payments', body: '{count} payment{s} worth {total} {have} passed their due date. Act now to avoid complications.' },
  { title: '🔔 Overdue alert: {total}', body: 'You owe {total} in overdue payments ({count} item{s}). Log in to resolve them immediately.' },
  { title: '💳 Overdue balance: {total}', body: '{count} payment{s} worth {total} {are} past their due date. Settle them to keep your record clean.' },
  { title: '🌋 {count} Overdue item{s}', body: 'Unresolved payments worth {total} {are} accumulating. Handle them now before penalties increase.' },
  { title: '📉 Overdue warning: {count} item{s}', body: 'Your {count} overdue payment{s} ({total} total) need immediate attention. Tap to resolve now.' },
  { title: '🛑 Stop the late fees', body: '{count} payment{s} worth {total} {are} overdue. Settle them now to stop further charges.' },
  { title: '🧾 {total} outstanding overdue', body: 'You have {count} overdue payment{s}. Review and resolve them to avoid escalating penalties.' },
  { title: '⚠️ Financial alert: overdue', body: '{count} payment{s} totalling {total} {have} passed their due date. Immediate payment is recommended.' },
  { title: '🔴 Payment overdue: resolve now', body: '{count} obligation{s} worth {total} {are} past due. Open Alert-Guard to clear them today.' },
  { title: '💰 {total} needs to be settled', body: '{count} overdue payment{s} require your immediate attention. Act before it grows further.' },
  { title: '🏦 Overdue: {count} account{s}', body: 'Your financial record has {count} overdue item{s} worth {total}. Address them promptly.' },
  { title: '🚀 Clear overdue in 1 tap', body: '{count} payment{s} worth {total} {are} past due. Open Alert-Guard and mark them resolved.' },
];

// ── Digest Push — 20 variants ─────────────────────────────────────────────────
const DIGEST_PUSH = [
  { title: '📋 {period} Digest: {count} Due', body: '{count} payment{s} due {periodLabel} totalling {total}. Tap to review your schedule.' },
  { title: '💳 {count} Payment{s} Due {periodLabel}', body: 'Your {period} digest: {total} across {count} obligation{s}. Stay on top of them!' },
  { title: '📅 {period} payment summary', body: '{count} upcoming payment{s} worth {total} {are} due {periodLabel}. Open Alert-Guard to plan ahead.' },
  { title: '🔔 {period} Reminder: {total} due', body: 'You have {count} payment{s} due {periodLabel} totalling {total}. Tap to see the breakdown.' },
  { title: '📊 {period} financial obligations', body: '{count} payment{s} worth {total} coming up {periodLabel}. Check your Alert-Guard dashboard.' },
  { title: '💡 Plan ahead: {count} due {periodLabel}', body: 'Prepare {total} for {count} scheduled payment{s} due {periodLabel}. Stay financially fit!' },
  { title: '⏰ {count} payment{s} scheduled', body: '{total} is due {periodLabel} across {count} obligation{s}. Tap to view and prepare.' },
  { title: '📬 Your {period} payment alert', body: '{count} payment{s} totalling {total} {are} scheduled for {periodLabel}. Review your reminders.' },
  { title: '🗓️ {periodLabel}: {count} obligation{s}', body: 'Payment reminder: {total} across {count} item{s} due {periodLabel}. Review now.' },
  { title: '💼 {period} financial digest', body: '{total} in upcoming payments. You have {count} obligation{s} due {periodLabel}. Check your schedule.' },
  { title: '🏦 Upcoming payments: {total}', body: '{count} financial obligation{s} worth {total} {are} due {periodLabel}. Stay prepared.' },
  { title: '📌 {period} schedule: {total}', body: '{count} payment{s} due {periodLabel}. Total: {total}. Open Alert-Guard to review all reminders.' },
  { title: '🎯 {period} focus: {count} payment{s}', body: 'Your financial focus for {periodLabel}: {count} payment{s} totalling {total}.' },
  { title: '⚡ Alert: {total} due {periodLabel}', body: '{count} upcoming payment{s} worth {total}. Take care of them to avoid overdue charges.' },
  { title: '📈 Stay on track: {count} due', body: 'You have {count} payment{s} due {periodLabel} ({total} total). Staying current keeps your record clean.' },
  { title: '🌟 {period} roundup: {count} item{s}', body: '{total} across {count} scheduled payment{s} due {periodLabel}. Open the app to stay organised.' },
  { title: '🔑 {count} obligation{s} — {total}', body: 'Your {period} payment schedule: {count} item{s} worth {total} due {periodLabel}.' },
  { title: '💰 Budget alert: {total} due', body: 'Set aside {total} for {count} upcoming payment{s} due {periodLabel}. Review in Alert-Guard.' },
  { title: '🧾 Payment plan: {count} item{s}', body: 'Your {period} digest shows {count} payment{s} worth {total} due {periodLabel}.' },
  { title: '🚀 Ready to pay {count} bills?', body: '{total} across {count} payment{s} is due {periodLabel}. Open Alert-Guard and mark them complete.' },
];

// ── Template filler ────────────────────────────────────────────────────────────
function fill(template, vars) {
  const count = vars.count ?? 0;
  const extra = {
    s:        count === 1 ? '' : 's',
    are:      count === 1 ? 'is' : 'are',
    have:     count === 1 ? 'has' : 'have',
  };
  const all = { ...extra, ...vars };
  let { title, body } = template;
  for (const [k, v] of Object.entries(all)) {
    const re = new RegExp(`\\{${k}\\}`, 'g');
    title = title.replace(re, String(v));
    body  = body.replace(re, String(v));
  }
  return { title, body };
}

// ── Public helpers ─────────────────────────────────────────────────────────────
function getTestPush() {
  const t = pick(TEST_PUSH);
  return { title: t.title, body: t.body, url: '/dashboard' };
}

function getReminderDuePush(reminder) {
  const t = pick(REMINDER_DUE_PUSH);
  const { title, body } = fill(t, { title: reminder.title, amount: fmt(reminder.amount), dueDate: reminder.dueDate });
  return { title, body, url: '/reminders' };
}

function getOverduePush(count, totalAmount) {
  const t = pick(OVERDUE_PUSH);
  const { title, body } = fill(t, { count, total: fmt(totalAmount) });
  return { title, body, url: '/reminders' };
}

function getDigestPush(count, totalAmount, period) {
  const t = pick(DIGEST_PUSH);
  const labels = { Daily:'today', Weekly:'this week', Monthly:'this month', '3-Day Advance':'in 3 days' };
  const { title, body } = fill(t, { count, total: fmt(totalAmount), period, periodLabel: labels[period] || period.toLowerCase() });
  return { title, body, url: '/reminders' };
}

module.exports = { getTestPush, getReminderDuePush, getOverduePush, getDigestPush };
