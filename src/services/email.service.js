const nodemailer = require('nodemailer');

const APP_URL  = process.env.CLIENT_URL || 'https://srv1567353.hstgr.cloud';
const APP_NAME = 'AlertHub';
const SUPPORT  = 'support@alerthub.app';
const YEAR     = new Date().getFullYear();

// ── Transport singleton ────────────────────────────────────────────────────────

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_gmail')) return null;
  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls:    { rejectUnauthorized: false },
  });
  return _transporter;
}

async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email] SMTP not configured — skipping: "${subject}" → ${to}`);
    return null;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to, subject, html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    console.log(`[Email] Sent "${subject}" → ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[Email] Failed → ${to}:`, err.message);
    return null;
  }
}

async function verifySmtp() {
  const transporter = getTransporter();
  if (!transporter) { console.log('[Email] SMTP not configured'); return false; }
  try { await transporter.verify(); console.log('[Email] SMTP verified ✓'); return true; }
  catch (err) { console.error('[Email] SMTP failed:', err.message); return false; }
}

// ── Shared layout shell ────────────────────────────────────────────────────────

function shell({ headerBg = 'linear-gradient(135deg,#1e3a8a 0%,#4338ca 100%)', headerContent, body, footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

        <!-- Logo bar -->
        <tr><td style="padding-bottom:20px;text-align:center;">
          <span style="display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#64748b;letter-spacing:.06em;text-transform:uppercase;">
            &#9632;&nbsp;${APP_NAME}
          </span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07),0 1px 4px rgba(0,0,0,.04);">

          <!-- Header -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:${headerBg};padding:36px 40px;text-align:center;">
              ${headerContent}
            </td></tr>
          </table>

          <!-- Body -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:36px 40px;">
              ${body}
            </td></tr>
          </table>

          <!-- Divider -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;line-height:1.6;">
                ${footerNote || `You are receiving this email because you have an ${APP_NAME} account.`}
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                Need help? <a href="mailto:${SUPPORT}" style="color:#6366f1;text-decoration:none;">${SUPPORT}</a>
                &nbsp;&bull;&nbsp;
                <a href="${APP_URL}/profile" style="color:#6366f1;text-decoration:none;">Notification settings</a>
              </p>
            </td></tr>
          </table>

        </td></tr>

        <!-- Brand footer -->
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#94a3b8;">
            &copy; ${YEAR} ${APP_NAME} &mdash; Smart Payment &amp; Reminder Management<br />
            <a href="${APP_URL}" style="color:#94a3b8;text-decoration:none;">${APP_URL.replace(/https?:\/\//, '')}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Helper: badge pill ─────────────────────────────────────────────────────────

function badge(text, bg = '#ede9fe', color = '#5b21b6') {
  return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${bg};color:${color};font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">${text}</span>`;
}

// ── Helper: CTA button ─────────────────────────────────────────────────────────

