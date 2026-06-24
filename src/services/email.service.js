const nodemailer = require('nodemailer');

const APP_URL  = process.env.CLIENT_URL || 'https://srv1567353.hstgr.cloud';
const APP_NAME = 'AlertHub';
const SUPPORT  = 'support@alerthub.app';
const YEAR     = new Date().getFullYear();

// ── Utilities ─────────────────────────────────────────────────────────────────

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function fmtINR(n) { return '&#8377;' + Math.round(n).toLocaleString('en-IN'); }

function moduleColor(mod) {
  return mod === 'BUSINESS' ? '#f59e0b' : mod === 'FAMILY' ? '#8b5cf6' : '#10b981';
}

function cta(label, url, bg = '#4f46e5', color = '#fff') {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr><td align="center" style="border-radius:10px;background:${bg};">
      <a href="${url}" target="_blank"
         style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:700;color:${color};text-decoration:none;border-radius:10px;letter-spacing:.01em;">
        ${label} &rarr;
      </a>
    </td></tr>
  </table>`;
}

function footer(note) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;line-height:1.7;">
        ${note || `You are receiving this email because you have an ${APP_NAME} account.`}
      </p>
      <p style="margin:0;font-size:12px;color:#cbd5e1;">
        Questions? <a href="mailto:${SUPPORT}" style="color:#6366f1;text-decoration:none;">${SUPPORT}</a>
        &nbsp;&bull;&nbsp;
        <a href="${APP_URL}/profile" style="color:#6366f1;text-decoration:none;">Notification settings</a>
      </p>
    </td></tr>
  </table>`;
}

function brandFooter() {
  return `<p style="margin:20px 0 0;text-align:center;font-size:11px;color:#94a3b8;">
    &copy; ${YEAR} ${APP_NAME} &mdash; Smart Payment &amp; Reminder Management
  </p>`;
}

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

// ══════════════════════════════════════════════════════════════════════════════
// WELCOME EMAILS  (4 variants)
// ══════════════════════════════════════════════════════════════════════════════

const welcomeVariants = [

  // Variant 1 — Deep indigo, feature showcase
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="padding-bottom:18px;text-align:center;font-size:12px;font-weight:700;color:#64748b;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Account Activation</td></tr>
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);padding:48px 40px;text-align:center;">
    <div style="width:72px;height:72px;background:rgba(255,255,255,.12);border-radius:18px;margin:0 auto 20px;line-height:72px;text-align:center;font-size:34px;">&#128737;</div>
    <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;letter-spacing:-.5px;">Welcome, ${userName}!</h1>
    <p style="margin:0;color:#a5b4fc;font-size:15px;">Your ${APP_NAME} account is ready to use.</p>
  </div>
  <div style="padding:40px;">
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      You now have a powerful tool to track every EMI, bill, subscription, tax, and financial obligation —
      across your <strong>Business</strong>, <strong>Family</strong>, and <strong>Finance</strong> life — all in one dashboard.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      ${[
        ['#ede9fe','#5b21b6','&#128197;','Reminders','Never miss a due date — GST, EMIs, rent, insurance, and more.'],
        ['#ecfdf5','#065f46','&#127775;','AI Insights','Weekly cash flow analysis and automated spending alerts.'],
        ['#eff6ff','#1e40af','&#128276;','Multi-Channel','Push, Email, WhatsApp & SMS notifications on every plan.'],
        ['#fff7ed','#92400e','&#128198;','Calendar','All payments colour-coded by module on a visual calendar.'],
      ].map(([bg,col,icon,title,desc]) => `
      <tr><td style="padding:10px 0;border-bottom:1px solid #f8fafc;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:${bg};border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;">${icon}</td>
          <td style="padding-left:14px;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:${col};">${title}</p>
            <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">${desc}</p>
          </td>
        </tr></table>
      </td></tr>`).join('')}
    </table>
    ${cta('Open My Dashboard', `${APP_URL}/dashboard`, '#4338ca')}
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">Account registered to <strong style="color:#64748b;">${email}</strong></p>
  </div>
  ${footer(`You are receiving this because you created an ${APP_NAME} account with this email address.`)}
