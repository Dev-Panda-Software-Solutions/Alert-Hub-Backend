const nodemailer = require('nodemailer');

// ── Transport singleton ────────────────────────────────────────────────────────

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  // Only create if SMTP credentials are configured
  if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_gmail')) {
    return null;
  }

  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  return _transporter;
}

// ── Base send helper ──────────────────────────────────────────────────────────

async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email] SMTP not configured — skipping email to ${to}: "${subject}"`);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from:    process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
    return null;
  }
}

// ── Verify SMTP connection ────────────────────────────────────────────────────

async function verifySmtp() {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[Email] SMTP not configured — email sending disabled');
    return false;
  }
  try {
    await transporter.verify();
    console.log('[Email] SMTP connection verified ✓');
    return true;
  } catch (err) {
    console.error('[Email] SMTP verification failed:', err.message);
    return false;
  }
}

// ── Email templates ───────────────────────────────────────────────────────────

function buildReminderEmail({ userName, reminders, period }) {
  const rows = reminders.map((r) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
        <strong style="color:#1e293b;">${r.title}</strong><br>
        <span style="font-size:12px;color:#64748b;">${r.module} · ${r.category}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap;">
        <strong style="color:#0f172a;">₹${Math.round(r.amount).toLocaleString('en-IN')}</strong>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">
        <span style="font-size:12px;color:${r.dueDate < new Date().toISOString().split('T')[0] ? '#ef4444' : '#64748b'};">
          ${r.dueDate}
        </span>
      </td>
    </tr>
  `).join('');

  const total = reminders.reduce((s, r) => s + r.amount, 0);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:32px auto;">
    <tr><td>
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1e40af,#4338ca);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
        <span style="font-size:36px;">🛡️</span>
        <h1 style="margin:8px 0 4px;color:#fff;font-size:22px;font-weight:700;">AlertHub</h1>
        <p style="margin:0;color:#bfdbfe;font-size:14px;">${period} Payment Reminder</p>
      </div>

      <!-- Body -->
      <div style="background:#fff;padding:28px 32px;">
        <p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hi <strong>${userName}</strong>,</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          Here are your upcoming payments for the <strong>${period.toLowerCase()}</strong>.
          Stay on top of your finances and avoid late fees! 💡
        </p>

        <!-- Reminders Table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:20px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Reminder</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Amount</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Due Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr style="background:#f8fafc;">
              <td colspan="2" style="padding:12px;font-weight:700;color:#1e293b;">Total Due</td>
              <td style="padding:12px;text-align:right;font-weight:700;color:#1d4ed8;">₹${Math.round(total).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align:center;margin:24px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/dashboard"
             style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">
            View Dashboard →
          </a>
        </div>

        <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
          You're receiving this because you have email notifications enabled in AlertHub.<br>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/pricing" style="color:#64748b;">Manage your plan</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">AlertHub · Smart Payment &amp; Reminder Management · &copy; 2026</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildWelcomeEmail({ userName, email }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
    <tr><td>
      <div style="background:linear-gradient(135deg,#1e40af,#4338ca);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
        <span style="font-size:48px;">🛡️</span>
        <h1 style="margin:8px 0 0;color:#fff;font-size:24px;">Welcome to AlertHub!</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
        <p style="color:#1e293b;font-size:16px;">Hi <strong>${userName}</strong>,</p>
        <p style="color:#475569;line-height:1.7;">
          You're now part of AlertHub — the smart payment &amp; reminder management platform
          that keeps your Business, Family, and Finance obligations under control.
        </p>
        <ul style="color:#475569;line-height:2;padding-left:20px;">
          <li>✅ Set reminders for GST, EMIs, bills, subscriptions &amp; more</li>
          <li>✅ Get notified via Push, Email, WhatsApp &amp; SMS</li>
          <li>✅ AI Insights analyses your cash flow automatically</li>
          <li>✅ Calendar view shows all payments at a glance</li>
        </ul>
        <div style="text-align:center;margin:28px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/dashboard"
             style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
            Go to Dashboard →
          </a>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;">Account: ${email}</p>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildOverdueEmail({ userName, reminders }) {
  const rows = reminders.map((r) => `
    <li style="margin-bottom:8px;padding:10px;background:#fff5f5;border-left:3px solid #ef4444;border-radius:0 6px 6px 0;color:#1e293b;">
      <strong>${r.title}</strong> — ₹${Math.round(r.amount).toLocaleString('en-IN')}
      <span style="color:#ef4444;font-size:12px;">(was due ${r.dueDate})</span>
    </li>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
    <tr><td style="background:#fff;border-radius:16px;overflow:hidden;">
      <div style="background:#ef4444;padding:24px 32px;text-align:center;">
        <span style="font-size:36px;">⚠️</span>
        <h1 style="margin:8px 0 0;color:#fff;font-size:20px;">Overdue Payment Alert</h1>
      </div>
      <div style="padding:28px 32px;">
        <p style="color:#1e293b;">Hi <strong>${userName}</strong>,</p>
        <p style="color:#475569;">You have <strong>${reminders.length} overdue payment(s)</strong> that need your attention:</p>
        <ul style="list-style:none;padding:0;margin:0 0 20px;">${rows}</ul>
        <div style="text-align:center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/reminders"
             style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;">
            Review Overdue Reminders →
          </a>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Named send functions ──────────────────────────────────────────────────────

async function sendWelcomeEmail(user) {
  return sendMail({
    to: user.email,
    subject: '🛡️ Welcome to AlertHub — Your smart payment reminder',
    html: buildWelcomeEmail({ userName: user.name, email: user.email }),
  });
}

async function sendReminderDigest(user, reminders, period = 'Weekly') {
  if (!reminders.length) return null;
  return sendMail({
    to: user.email,
    subject: `🔔 AlertHub: Your ${period} Payment Digest — ${reminders.length} reminder(s) due`,
    html: buildReminderEmail({ userName: user.name, reminders, period }),
  });
}

async function sendOverdueAlert(user, reminders) {
  if (!reminders.length) return null;
  return sendMail({
    to: user.email,
    subject: `⚠️ AlertHub: ${reminders.length} Overdue Payment(s) Need Your Attention`,
    html: buildOverdueEmail({ userName: user.name, reminders }),
  });
}

module.exports = {
  verifySmtp,
  sendWelcomeEmail,
  sendReminderDigest,
  sendOverdueAlert,
  sendMail,
};