function cta(label, url, bg = '#4f46e5') {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
      <tr><td align="center" style="border-radius:10px;background:${bg};">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:.01em;">
          ${label} &rarr;
        </a>
      </td></tr>
    </table>`;
}

// ── Helper: module colour ──────────────────────────────────────────────────────

function moduleColor(mod) {
  return mod === 'BUSINESS' ? '#f59e0b' : mod === 'FAMILY' ? '#8b5cf6' : '#10b981';
}

// ── 1. Welcome email ──────────────────────────────────────────────────────────

function buildWelcomeEmail({ userName, email }) {
  return shell({
    headerContent: `
      <div style="width:56px;height:56px;background:rgba(255,255,255,.15);border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;line-height:1;">&#128737;</span>
      </div>
      <h1 style="margin:0 0 6px;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-.3px;">Welcome to ${APP_NAME}</h1>
      <p style="margin:0;color:#c7d2fe;font-size:14px;">Your account is ready. Let&rsquo;s get started.</p>`,
    body: `
      <p style="margin:0 0 20px;font-size:16px;color:#1e293b;font-weight:600;">Hi ${userName},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">
        Thank you for joining ${APP_NAME}. You now have a powerful tool to track every payment,
        bill, EMI, and financial obligation across your Business, Family, and Finance life — all in one place.
      </p>

      <!-- Feature list -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${[
          ['&#128197;', 'Smart Reminders', 'GST, EMIs, rent, subscriptions — never miss a due date again.'],
          ['&#127775;', 'AI Insights', 'Automatic cash flow analysis and spending alerts every week.'],
          ['&#128276;', 'Multi-Channel Alerts', 'Get notified via push, email, WhatsApp, and SMS.'],
          ['&#128198;', 'Calendar View', 'See all your payments at a glance on a colour-coded calendar.'],
        ].map(([icon, title, desc]) => `
          <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:36px;font-size:20px;vertical-align:top;padding-top:2px;">${icon}</td>
              <td style="padding-left:10px;">
                <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1e293b;">${title}</p>
                <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">${desc}</p>
              </td>
            </tr></table>
          </td></tr>`).join('')}
      </table>

      ${cta('Go to my Dashboard', `${APP_URL}/dashboard`)}

      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
        Signed in as <strong style="color:#64748b;">${email}</strong>
      </p>`,
    footerNote: `You are receiving this because you created an ${APP_NAME} account.`,
  });
}

// ── 2. Login security alert ────────────────────────────────────────────────────

function buildLoginAlertEmail({ userName, email, time, ip = 'Unknown', device = 'Web browser' }) {
  const timeStr = time
    ? new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });

  return shell({
    headerBg: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)',
    headerContent: `
      <div style="width:56px;height:56px;background:rgba(99,102,241,.2);border-radius:14px;margin:0 auto 16px;line-height:56px;text-align:center;">
        <span style="font-size:26px;">&#128274;</span>
      </div>
      <h1 style="margin:0 0 6px;color:#ffffff;font-size:22px;font-weight:800;">New Sign-In Detected</h1>
      <p style="margin:0;color:#94a3b8;font-size:13px;">Security notification for your ${APP_NAME} account</p>`,
    body: `
      <p style="margin:0 0 20px;font-size:16px;color:#1e293b;font-weight:600;">Hi ${userName},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">
        We detected a successful sign-in to your ${APP_NAME} account. If this was you, no action is needed.
        If you did not sign in, please secure your account immediately.
      </p>

      <!-- Details box -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:.08em;text-transform:uppercase;">Sign-In Details</p>
          ${[
            ['Account', email],
            ['Time', timeStr + ' IST'],
            ['Device', device],
            ['IP Address', ip],
          ].map(([label, val]) => `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
              <tr>
                <td style="width:120px;font-size:12px;color:#64748b;font-weight:600;">${label}</td>
                <td style="font-size:13px;color:#1e293b;font-weight:500;">${val}</td>
              </tr>
            </table>`).join('')}
        </td></tr>
      </table>

      <!-- If not you -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:8px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#c2410c;">&#9888; Wasn&rsquo;t you?</p>
          <p style="margin:0;font-size:12px;color:#9a3412;line-height:1.6;">
            Change your password immediately and contact us at
            <a href="mailto:${SUPPORT}" style="color:#c2410c;">${SUPPORT}</a>.
          </p>
        </td></tr>
      </table>

      ${cta('Review Account Security', `${APP_URL}/profile`, '#0f172a')}`,
    footerNote: `Security alerts are always sent for every sign-in to your ${APP_NAME} account.`,
  });
}

// ── 3. Reminder digest (daily / weekly / monthly / 3-day advance) ─────────────

function buildReminderEmail({ userName, reminders, period }) {
  const today = new Date().toISOString().split('T')[0];
  const total = reminders.reduce((s, r) => s + r.amount, 0);

  const periodMeta = {
    'Daily':          { label: "Today's Payments",      icon: '&#128197;', accent: '#4f46e5' },
    'Weekly':         { label: 'This Week\'s Payments', icon: '&#128200;', accent: '#0891b2' },
    'Monthly':        { label: 'This Month\'s Payments',icon: '&#128184;', accent: '#059669' },
    '3-Day Advance':  { label: 'Due in 3 Days',         icon: '&#9200;',  accent: '#d97706' },
  }[period] || { label: `${period} Payment Digest`, icon: '&#128276;', accent: '#4f46e5' };

  const rows = reminders.map((r) => {
    const isOverdue = r.dueDate < today;
    const mc = moduleColor(r.module);
    return `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${mc};margin-right:8px;vertical-align:middle;"></span>
          <span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span><br/>
          <span style="font-size:11px;color:#94a3b8;margin-left:14px;">${r.module} &bull; ${r.category}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:right;white-space:nowrap;vertical-align:top;">
          <span style="font-size:14px;font-weight:700;color:#1e293b;">&#8377;${Math.round(r.amount).toLocaleString('en-IN')}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:center;white-space:nowrap;vertical-align:top;">
          <span style="font-size:12px;font-weight:600;color:${isOverdue ? '#dc2626' : '#475569'};${isOverdue ? 'background:#fef2f2;padding:2px 8px;border-radius:999px;' : ''}">
            ${r.dueDate}${isOverdue ? ' &#9888;' : ''}
          </span>
        </td>
      </tr>`;
  }).join('');

  return shell({
    headerBg: `linear-gradient(135deg,${periodMeta.accent} 0%,${periodMeta.accent}cc 100%)`,
    headerContent: `
      <p style="margin:0 0 10px;font-size:28px;">${periodMeta.icon}</p>
      <h1 style="margin:0 0 6px;color:#ffffff;font-size:22px;font-weight:800;">${periodMeta.label}</h1>
      <p style="margin:0;color:rgba(255,255,255,.75);font-size:13px;">${reminders.length} reminder${reminders.length !== 1 ? 's' : ''} need your attention</p>`,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#1e293b;font-weight:600;">Hi ${userName},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">
        Here is your <strong>${period.toLowerCase()} payment summary</strong>. Please review and ensure all payments are made on time to avoid late fees and penalties.
      </p>

      <!-- Table -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:20px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748b;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Reminder</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;color:#64748b;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Amount</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;color:#64748b;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Due Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#f8fafc;">
            <td colspan="2" style="padding:14px 16px;font-size:13px;font-weight:700;color:#1e293b;">Total Due</td>
            <td style="padding:14px 16px;text-align:right;font-size:15px;font-weight:800;color:${periodMeta.accent};">&#8377;${Math.round(total).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Module legend -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        <tr>
          ${['BUSINESS','FAMILY','FINANCE'].map((m) =>
            `<td style="padding-right:16px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${moduleColor(m)};margin-right:5px;vertical-align:middle;"></span>
              <span style="font-size:11px;color:#64748b;">${m}</span>
            </td>`
          ).join('')}
        </tr>
      </table>

      ${cta('View All Reminders', `${APP_URL}/reminders`, periodMeta.accent)}`,
  });
}