</td></tr>
${brandFooter()}
</table></td></tr></table>
</body></html>`,

  // Variant 2 — Emerald celebration / "you're in" style
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="padding-bottom:18px;text-align:center;font-size:12px;font-weight:700;color:#16a34a;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; You&rsquo;re In!</td></tr>
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(5,150,105,.1);">
  <div style="background:linear-gradient(135deg,#064e3b 0%,#065f46 40%,#059669 100%);padding:52px 40px;text-align:center;">
    <p style="margin:0 0 12px;font-size:52px;line-height:1;">&#127881;</p>
    <h1 style="margin:0 0 8px;color:#fff;font-size:30px;font-weight:800;">You&rsquo;re all set, ${userName}!</h1>
    <p style="margin:0;color:#6ee7b7;font-size:14px;">Welcome to smarter financial management.</p>
  </div>
  <div style="padding:40px;">
    <div style="background:#f0fdf4;border-left:4px solid #10b981;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;font-size:14px;color:#065f46;line-height:1.7;">
        <strong>${APP_NAME}</strong> keeps your Business, Family, and Finance payment obligations in perfect order —
        so you never pay a late fee again.
      </p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;font-weight:700;color:#1e293b;">Here&rsquo;s what you can do right now:</p>
    ${[
      ['&#10003;','Add your first reminder','Go to Reminders and add an EMI, bill, or subscription.'],
      ['&#10003;','Set up push notifications','Visit Profile to enable real-time browser alerts.'],
      ['&#10003;','Explore AI Insights','The AI analyses your cash flow and flags risks weekly.'],
      ['&#10003;','Check your Calendar','See all payments colour-coded at a glance.'],
    ].map(([icon,title,desc]) => `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
      <td style="width:28px;height:28px;background:#d1fae5;border-radius:50%;text-align:center;vertical-align:middle;font-size:13px;font-weight:900;color:#059669;">${icon}</td>
      <td style="padding-left:12px;">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1e293b;">${title}</p>
        <p style="margin:0;font-size:12px;color:#64748b;">${desc}</p>
      </td>
    </tr></table>`).join('')}
    ${cta('Get Started Now', `${APP_URL}/dashboard`, '#059669')}
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">${email}</p>
  </div>
  ${footer()}
</td></tr>
${brandFooter()}
</table></td></tr></table>
</body></html>`,

  // Variant 3 — Dark minimal / premium
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#0f172a;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding-bottom:20px;text-align:center;font-size:12px;font-weight:700;color:#475569;letter-spacing:.1em;text-transform:uppercase;">${APP_NAME}</td></tr>
<tr><td style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid #334155;">
  <div style="padding:48px 40px;border-bottom:1px solid #334155;">
    <p style="margin:0 0 24px;font-size:13px;font-weight:600;color:#6366f1;letter-spacing:.06em;text-transform:uppercase;">Account Confirmed</p>
    <h1 style="margin:0 0 16px;color:#f8fafc;font-size:32px;font-weight:800;line-height:1.2;">Welcome to<br/>${APP_NAME}, ${userName}.</h1>
    <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.75;">
      Your account is live. You now have access to intelligent reminder management,
      AI-powered cash flow insights, and multi-channel payment alerts.
    </p>
  </div>
  <div style="padding:32px 40px;">
    ${[
      ['Business','GST, vendor payments, TDS, business subscriptions'],
      ['Family','Rent, electricity, school fees, insurance, household bills'],
      ['Finance','EMIs, SIPs, credit cards, loan repayments, investments'],
    ].map(([mod,desc]) => `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%;"><tr>
      <td style="width:6px;background:${moduleColor(mod.toUpperCase())};border-radius:3px;">&nbsp;</td>
      <td style="padding-left:16px;">
        <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#e2e8f0;">${mod} Module</p>
        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">${desc}</p>
      </td>
    </tr></table>`).join('')}
    ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#6366f1')}
    <p style="margin:24px 0 0;font-size:11px;color:#475569;text-align:center;">${email}</p>
  </div>
  <div style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
    <p style="margin:0;font-size:11px;color:#475569;">Need help? <a href="mailto:${SUPPORT}" style="color:#6366f1;text-decoration:none;">${SUPPORT}</a></p>
  </div>
