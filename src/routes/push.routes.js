const express = require('express');
const webpush  = require('web-push');
const auth     = require('../middleware/auth');
const { sendTestEmail } = require('../services/email.service');
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
    title: 'AlertHub — Push Notifications Active',
    body:  'Your real-time alerts are set up. You will be notified for due payments even when this tab is closed.',
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
    const result = await sendTestEmail(user);
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