// ── 4. Overdue alert ──────────────────────────────────────────────────────────

function buildOverdueEmail({ userName, reminders }) {
  const rows = reminders.map((r) => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #fef2f2;vertical-align:top;">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${moduleColor(r.module)};margin-right:8px;vertical-align:middle;"></span>
        <span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span><br/>
        <span style="font-size:11px;color:#94a3b8;margin-left:14px;">${r.module} &bull; ${r.category}</span>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid #fef2f2;text-align:right;white-space:nowrap;vertical-align:top;">
        <span style="font-size:14px;font-weight:700;color:#dc2626;">&#8377;${Math.round(r.amount).toLocaleString('en-IN')}</span>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid #fef2f2;text-align:center;white-space:nowrap;vertical-align:top;">
        <span style="font-size:11px;font-weight:700;color:#dc2626;background:#fef2f2;padding:3px 8px;border-radius:999px;">
          ${r.dueDate} &#9888;
        </span>
      </td>
    </tr>`).join('');

  const totalOverdue = reminders.reduce((s, r) => s + r.amount, 0);

  return shell({
    headerBg: 'linear-gradient(135deg,#991b1b 0%,#dc2626 100%)',
    headerContent: `
      <p style="margin:0 0 10px;font-size:32px;">&#9888;&#65039;</p>
      <h1 style="margin:0 0 6px;color:#ffffff;font-size:22px;font-weight:800;">Overdue Payment Alert</h1>
      <p style="margin:0;color:rgba(255,255,255,.8);font-size:13px;">
        ${reminders.length} payment${reminders.length !== 1 ? 's' : ''} &bull;
        &#8377;${Math.round(totalOverdue).toLocaleString('en-IN')} total overdue
      </p>`,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#1e293b;font-weight:600;">Hi ${userName},</p>

      <!-- Alert banner -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:24px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#991b1b;">Immediate action required</p>
          <p style="margin:0;font-size:13px;color:#b91c1c;line-height:1.6;">
            You have <strong>${reminders.length} overdue payment${reminders.length !== 1 ? 's' : ''}</strong> that have passed their due date.
            Delayed payments may attract late fees, interest penalties, or service interruption.
          </p>
        </td></tr>
      </table>

      <!-- Table -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #fecaca;border-radius:12px;overflow:hidden;margin-bottom:8px;">
        <thead>
          <tr style="background:#fef2f2;">
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#b91c1c;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Payment</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;color:#b91c1c;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Amount</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;color:#b91c1c;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Was Due</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#fef2f2;">
            <td colspan="2" style="padding:14px 16px;font-size:13px;font-weight:700;color:#991b1b;">Total Overdue</td>
            <td style="padding:14px 16px;text-align:right;font-size:15px;font-weight:800;color:#dc2626;">&#8377;${Math.round(totalOverdue).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>

      ${cta('Clear Overdue Reminders', `${APP_URL}/reminders`, '#dc2626')}`,
    footerNote: `Overdue alerts are sent daily until all payments are marked complete in ${APP_NAME}.`,
  });
}