</td></tr>
<tr><td style="padding-top:20px;text-align:center;font-size:11px;color:#334155;">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table>
</body></html>`,

  // Variant 4 — Warm amber, personal/human tone
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fffbeb;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(245,158,11,.12);border:1px solid #fde68a;">
  <div style="background:linear-gradient(135deg,#78350f 0%,#b45309 50%,#d97706 100%);padding:48px 40px;">
    <p style="margin:0 0 16px;font-size:42px;line-height:1;">&#128075;</p>
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:800;">Hi ${userName}, great to have you!</h1>
    <p style="margin:0;color:#fde68a;font-size:14px;line-height:1.6;">
      Financial stress often comes from forgetting. ${APP_NAME} makes sure you never forget anything that matters.
    </p>
  </div>
  <div style="padding:40px;">
    <p style="margin:0 0 24px;font-size:15px;color:#44403c;line-height:1.75;">
      Whether it&rsquo;s a GST filing, an EMI, a school fee, or a credit card bill — add it once and
      we&rsquo;ll remind you across <strong>Push, Email, WhatsApp, and SMS</strong> so it never slips through the cracks.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;margin-bottom:28px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#92400e;letter-spacing:.06em;text-transform:uppercase;">Your account at a glance</p>
        ${[['Plan','FREE (upgrade anytime)'],['Reminders','Up to 30 — Business, Family, Finance'],['Notifications','Push alerts enabled'],['AI Insights','Cash flow analysis, overdue detection']].map(([k,v])=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;"><tr>
          <td style="font-size:12px;color:#78350f;font-weight:600;width:130px;">${k}</td>
          <td style="font-size:12px;color:#44403c;">${v}</td>
        </tr></table>`).join('')}
      </td></tr>
    </table>
    ${cta('Start Adding Reminders', `${APP_URL}/reminders`, '#d97706')}
    <p style="margin:24px 0 0;font-size:12px;color:#a8a29e;text-align:center;">${email}</p>
  </div>
  ${footer()}
</td></tr>
${brandFooter()}
</table></td></tr></table>
</body></html>`,
];

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN SECURITY ALERT  (3 variants)
// ══════════════════════════════════════════════════════════════════════════════

const loginAlertVariants = [

  // Variant 1 — Dark security, detailed
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#0f172a;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid #1e3a5f;">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:40px;text-align:center;border-bottom:1px solid #1e3a5f;">
    <div style="width:64px;height:64px;background:rgba(99,102,241,.15);border-radius:50%;margin:0 auto 16px;line-height:64px;font-size:28px;">&#128274;</div>
    <h1 style="margin:0 0 6px;color:#f1f5f9;font-size:22px;font-weight:800;">New Sign-In Detected</h1>
    <p style="margin:0;color:#64748b;font-size:13px;">Security notification for your ${APP_NAME} account</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 20px;font-size:15px;color:#e2e8f0;">Hi <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.75;">
      A successful sign-in was recorded for your ${APP_NAME} account. If this was you, no action is required.
      If you did not sign in, please change your password immediately.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #334155;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#475569;letter-spacing:.08em;text-transform:uppercase;">Sign-In Details</p>
        ${[['Account',email],['Time',t+' IST'],['Device',device||'Web browser'],['IP Address',ip||'Unknown']].map(([l,v])=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
          <td style="width:110px;font-size:12px;color:#475569;font-weight:600;">${l}</td>
          <td style="font-size:13px;color:#e2e8f0;">${v}</td>
        </tr></table>`).join('')}
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#431407;border:1px solid #7c2d12;border-radius:12px;margin-bottom:8px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#fca5a5;">&#9888; Not you?</p>
        <p style="margin:0;font-size:12px;color:#fca5a5;line-height:1.6;">Change your password immediately and contact <a href="mailto:${SUPPORT}" style="color:#f87171;">${SUPPORT}</a></p>
      </td></tr>
    </table>
    ${cta('Secure My Account', `${APP_URL}/profile`, '#6366f1')}
  </div>
  <div style="padding:20px 40px;border-top:1px solid #1e3a5f;text-align:center;">
    <p style="margin:0;font-size:11px;color:#334155;">Security alerts are sent for every sign-in to ${APP_NAME}</p>
  </div>
</td></tr>
<tr><td style="padding-top:18px;text-align:center;font-size:11px;color:#1e3a5f;">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table>
</body></html>`;
  },

  // Variant 2 — Light professional with shield
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="height:5px;background:linear-gradient(90deg,#4f46e5,#7c3aed,#ec4899);"></div>
  <div style="padding:36px 40px 0;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:48px;height:48px;background:#ede9fe;border-radius:12px;text-align:center;vertical-align:middle;font-size:22px;">&#128737;</td>
      <td style="padding-left:14px;">
        <p style="margin:0;font-size:18px;font-weight:800;color:#1e293b;">Sign-In Notification</p>
        <p style="margin:0;font-size:12px;color:#64748b;">${APP_NAME} Security Alert</p>
      </td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong style="color:#1e293b;">${userName}</strong>, we noticed a new sign-in to your ${APP_NAME} account on <strong>${t} IST</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:20px;">
        ${[['Email',email],['IP',ip||'Unknown'],['Device',device||'Web browser']].map(([l,v])=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
          <td style="width:80px;font-size:12px;color:#64748b;font-weight:700;">${l}</td>
          <td style="font-size:13px;color:#1e293b;font-weight:500;">${v}</td>
        </tr></table>`).join('')}
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin-bottom:8px;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#c2410c;"><strong>&#9888; Wasn&rsquo;t you?</strong> Change your password and contact <a href="mailto:${SUPPORT}" style="color:#c2410c;">${SUPPORT}</a></p>
      </td></tr>
    </table>
    ${cta('Review Account', `${APP_URL}/profile`, '#4f46e5')}
  </div>
  ${footer('Security alerts are sent for every successful sign-in to your account.')}
