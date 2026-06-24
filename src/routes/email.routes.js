const { Router } = require('express');
const auth = require('../middleware/auth');
const { sendMail, verifySmtp } = require('../services/email.service');
const { runDailyDigest, runOverdueAlerts, runWeeklyDigest } = require('../services/cron.service');

const router = Router();
router.use(auth);

// GET /api/email/verify — check SMTP connection
router.get('/verify', async (_req, res) => {
  const ok = await verifySmtp();
  res.json({ ok, message: ok ? 'SMTP connected' : 'SMTP not configured or failed' });
});

// POST /api/email/test — send a test email to the logged-in user
router.post('/test', async (req, res) => {
  if (req.user.sandbox) return res.status(403).json({ error: 'Not available in sandbox.' });
  const result = await sendMail({
    to: req.user.email,
    subject: '🛡️ AlertHub — SMTP Test Email',
    html: `<p>Hi ${req.user.name},</p><p>Your AlertHub SMTP is working correctly! ✅</p>`,
  });
  if (result) {
    res.json({ sent: true, messageId: result.messageId, to: req.user.email });
  } else {
    res.status(503).json({ sent: false, error: 'SMTP not configured or send failed.' });
  }
});

// POST /api/email/trigger/daily — manually fire daily digest (for testing)
router.post('/trigger/daily', async (_req, res) => {
  await runDailyDigest();
  res.json({ triggered: 'daily_digest' });
});

// POST /api/email/trigger/weekly
router.post('/trigger/weekly', async (_req, res) => {
  await runWeeklyDigest();
  res.json({ triggered: 'weekly_digest' });
});

// POST /api/email/trigger/overdue
router.post('/trigger/overdue', async (_req, res) => {
  await runOverdueAlerts();
  res.json({ triggered: 'overdue_alerts' });
});

module.exports = router;