// ── 5. Test email ─────────────────────────────────────────────────────────────

function buildTestEmail({ userName, email }) {
  const sentAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
  return shell({
    headerBg: 'linear-gradient(135deg,#065f46 0%,#059669 100%)',
    headerContent: `
      <p style="margin:0 0 10px;font-size:32px;">&#9989;</p>
      <h1 style="margin:0 0 6px;color:#ffffff;font-size:22px;font-weight:800;">Email Delivery Confirmed</h1>
      <p style="margin:0;color:rgba(255,255,255,.8);font-size:13px;">Your ${APP_NAME} email notifications are working</p>`,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#1e293b;font-weight:600;">Hi ${userName},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">
        This is a test email sent from your ${APP_NAME} account settings. Since you are reading this,
        email notifications are set up correctly and will be delivered to your inbox.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:8px;">
        <tr><td style="padding:20px 24px;">
          ${[
            ['Status', '&#9989; Delivered successfully'],
            ['Delivered to', email],
            ['Sent at', sentAt + ' IST'],
            ['SMTP', 'Gmail (verified)'],
          ].map(([label, val]) => `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
              <tr>
                <td style="width:120px;font-size:12px;color:#166534;font-weight:700;">${label}</td>
                <td style="font-size:13px;color:#14532d;">${val}</td>
              </tr>
            </table>`).join('')}
        </td></tr>
      </table>

      <p style="margin:20px 0 0;font-size:13px;color:#475569;line-height:1.75;">
        You will receive emails like this for:
        <strong style="color:#1e293b;">daily payment reminders</strong>,
        <strong style="color:#1e293b;">weekly digests</strong>,
        <strong style="color:#1e293b;">monthly summaries</strong>, and
        <strong style="color:#1e293b;">overdue alerts</strong>.
      </p>

      ${cta('Go to Dashboard', `${APP_URL}/dashboard`, '#059669')}`,
    footerNote: `Test email triggered manually from your ${APP_NAME} Profile page.`,
  });
}

// ── Named send functions ──────────────────────────────────────────────────────

async function sendWelcomeEmail(user) {
  return sendMail({
    to: user.email,
    subject: `Welcome to ${APP_NAME} — Your account is ready`,
    html: buildWelcomeEmail({ userName: user.name, email: user.email }),
  });
}

async function sendLoginAlertEmail(user, meta = {}) {
  return sendMail({
    to: user.email,
    subject: `${APP_NAME}: New sign-in to your account`,
    html: buildLoginAlertEmail({ userName: user.name, email: user.email, ...meta }),
  });
}

async function sendReminderDigest(user, reminders, period = 'Weekly') {
  if (!reminders.length) return null;
  const periodLabel = { Daily: 'Today', Weekly: 'This Week', Monthly: 'This Month', '3-Day Advance': 'In 3 Days' }[period] || period;
  return sendMail({
    to: user.email,
    subject: `${APP_NAME}: ${reminders.length} payment${reminders.length !== 1 ? 's' : ''} due ${periodLabel} — ₹${Math.round(reminders.reduce((s, r) => s + r.amount, 0)).toLocaleString('en-IN')}`,
    html: buildReminderEmail({ userName: user.name, reminders, period }),
  });
}

async function sendOverdueAlert(user, reminders) {
  if (!reminders.length) return null;
  return sendMail({
    to: user.email,
    subject: `${APP_NAME}: Action Required — ${reminders.length} overdue payment${reminders.length !== 1 ? 's' : ''}`,
    html: buildOverdueEmail({ userName: user.name, reminders }),
  });
}

async function sendTestEmail(user) {
  return sendMail({
    to: user.email,
    subject: `${APP_NAME}: Email delivery test — confirmed`,
    html: buildTestEmail({ userName: user.name, email: user.email }),
  });
}

module.exports = {
  verifySmtp,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendReminderDigest,
  sendOverdueAlert,
  sendTestEmail,
  sendMail,
};