</td></tr>
${brandFooter()}
</table></td></tr></table>
</body></html>`;
  },

  // Variant 3 — Minimal, single-focus action
  ({ userName, email, time, ip }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'medium'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#fafafa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="text-align:center;padding-bottom:24px;font-size:20px;font-weight:800;color:#1e293b;letter-spacing:-.3px;">${APP_NAME}</td></tr>
<tr><td style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,.06);">
  <p style="margin:0 0 8px;font-size:28px;">&#128274;</p>
  <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#1e293b;">Sign-in to your account</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
    Hi ${userName}, your ${APP_NAME} account was accessed on <strong style="color:#1e293b;">${t} IST</strong> from IP <strong style="color:#1e293b;">${ip||'Unknown'}</strong>.
    <br/><br/>
    If this was you, no action is needed.
  </p>
  <div style="border-top:1px dashed #e2e8f0;margin:24px 0;"></div>
  <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#dc2626;">If this wasn&rsquo;t you:</p>
  <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.7;">
    1. <a href="${APP_URL}/profile" style="color:#4f46e5;font-weight:600;">Change your password immediately</a><br/>
    2. Contact us at <a href="mailto:${SUPPORT}" style="color:#4f46e5;">${SUPPORT}</a>
  </p>
  <p style="margin:0;font-size:11px;color:#94a3b8;">${email}</p>
</td></tr>
${brandFooter()}
</table></td></tr></table>
</body></html>`;
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// REMINDER DIGEST  (5 variants)
// ══════════════════════════════════════════════════════════════════════════════

