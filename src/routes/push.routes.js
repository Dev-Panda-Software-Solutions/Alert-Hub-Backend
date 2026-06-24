const express = require('express');
const webpush  = require('web-push');
const auth     = require('../middleware/auth');
const { sendMail } = require('../services/email.service');
const prisma   = require('../config/db');

const router = express.Router();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL   || 'mailto:admin@alerthub.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

/* In-memory store keyed by userId → Set of subscription objects.
   Persists for the lifetime of the process; restarting clears subscriptions
   (users re-subscribe on next page load). */
const subscriptions = new Map(); // userId → Set<subscription>

function addSubscription(userId, sub) {
  if (!subscriptions.has(userId)) subscriptions.set(userId, new Set());
  subscriptions.get(userId).add(JSON.stringify(sub));
}

function removeSubscription(userId, sub) {
  subscriptions.get(userId)?.delete(JSON.stringify(sub));
}

/* GET /api/push/vapid-key — public, no auth needed */
router.get('/vapid-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

/* POST /api/push/subscribe */
router.post('/subscribe', auth, (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  addSubscription(req.user.id, subscription);
  res.json({ ok: true });
});

/* DELETE /api/push/unsubscribe */
router.delete('/unsubscribe', auth, (req, res) => {
  const { subscription } = req.body;
  if (subscription) removeSubscription(req.user.id, subscription);
  res.json({ ok: true });
});

/* POST /api/push/test — sends a test push to the caller */
router.post('/test', auth, async (req, res) => {
  const userSubs = subscriptions.get(req.user.id);
  if (!userSubs || userSubs.size === 0) {
    return res.status(400).json({ error: 'No push subscription found. Enable push in the app first.' });
  }
  const payload = JSON.stringify({
    title: 'AlertHub Test Notification',
    body:  'Push notifications are working correctly!',
    url:   '/dashboard',
  });
  const results = await Promise.allSettled(
    [...userSubs].map((s) => webpush.sendNotification(JSON.parse(s), payload)),
  );
  const failed = results.filter((r) => r.status === 'rejected');
  res.json({ sent: results.length - failed.length, failed: failed.length });
});

/* POST /api/push/test-email — sends a test email to the caller */
router.post('/test-email', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { email: true, name: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await sendMail({
      to: user.email,
      subject: '✉️ AlertHub — Email Notification Test',
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;">
    <tr><td>
      <div style="background:linear-gradient(135deg,#1e40af,#4338ca);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
        <span style="font-size:36px;">🛡️</span>
        <h1 style="margin:8px 0 4px;color:#fff;font-size:20px;font-weight:700;">AlertHub</h1>
        <p style="margin:0;color:#bfdbfe;font-size:13px;">Email Notification Test</p>
      </div>
      <div style="background:#fff;padding:28px 32px;border-radius:0 0 16px 16px;">
        <p style="margin:0 0 12px;color:#1e293b;font-size:16px;">Hi <strong>${user.name}</strong>,</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          This is a test email from AlertHub. If you received this, your email notifications are working correctly! ✅
        </p>
        <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
          When a reminder is due, AlertHub will send you a similar email to <strong>${user.email}</strong>.
        </p>
        <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
          <p style="margin:0;color:#15803d;font-size:13px;font-weight:600;">✓ SMTP connection is working</p>
          <p style="margin:4px 0 0;color:#16a34a;font-size:12px;">Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      </div>
    </td></tr>
  </table>
</body></html>`,
    });

    if (result) {
      res.json({ ok: true, to: user.email, messageId: result.messageId });
    } else {
      res.status(503).json({ error: 'SMTP not configured — add SMTP_USER and SMTP_PASS to backend/.env' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Helper used by cron.service.js */
async function sendPushToUser(userId, title, body, url = '/reminders') {
  const userSubs = subscriptions.get(userId);
  if (!userSubs || !userSubs.size) return;
  const payload = JSON.stringify({ title, body, url });
  await Promise.allSettled(
    [...userSubs].map((s) => webpush.sendNotification(JSON.parse(s), payload)),
  );
}

module.exports = router;
module.exports.sendPushToUser = sendPushToUser;