const reminderVariants = [

  // Variant 1 — Classic table, coloured header by period
  ({ userName, reminders, period }) => {
    const today = new Date().toISOString().split('T')[0];
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const palette = { Daily:['#1e3a8a','#3b82f6'], Weekly:['#064e3b','#10b981'], Monthly:['#312e81','#8b5cf6'], '3-Day Advance':['#78350f','#f59e0b'] };
    const [dark,light] = palette[period]||['#1e3a8a','#3b82f6'];
    const periodLabel = { Daily:"Today's",Weekly:"This Week's",Monthly:"This Month's",'3-Day Advance':"Upcoming in 3 Days" }[period]||period;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="background:linear-gradient(135deg,${dark} 0%,${light} 100%);padding:36px 40px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:rgba(255,255,255,.6);letter-spacing:.1em;text-transform:uppercase;">${APP_NAME} &bull; ${period} Digest</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:24px;font-weight:800;">${periodLabel} Payments</h1>
    <p style="margin:0;color:rgba(255,255,255,.7);font-size:13px;">${reminders.length} reminder${reminders.length!==1?'s':''} &bull; Total ${fmtINR(total)}</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong style="color:#1e293b;">${userName}</strong>, here are your ${period.toLowerCase()} payment obligations. Please ensure payments are made on time.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      <tr style="background:#f8fafc;">
        <th style="padding:10px 14px;text-align:left;font-size:11px;color:#64748b;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Reminder</th>
        <th style="padding:10px 14px;text-align:right;font-size:11px;color:#64748b;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Amount</th>
        <th style="padding:10px 14px;text-align:center;font-size:11px;color:#64748b;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Due</th>
      </tr>
      ${reminders.map(r=>`
      <tr>
        <td style="padding:12px 14px;border-top:1px solid #f1f5f9;vertical-align:middle;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${moduleColor(r.module)};margin-right:8px;vertical-align:middle;"></span>
          <span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span>
          <br/><span style="font-size:11px;color:#94a3b8;margin-left:16px;">${r.module} &bull; ${r.category}</span>
        </td>
        <td style="padding:12px 14px;border-top:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:700;color:#1e293b;white-space:nowrap;">${fmtINR(r.amount)}</td>
        <td style="padding:12px 14px;border-top:1px solid #f1f5f9;text-align:center;white-space:nowrap;">
          <span style="font-size:12px;font-weight:600;color:${r.dueDate<today?'#dc2626':'#475569'};${r.dueDate<today?'background:#fef2f2;padding:2px 8px;border-radius:999px;':''}">${r.dueDate}</span>
        </td>
      </tr>`).join('')}
      <tr style="background:#f8fafc;">
        <td colspan="2" style="padding:12px 14px;font-size:13px;font-weight:700;color:#1e293b;">Total Due</td>
        <td style="padding:12px 14px;text-align:right;font-size:15px;font-weight:800;color:${light};">${fmtINR(total)}</td>
      </tr>
    </table>
    ${cta('View All Reminders', `${APP_URL}/reminders`, light)}
  </div>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 2 — Card per reminder (visual, modern)
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899);"></div>
  <div style="padding:36px 40px 0;">
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#1e293b;">${period} Payment Summary</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#64748b;">Hi ${userName} &mdash; ${reminders.length} item${reminders.length!==1?'s':''} need your attention.</p>
    <p style="margin:0 0 24px;font-size:20px;font-weight:800;color:#6366f1;">Total: ${fmtINR(total)}</p>
  </div>
  <div style="padding:0 40px 36px;">
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:10px;overflow:hidden;">
      <tr>
        <td style="width:5px;background:${moduleColor(r.module)};">&nbsp;</td>
        <td style="padding:14px 16px;">
          <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1e293b;">${r.title}</p>
          <p style="margin:0;font-size:11px;color:#94a3b8;">${r.module} &bull; ${r.category} &bull; Due ${r.dueDate}</p>
        </td>
        <td style="padding:14px 16px;text-align:right;white-space:nowrap;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#1e293b;">${fmtINR(r.amount)}</p>
        </td>
      </tr>
    </table>`).join('')}
    ${cta('Mark Payments Done', `${APP_URL}/reminders`, '#6366f1')}
  </div>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 3 — Timeline / checklist style
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff7ed;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(245,158,11,.1);border:1px solid #fde68a;">
  <div style="background:linear-gradient(135deg,#92400e,#d97706);padding:36px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:32px;">&#9200;</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:800;">${period} Payment Checklist</h1>
    <p style="margin:0;color:#fde68a;font-size:13px;">Due total: ${fmtINR(total)} across ${reminders.length} item${reminders.length!==1?'s':''}</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#78350f;line-height:1.7;">Hi <strong>${userName}</strong>, tick off each payment as you complete it in ${APP_NAME}.</p>
    ${reminders.map((r,i)=>`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;width:100%;"><tr>
      <td style="width:28px;vertical-align:top;padding-top:2px;">
        <div style="width:24px;height:24px;border:2px solid #d97706;border-radius:6px;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#92400e;">${i+1}</div>
      </td>
      <td style="padding-left:12px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1c1917;">${r.title}</p>
            <p style="margin:0;font-size:11px;color:#a8a29e;">${r.module} &bull; ${r.category} &bull; ${r.dueDate}</p>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <span style="font-size:14px;font-weight:800;color:#92400e;">${fmtINR(r.amount)}</span>
          </td>
        </tr></table>
      </td>
    </tr></table>`).join('')}
    <div style="border-top:2px dashed #fde68a;margin:20px 0;"></div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:14px;font-weight:700;color:#1c1917;">Total Due</td>
      <td style="text-align:right;font-size:18px;font-weight:800;color:#d97706;">${fmtINR(total)}</td>
    </tr></table>
    ${cta('Open Reminders', `${APP_URL}/reminders`, '#d97706')}
  </div>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 4 — Category-grouped / module breakdown
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const grouped = {};
    reminders.forEach(r=>{ if(!grouped[r.module]) grouped[r.module]=[]; grouped[r.module].push(r); });
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f5f3ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(139,92,246,.1);">
  <div style="background:linear-gradient(135deg,#2e1065,#4c1d95,#7c3aed);padding:36px 40px;">
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:800;">${period} — Module Breakdown</h1>
    <p style="margin:0;color:#ddd6fe;font-size:13px;">Hi ${userName} &bull; ${reminders.length} payments &bull; ${fmtINR(total)} total</p>
  </div>
  <div style="padding:32px 40px;">
    ${Object.entries(grouped).map(([mod,items])=>{
      const modTotal = items.reduce((s,r)=>s+r.amount,0);
      return `
      <div style="margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
          <td><span style="display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:${moduleColor(mod)};letter-spacing:.06em;text-transform:uppercase;">&#9632; ${mod}</span></td>
          <td style="text-align:right;font-size:13px;font-weight:700;color:${moduleColor(mod)};">${fmtINR(modTotal)}</td>
        </tr></table>
        ${items.map(r=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border-radius:8px;margin-bottom:6px;"><tr>
          <td style="padding:10px 14px;font-size:13px;color:#1e293b;">${r.title} <span style="color:#94a3b8;font-size:11px;">&bull; ${r.dueDate}</span></td>
          <td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap;">${fmtINR(r.amount)}</td>
        </tr></table>`).join('')}
      </div>`;
    }).join('')}
    <div style="border-top:2px solid #f3f4f6;padding-top:16px;margin-top:8px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:14px;font-weight:700;color:#1e293b;">Grand Total</td>
        <td style="text-align:right;font-size:20px;font-weight:800;color:#7c3aed;">${fmtINR(total)}</td>
      </tr></table>
    </div>
    ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#7c3aed')}
  </div>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 5 — Bold minimal with large amount display
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(6,182,212,.1);">
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1,#0891b2);padding:40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;">${period} Payment Alert</p>
    <p style="margin:0 0 2px;font-size:44px;font-weight:800;color:#fff;letter-spacing:-1px;">${fmtINR(total)}</p>
    <p style="margin:0;color:#7dd3fc;font-size:13px;">due across ${reminders.length} reminder${reminders.length!==1?'s':''}</p>
  </div>
  <div style="padding:32px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong style="color:#1e293b;">${userName}</strong>, here are the payments due ${period.toLowerCase()}:</p>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #f1f5f9;padding:12px 0;margin-bottom:0;"><tr>
      <td style="vertical-align:middle;">
        <div style="width:10px;height:10px;border-radius:50%;background:${moduleColor(r.module)};display:inline-block;margin-right:10px;vertical-align:middle;"></div>
        <span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span>
        <br/><span style="font-size:11px;color:#94a3b8;margin-left:20px;">${r.category} &bull; Due ${r.dueDate}</span>
      </td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#0c4a6e;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Pay & Mark Complete', `${APP_URL}/reminders`, '#0891b2')}
  </div>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// OVERDUE ALERT  (4 variants)
// ══════════════════════════════════════════════════════════════════════════════

const overdueVariants = [

  // Variant 1 — Red urgent
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff5f5;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(220,38,38,.12);">
  <div style="background:linear-gradient(135deg,#7f1d1d,#dc2626);padding:40px;text-align:center;">
    <p style="margin:0 0 10px;font-size:40px;">&#9888;&#65039;</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;">Overdue Payment Alert</h1>
    <p style="margin:0;color:#fca5a5;font-size:13px;">${reminders.length} payment${reminders.length!==1?'s':''} &bull; ${fmtINR(total)} overdue</p>
  </div>
  <div style="padding:36px 40px;">
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">Immediate action required</p>
      <p style="margin:4px 0 0;font-size:13px;color:#b91c1c;line-height:1.6;">Hi ${userName}, these payments have passed their due date and may attract late fees or penalties.</p>
    </div>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin-bottom:8px;overflow:hidden;"><tr>
      <td style="width:5px;background:#dc2626;">&nbsp;</td>
      <td style="padding:12px 16px;">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1e293b;">${r.title}</p>
        <p style="margin:0;font-size:11px;color:#dc2626;">Was due: ${r.dueDate} &bull; ${r.module}</p>
      </td>
      <td style="padding:12px 16px;text-align:right;font-size:14px;font-weight:800;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    <div style="border-top:1px solid #fecaca;margin:20px 0;padding-top:16px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:14px;font-weight:700;color:#1e293b;">Total Overdue</td>
        <td style="text-align:right;font-size:18px;font-weight:800;color:#dc2626;">${fmtINR(total)}</td>
      </tr></table>
    </div>
    ${cta('Clear Overdue Now', `${APP_URL}/reminders`, '#dc2626')}
  </div>
  ${footer(`Overdue alerts are sent daily until all payments are marked complete.`)}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 2 — Dark stern professional
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#1c1917;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#1c1917;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#292524;border-radius:20px;overflow:hidden;border:1px solid #44403c;">
  <div style="padding:36px 40px;border-bottom:1px solid #44403c;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#ef4444;letter-spacing:.1em;text-transform:uppercase;">&#9632; OVERDUE ALERT &bull; ${APP_NAME}</p>
    <h1 style="margin:0 0 8px;color:#fafaf9;font-size:26px;font-weight:800;">${fmtINR(total)} is past due</h1>
    <p style="margin:0;color:#a8a29e;font-size:14px;">Hi ${userName} &mdash; ${reminders.length} payment${reminders.length!==1?'s':''} need immediate attention.</p>
  </div>
  <div style="padding:28px 40px;">
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-bottom:1px solid #292524;padding-bottom:12px;"><tr>
      <td>
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e7e5e4;">${r.title}</p>
        <p style="margin:0;font-size:11px;color:#78716c;">${r.module} &bull; Due ${r.dueDate}</p>
      </td>
      <td style="text-align:right;font-size:14px;font-weight:800;color:#ef4444;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Resolve Overdue Payments', `${APP_URL}/reminders`, '#ef4444')}
  </div>
  <div style="padding:20px 40px;border-top:1px solid #44403c;text-align:center;">
    <p style="margin:0;font-size:11px;color:#57534e;">${APP_NAME} &bull; <a href="mailto:${SUPPORT}" style="color:#78716c;text-decoration:none;">${SUPPORT}</a></p>
  </div>
</td></tr>
<tr><td style="padding-top:18px;text-align:center;font-size:11px;color:#292524;">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 3 — Amber / firm but professional
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fffbeb;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(245,158,11,.12);border:1px solid #fde68a;">
  <div style="background:linear-gradient(90deg,#78350f,#b45309);padding:32px 40px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:36px;vertical-align:middle;">&#128181;</td>
      <td style="padding-left:16px;vertical-align:middle;">
        <h1 style="margin:0 0 4px;color:#fff;font-size:20px;font-weight:800;">Payment Overdue Notice</h1>
        <p style="margin:0;color:#fde68a;font-size:13px;">${reminders.length} item${reminders.length!==1?'s':''} require your attention</p>
      </td>
    </tr></table>
  </div>
  <div style="padding:32px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#44403c;line-height:1.75;">
      Hi <strong>${userName}</strong>, the following payments are overdue in your ${APP_NAME} account.
      Timely payments protect your credit profile and avoid penalty interest.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      ${reminders.map((r,i)=>`
      <tr style="${i>0?'border-top:1px solid #fef3c7;':''}">
        <td style="padding:12px 16px;">
          <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#1c1917;">${r.title}</p>
          <p style="margin:0;font-size:11px;color:#92400e;">${r.module} &bull; Was due ${r.dueDate}</p>
        </td>
        <td style="padding:12px 16px;text-align:right;font-size:14px;font-weight:800;color:#b45309;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr>`).join('')}
      <tr style="background:#fffbeb;border-top:2px solid #fde68a;">
        <td style="padding:14px 16px;font-size:13px;font-weight:700;color:#78350f;">Total Overdue</td>
        <td style="padding:14px 16px;text-align:right;font-size:16px;font-weight:800;color:#b45309;">${fmtINR(total)}</td>
      </tr>
    </table>
    ${cta('Review & Mark Complete', `${APP_URL}/reminders`, '#b45309')}
  </div>
  ${footer('Overdue alerts are sent daily until payments are resolved in AlertHub.')}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 4 — Clean white with red accent strip
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="height:6px;background:#dc2626;"></div>
  <div style="padding:36px 40px 0;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:56px;height:56px;background:#fef2f2;border-radius:14px;text-align:center;vertical-align:middle;font-size:24px;">&#128680;</td>
      <td style="padding-left:16px;">
        <p style="margin:0 0 3px;font-size:20px;font-weight:800;color:#1e293b;">Overdue Payments</p>
        <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600;">${reminders.length} item${reminders.length!==1?'s':''} &bull; ${fmtINR(total)} outstanding</p>
      </td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong style="color:#1e293b;">${userName}</strong>, you have overdue payments that need to be cleared to avoid late fees.</p>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;padding:12px 16px;background:#fef2f2;border-radius:10px;"><tr>
      <td>
        <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p>
        <p style="margin:0;font-size:11px;color:#dc2626;">&#9888; Due ${r.dueDate} &bull; ${r.module}</p>
      </td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Resolve Now', `${APP_URL}/reminders`, '#dc2626')}
  </div>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// TEST EMAIL  (2 variants)
// ══════════════════════════════════════════════════════════════════════════════

const testEmailVariants = [

  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(5,150,105,.1);">
  <div style="background:linear-gradient(135deg,#064e3b,#059669);padding:40px;text-align:center;">
    <p style="margin:0 0 10px;font-size:40px;">&#9989;</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:800;">Email Delivery Confirmed</h1>
    <p style="margin:0;color:#6ee7b7;font-size:13px;">Your ${APP_NAME} email notifications are working</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 20px;font-size:15px;color:#1e293b;">Hi <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">
      This is a confirmation email from ${APP_NAME}. Your email notification system is fully operational and
      emails will be delivered to your inbox for payment reminders, digests, and alerts.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:8px;">
      <tr><td style="padding:20px 24px;">
        ${[['Status','&#9989; Delivered'],['Account',email],['Sent at',t+' IST'],['SMTP','Gmail &#10003;']].map(([l,v])=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
          <td style="width:100px;font-size:12px;font-weight:700;color:#166534;">${l}</td>
          <td style="font-size:13px;color:#14532d;">${v}</td>
        </tr></table>`).join('')}
      </td></tr>
    </table>
    ${cta('Go to Dashboard', `${APP_URL}/dashboard`, '#059669')}
  </div>
  ${footer(`Test email triggered from your ${APP_NAME} Profile page.`)}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#fafafa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #e2e8f0;">
  <div style="height:4px;background:linear-gradient(90deg,#10b981,#3b82f6,#8b5cf6);"></div>
  <div style="padding:36px 36px 28px;">
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1e293b;">&#128236; Test Email</h1>
    <p style="margin:0 0 24px;font-size:13px;color:#64748b;">${APP_NAME} notification system diagnostic</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">
      Hi ${userName}, this test confirms that ${APP_NAME} can reach your inbox at <strong style="color:#1e293b;">${email}</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
      ${[
        ['&#9989; SMTP Connection','Verified'],
        ['&#9989; Email Routing','Delivered'],
        ['&#9989; Spam Filter','Passed'],
        ['&#8987; Sent At',t+' IST'],
      ].map(([k,v],i)=>`
      <tr style="${i>0?'border-top:1px solid #f1f5f9;':''}">
        <td style="padding:10px 14px;font-size:12px;color:#475569;">${k}</td>
        <td style="padding:10px 14px;font-size:12px;font-weight:700;color:#1e293b;text-align:right;">${v}</td>
      </tr>`).join('')}
    </table>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
      You will receive emails like this for daily reminders, weekly digests, and overdue alerts.
    </p>
    ${cta('Open Profile Settings', `${APP_URL}/profile`, '#4f46e5')}
  </div>
  ${footer(`Test triggered from ${APP_NAME} Profile page.`)}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Public send functions — each picks a random variant
// ══════════════════════════════════════════════════════════════════════════════

async function sendWelcomeEmail(user) {
  const html = pickRandom(welcomeVariants)({ userName: user.name, email: user.email });
  return sendMail({ to: user.email, subject: `Welcome to ${APP_NAME} — Your account is ready`, html });
}

async function sendLoginAlertEmail(user, meta = {}) {
  const html = pickRandom(loginAlertVariants)({ userName: user.name, email: user.email, ...meta });
  return sendMail({ to: user.email, subject: `${APP_NAME}: New sign-in to your account`, html });
}

async function sendReminderDigest(user, reminders, period = 'Weekly') {
  if (!reminders.length) return null;
  const html = pickRandom(reminderVariants)({ userName: user.name, reminders, period });
  const total = reminders.reduce((s,r)=>s+r.amount,0);
  const periodLabel = { Daily:'Today', Weekly:'This Week', Monthly:'This Month', '3-Day Advance':'in 3 Days' }[period] || period;
  return sendMail({
    to: user.email,
    subject: `${APP_NAME}: ${reminders.length} payment${reminders.length!==1?'s':''} due ${periodLabel} — &#8377;${Math.round(total).toLocaleString('en-IN')}`,
    html,
  });
}

async function sendOverdueAlert(user, reminders) {
  if (!reminders.length) return null;
  const html = pickRandom(overdueVariants)({ userName: user.name, reminders });
  return sendMail({
    to: user.email,
    subject: `${APP_NAME}: Action Required — ${reminders.length} overdue payment${reminders.length!==1?'s':''}`,
    html,
  });
}

async function sendTestEmail(user) {
  const html = pickRandom(testEmailVariants)({ userName: user.name, email: user.email });
  return sendMail({ to: user.email, subject: `${APP_NAME}: Email delivery test — confirmed`, html });
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
