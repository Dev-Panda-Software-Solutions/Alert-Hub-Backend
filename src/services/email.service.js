const nodemailer = require('nodemailer');

const APP_URL  = process.env.CLIENT_URL || 'https://srv1567353.hstgr.cloud';
const APP_NAME = 'Alert-Guard';
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

  // Variant 5 — Sky blue, left ribbon accent card
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding-bottom:16px;text-align:center;font-size:12px;font-weight:700;color:#0284c7;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Account Ready</td></tr>
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,165,233,.12);">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="width:6px;background:linear-gradient(180deg,#38bdf8,#0284c7,#0369a1);">&nbsp;</td>
    <td style="padding:40px 36px;">
      <p style="margin:0 0 6px;font-size:32px;line-height:1;">&#128640;</p>
      <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0c4a6e;line-height:1.2;">Welcome aboard,<br/>${userName}!</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">Your ${APP_NAME} account is live. Track every EMI, bill, GST filing, and subscription — across Business, Family, and Finance — from one intelligent dashboard.</p>
      ${[['&#128202;','Business','GST, vendor payments, TDS, subscriptions'],['&#128106;','Family','Rent, school fees, insurance, household bills'],['&#128184;','Finance','EMIs, SIPs, credit cards, loan repayments']].map(([ic,t,d])=>`
      <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;width:100%;"><tr>
        <td style="width:36px;font-size:22px;vertical-align:middle;">${ic}</td>
        <td style="padding-left:10px;"><p style="margin:0 0 1px;font-size:13px;font-weight:700;color:#0c4a6e;">${t}</p><p style="margin:0;font-size:11px;color:#64748b;line-height:1.4;">${d}</p></td>
      </tr></table>`).join('')}
      ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#0284c7')}
      <p style="margin:24px 0 0;font-size:11px;color:#94a3b8;">${email}</p>
    </td>
  </tr></table>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 6 — Rose gradient, numbered quick-start steps
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff1f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff1f2;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,.12);border:1px solid #fecdd3;">
  <div style="background:linear-gradient(135deg,#881337,#be123c,#f43f5e);padding:44px 40px;text-align:center;">
    <p style="margin:0 0 12px;font-size:48px;line-height:1;">&#127881;</p>
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:800;">Welcome, ${userName}!</h1>
    <p style="margin:0;color:#fecdd3;font-size:14px;">You just made the smartest financial decision.</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;color:#be123c;text-transform:uppercase;letter-spacing:.06em;">Your Quick-Start in 4 Steps</p>
    ${[['01','Add your first reminder','Go to Reminders and add a bill, EMI, or subscription.'],['02','Enable notifications','Turn on Push and Email alerts in your Profile settings.'],['03','Explore the Calendar','See all payments colour-coded by module at a glance.'],['04','Check AI Insights','Let ${APP_NAME} analyse your cash flow and flag risks weekly.']].map(([n,t,d])=>`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%;"><tr>
      <td style="width:36px;height:36px;background:#fff1f2;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;font-weight:900;color:#f43f5e;border:2px solid #fecdd3;min-width:36px;">${n}</td>
      <td style="padding-left:14px;"><p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1e293b;">${t}</p><p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">${d}</p></td>
    </tr></table>`).join('')}
    ${cta('Open My Account', `${APP_URL}/dashboard`, '#f43f5e')}
    <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;">${email}</p>
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 7 — Navy, account activation receipt / table style
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="text-align:center;padding-bottom:20px;font-size:13px;font-weight:700;color:#1e293b;letter-spacing:.06em;text-transform:uppercase;">${APP_NAME}</td></tr>
<tr><td style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 2px 12px rgba(0,0,0,.05);">
  <div style="background:#0f172a;padding:28px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#475569;letter-spacing:.1em;text-transform:uppercase;">Account Activation Receipt</p>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">&#10003;&nbsp;Confirmed — Welcome, ${userName}</h1>
  </div>
  <div style="padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f8fafc;"><td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;color:#64748b;letter-spacing:.06em;text-transform:uppercase;">Account Details</td></tr>
      ${[['Name',userName],['Email',email],['Plan','Free — upgrade anytime'],['Status','&#10003; Active'],['Modules','Business &bull; Family &bull; Finance'],['Alerts','Email &amp; Push enabled']].map(([k,v],i)=>`
      <tr style="border-top:1px solid #f1f5f9;${i%2===0?'':'background:#fafafa;'}">
        <td style="padding:10px 16px;font-size:12px;color:#64748b;font-weight:600;width:110px;">${k}</td>
        <td style="padding:10px 16px;font-size:12px;color:#1e293b;">${v}</td>
      </tr>`).join('')}
    </table>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">Start by adding your first payment reminder — an EMI, GST due date, or subscription — and ${APP_NAME} will keep you on track.</p>
    ${cta('Go to Dashboard', `${APP_URL}/dashboard`, '#0f172a')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 8 — Violet, 2×2 icon feature grid
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f5f3ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(124,58,237,.12);">
  <div style="background:linear-gradient(135deg,#2e1065,#4c1d95,#7c3aed);padding:44px 40px;text-align:center;">
    <div style="width:68px;height:68px;background:rgba(255,255,255,.15);border-radius:16px;margin:0 auto 16px;line-height:68px;text-align:center;font-size:32px;">&#128737;</div>
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:800;">Hi ${userName}, you&rsquo;re in!</h1>
    <p style="margin:0;color:#ddd6fe;font-size:14px;">Your ${APP_NAME} account is ready to use.</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">Here&rsquo;s what&rsquo;s waiting for you:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[['&#128197;','#ede9fe','#5b21b6','Reminders','EMIs, bills, GST, subscriptions — never miss a date.'],['&#127775;','#ecfdf5','#065f46','AI Insights','Weekly cash flow analysis and risk detection.'],['&#128276;','#eff6ff','#1e40af','Multi-Channel','Push, Email, WhatsApp &amp; SMS on every plan.'],['&#128198;','#fff7ed','#92400e','Calendar','All payments colour-coded on a visual calendar.']].map(([ic,bg,col,t,d])=>`
      <tr><td style="padding:0 6px 12px 0;width:50%;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:14px;padding:16px;"><tr><td>
          <p style="margin:0 0 8px;font-size:24px;">${ic}</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${col};">${t}</p>
          <p style="margin:0;font-size:11px;color:#64748b;line-height:1.5;">${d}</p>
        </td></tr></table>
      </td></tr>`).join('')}
    </table>
    ${cta('Explore Dashboard', `${APP_URL}/dashboard`, '#7c3aed')}
    <p style="margin:24px 0 0;font-size:11px;color:#94a3b8;text-align:center;">${email}</p>
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 9 — Dark teal, timeline dot steps
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0d1f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#0d1f1e;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="padding-bottom:16px;text-align:center;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:.1em;text-transform:uppercase;">${APP_NAME}</td></tr>
<tr><td style="background:#134e4a;border-radius:20px;overflow:hidden;border:1px solid #1f6b65;">
  <div style="padding:40px 40px 32px;border-bottom:1px solid #1f6b65;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#5eead4;letter-spacing:.06em;text-transform:uppercase;">Account Activated</p>
    <h1 style="margin:0 0 10px;color:#f0fdfa;font-size:28px;font-weight:800;line-height:1.2;">Welcome to ${APP_NAME},<br/>${userName}.</h1>
    <p style="margin:0;color:#99f6e4;font-size:14px;line-height:1.6;">Your smart financial command centre is ready.</p>
  </div>
  <div style="padding:32px 40px;">
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;color:#5eead4;letter-spacing:.06em;text-transform:uppercase;">Your Journey Starts Here</p>
    ${[['&#128197;','Add a Reminder','Log your first EMI, bill, or GST due date in under 30 seconds.'],['&#128276;','Enable Alerts','Set up push and email notifications so nothing slips through.'],['&#128200;','Track AI Insights','Let the system analyse your cash flow and flag overdue risks.'],['&#127775;','Go Premium','Unlock WhatsApp, SMS, and multi-user access anytime.']].map(([ ic,t,d],i)=>`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:${i<3?'20px':'0'};width:100%;"><tr>
      <td style="width:12px;vertical-align:top;padding-top:4px;">
        <div style="width:10px;height:10px;border-radius:50%;background:#0d9488;"></div>
        ${i<3?`<div style="width:2px;height:30px;background:#1f6b65;margin:4px auto 0;"></div>`:''}
      </td>
      <td style="padding-left:16px;padding-bottom:${i<3?'0':'0'};">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#f0fdfa;">${ic}&nbsp;${t}</p>
        <p style="margin:0;font-size:12px;color:#5eead4;line-height:1.5;">${d}</p>
      </td>
    </tr></table>`).join('')}
    ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#0d9488')}
    <p style="margin:24px 0 0;font-size:11px;color:#1f6b65;text-align:center;">${email}</p>
  </div>
  <div style="padding:18px 40px;border-top:1px solid #1f6b65;text-align:center;"><p style="margin:0;font-size:11px;color:#1f6b65;">&#169; ${YEAR} ${APP_NAME} &mdash; Smart Payment Management</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // Variant 10 — Pure white minimal, centered
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:20px;padding:48px 40px;box-shadow:0 2px 16px rgba(0,0,0,.06);text-align:center;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:.1em;text-transform:uppercase;">${APP_NAME}</p>
  <p style="margin:0 0 20px;font-size:48px;line-height:1;">&#128737;</p>
  <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1e293b;">Welcome, ${userName}.</h1>
  <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.75;max-width:340px;margin-left:auto;margin-right:auto;">
    You now have a powerful tool to track every financial obligation across your Business, Family, and Finance life — all in one place.
  </p>
  <div style="border-top:1px solid #f1f5f9;padding-top:20px;margin-bottom:28px;text-align:left;">
    ${[['Business','GST &bull; Vendor Payments &bull; TDS'],['Family','Rent &bull; School Fees &bull; Insurance'],['Finance','EMIs &bull; SIPs &bull; Credit Cards']].map(([m,d])=>`
    <p style="margin:0 0 8px;font-size:13px;color:#475569;"><strong style="color:#1e293b;">${m}:</strong> ${d}</p>`).join('')}
  </div>
  ${cta('Get Started', `${APP_URL}/dashboard`, '#6366f1')}
  <p style="margin:24px 0 0;font-size:11px;color:#cbd5e1;">${email}</p>
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 11 — Full gradient background, floating glass card
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4c1d95 70%,#5b21b6 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;min-height:100%;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:24px;overflow:hidden;backdrop-filter:blur(10px);">
  <div style="padding:44px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08);">
    <p style="margin:0 0 16px;font-size:48px;line-height:1;">&#10024;</p>
    <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;">Welcome, ${userName}!</h1>
    <p style="margin:0;color:#c4b5fd;font-size:14px;line-height:1.6;">Your ${APP_NAME} account is fully activated and ready to use.</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#c4b5fd;line-height:1.75;">
      ${APP_NAME} tracks every EMI, bill, subscription, GST deadline, and financial obligation across your Business, Family, and Finance life — and alerts you before anything goes overdue.
    </p>
    ${[['&#128197;','Never miss a due date — add reminders in seconds.'],['&#127775;','AI analyses your cash flow and flags overdue risks.'],['&#128276;','Push, Email, WhatsApp &amp; SMS alerts across all plans.'],['&#128198;','Visual calendar — every payment colour-coded by module.']].map(([ic,t])=>`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
      <td style="width:28px;font-size:16px;color:#a78bfa;">${ic}</td>
      <td style="padding-left:10px;font-size:13px;color:#ddd6fe;line-height:1.5;">${t}</td>
    </tr></table>`).join('')}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
      <tr><td align="center" style="border-radius:12px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2);">
        <a href="${APP_URL}/dashboard" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:12px;">Open Dashboard &rarr;</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:11px;color:rgba(255,255,255,.3);text-align:center;">${email}</p>
  </div>
</td></tr>
<tr><td style="padding-top:20px;text-align:center;font-size:11px;color:rgba(255,255,255,.3);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`,

  // Variant 12 — Coral orange, large hero emoji, friendly chatty
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff7f0;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,.1);border:1px solid #fed7aa;">
  <div style="background:linear-gradient(135deg,#c2410c,#ea580c,#f97316);padding:44px 40px;text-align:center;">
    <p style="margin:0;font-size:64px;line-height:1;">&#128075;</p>
  </div>
  <div style="padding:36px 40px;">
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#1c1917;">Hey ${userName}, great to have you here!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#57534e;line-height:1.8;">
      Let me be honest — financial stress is almost always about forgetting. A bill here, an EMI there, a GST deadline that crept up.
      <strong>${APP_NAME}</strong> exists to make sure that never happens to you again.
    </p>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#c2410c;letter-spacing:.05em;text-transform:uppercase;">What you get, right now:</p>
      ${[['Reminders for everything','EMIs, rent, insurance, GST, subscriptions — add once, reminded forever.'],['AI-powered analysis','Weekly cash flow reports sent to your inbox automatically.'],['Multi-channel alerts','Push notifications, email digests, and more — all configurable.']].map(([t,d])=>`
      <p style="margin:10px 0 0;font-size:13px;color:#44403c;line-height:1.6;"><strong style="color:#c2410c;">&#10003; ${t}:</strong> ${d}</p>`).join('')}
    </div>
    ${cta('Start for Free', `${APP_URL}/dashboard`, '#ea580c')}
    <p style="margin:20px 0 0;font-size:11px;color:#a8a29e;text-align:center;">${email}</p>
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 13 — Deep purple, split two-tone card
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#faf5ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(126,34,206,.1);">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:50%;background:linear-gradient(180deg,#3b0764,#6b21a8,#7e22ce);padding:48px 32px;vertical-align:top;">
        <p style="margin:0 0 12px;font-size:44px;line-height:1;">&#128274;</p>
        <h1 style="margin:0 0 12px;color:#fff;font-size:22px;font-weight:800;line-height:1.3;">Welcome to ${APP_NAME}</h1>
        <p style="margin:0;color:#d8b4fe;font-size:13px;line-height:1.6;">Smart payment tracking for your Business, Family &amp; Finance life.</p>
      </td>
      <td style="width:50%;padding:32px 28px;vertical-align:top;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#7e22ce;letter-spacing:.05em;text-transform:uppercase;">Hi, ${userName}!</p>
        <p style="margin:0 0 20px;font-size:13px;color:#475569;line-height:1.7;">Your account is active. Here&rsquo;s what to do next:</p>
        ${[['&#128197;','Add reminders'],['&#128276;','Enable alerts'],['&#128200;','View Insights'],['&#128198;','Open Calendar']].map(([ic,t])=>`
        <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
          <td style="width:28px;height:28px;background:#f3e8ff;border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;">${ic}</td>
          <td style="padding-left:10px;font-size:12px;font-weight:600;color:#1e293b;">${t}</td>
        </tr></table>`).join('')}
        ${cta('Get Started', `${APP_URL}/dashboard`, '#7e22ce')}
      </td>
    </tr>
  </table>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 14 — Midnight blue, tech-aesthetic, monospace details
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#020617;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid #1e293b;">
  <div style="padding:36px 40px;border-bottom:1px solid #1e293b;">
    <p style="margin:0 0 8px;font-size:11px;color:#3b82f6;font-family:monospace;letter-spacing:.05em;">&gt; ACCOUNT_STATUS: ACTIVE</p>
    <p style="margin:0 0 8px;font-size:11px;color:#3b82f6;font-family:monospace;">&gt; USER: ${userName.toUpperCase().replace(/ /g,'_')}</p>
    <p style="margin:0 0 20px;font-size:11px;color:#3b82f6;font-family:monospace;">&gt; MODULES: BUSINESS | FAMILY | FINANCE</p>
    <h1 style="margin:0 0 10px;color:#f8fafc;font-size:26px;font-weight:800;">Access Granted, ${userName}.</h1>
    <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">${APP_NAME} is now protecting your financial schedule. Reminders, alerts, AI insights — all live.</p>
  </div>
  <div style="padding:28px 40px;background:#020617;">
    ${[['Reminders','EMIs, bills, GST, subscriptions tracked 24/7'],['AI Insights','Cash flow analysis &amp; overdue detection'],['Multi-Channel','Push, Email, WhatsApp &amp; SMS alerts'],['Calendar','Visual payment schedule — colour by module']].map(([k,v])=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-bottom:1px solid #1e293b;padding-bottom:12px;"><tr>
      <td style="width:120px;font-size:11px;font-weight:700;color:#3b82f6;font-family:monospace;">${k}</td>
      <td style="font-size:12px;color:#94a3b8;">${v}</td>
    </tr></table>`).join('')}
    ${cta('Open Terminal', `${APP_URL}/dashboard`, '#3b82f6')}
    <p style="margin:24px 0 0;font-size:10px;color:#1e293b;text-align:center;font-family:monospace;">${email}</p>
  </div>
  <div style="padding:16px 40px;border-top:1px solid #1e293b;text-align:center;">
    <p style="margin:0;font-size:10px;color:#1e293b;font-family:monospace;">&copy; ${YEAR} ${APP_NAME} // ALL RIGHTS RESERVED</p>
  </div>
</td></tr></table></td></tr></table></body></html>`,

  // Variant 15 — Warm gold, bordered info boxes
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fefce8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fefce8;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(234,179,8,.12);border:2px solid #fef08a;">
  <div style="background:linear-gradient(135deg,#713f12,#a16207,#ca8a04);padding:36px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;"><h1 style="margin:0 0 4px;color:#fff;font-size:24px;font-weight:800;">Welcome, ${userName}!</h1><p style="margin:0;color:#fef08a;font-size:13px;">${APP_NAME} &bull; Account Active</p></td>
      <td style="text-align:right;font-size:44px;vertical-align:middle;">&#127881;</td>
    </tr></table>
  </div>
  <div style="padding:32px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#44403c;line-height:1.75;">Whether it&rsquo;s a GST filing, a school fee, an EMI, or a credit card bill — add it once to ${APP_NAME} and we handle the reminders, so you handle the payments.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[['&#128197;','Business Payments','GST, vendor bills, TDS, professional subscriptions'],['&#128106;','Family Expenses','Rent, school fees, insurance, electricity, LIC'],['&#128184;','Personal Finance','EMIs, SIPs, credit cards, loan repayments, investments'],['&#127775;','AI Watchdog','Automatic cash flow analysis &amp; overdue risk detection']].map(([ic,t,d])=>`
      <tr><td style="padding:0 0 12px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #fef08a;border-radius:10px;background:#fefce8;"><tr>
          <td style="padding:12px 14px;width:36px;font-size:20px;vertical-align:middle;">${ic}</td>
          <td style="padding:12px 14px 12px 4px;">
            <p style="margin:0 0 2px;font-size:12px;font-weight:700;color:#713f12;">${t}</p>
            <p style="margin:0;font-size:11px;color:#78350f;line-height:1.4;">${d}</p>
          </td>
        </tr></table>
      </td></tr>`).join('')}
    </table>
    ${cta('Add First Reminder', `${APP_URL}/reminders`, '#ca8a04')}
    <p style="margin:20px 0 0;font-size:11px;color:#a8a29e;text-align:center;">${email}</p>
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 16 — Gray corporate letterhead style
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,.04);">
  <div style="border-bottom:3px solid #1e293b;padding:28px 48px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:18px;font-weight:700;color:#1e293b;font-family:-apple-system,sans-serif;">${APP_NAME}</p><p style="margin:2px 0 0;font-size:11px;color:#64748b;font-family:-apple-system,sans-serif;letter-spacing:.04em;text-transform:uppercase;">Smart Payment &amp; Reminder Management</p></td>
      <td style="text-align:right;font-size:12px;color:#64748b;font-family:-apple-system,sans-serif;">${new Date().toLocaleDateString('en-IN',{dateStyle:'long'})}</td>
    </tr></table>
  </div>
  <div style="padding:36px 48px;">
    <p style="margin:0 0 16px;font-size:15px;color:#1e293b;line-height:1.7;">Dear <strong>${userName}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.85;">We are pleased to confirm the successful activation of your <strong>${APP_NAME}</strong> account. You now have full access to our payment tracking and reminder management platform.</p>
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.85;">Your account is configured to manage obligations across three primary modules: <strong>Business</strong> (GST, vendor payments, TDS), <strong>Family</strong> (rent, school fees, insurance), and <strong>Finance</strong> (EMIs, SIPs, credit cards).</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.85;">We recommend adding your first reminder within 24 hours to experience the full benefit of our notification system, which supports Push, Email, WhatsApp, and SMS channels.</p>
    <div style="border-top:1px solid #e2e8f0;padding-top:20px;">
      ${cta('Access Your Account', `${APP_URL}/dashboard`, '#1e293b')}
    </div>
    <p style="margin:24px 0 0;font-size:12px;color:#64748b;font-family:-apple-system,sans-serif;">Account registered to: <strong>${email}</strong></p>
  </div>
  <div style="background:#f8fafc;padding:20px 48px;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:11px;color:#94a3b8;font-family:-apple-system,sans-serif;">For support, contact <a href="mailto:${SUPPORT}" style="color:#4f46e5;text-decoration:none;">${SUPPORT}</a> &mdash; &copy; ${YEAR} ${APP_NAME}</p>
  </div>
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 17 — Emerald, checklist with left accent bars
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(16,185,129,.1);">
  <div style="height:5px;background:linear-gradient(90deg,#10b981,#059669,#047857);"></div>
  <div style="padding:36px 40px 0;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:52px;height:52px;background:#d1fae5;border-radius:14px;text-align:center;vertical-align:middle;font-size:26px;">&#128737;</td>
      <td style="padding-left:16px;">
        <p style="margin:0 0 2px;font-size:20px;font-weight:800;color:#1e293b;">Account Activated!</p>
        <p style="margin:0;font-size:13px;color:#059669;">Welcome to ${APP_NAME}, ${userName}</p>
      </td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Your smart financial dashboard is ready. Here&rsquo;s a quick overview of what you can do:</p>
    ${[['#10b981','Reminders across 3 modules','Add EMIs, bills, GST deadlines, subscriptions — Business, Family, Finance.'],['#059669','AI Insights & cash flow analysis','Automated weekly analysis of your spending, risk flags, and overdue trends.'],['#047857','Multi-channel notifications','Push alerts, email digests, WhatsApp, and SMS — customise per reminder.'],['#065f46','Visual Calendar','Every payment colour-coded by module on an interactive monthly calendar.']].map(([col,t,d])=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
      <td style="width:4px;border-radius:2px;background:${col};">&nbsp;</td>
      <td style="padding-left:14px;">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1e293b;">&#10003; ${t}</p>
        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">${d}</p>
      </td>
    </tr></table>`).join('')}
    ${cta('Explore Dashboard', `${APP_URL}/dashboard`, '#059669')}
    <p style="margin:24px 0 0;font-size:11px;color:#94a3b8;text-align:center;">${email}</p>
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 18 — Cyan wide card, top rainbow accent strip
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ecfeff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#ecfeff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(6,182,212,.1);">
  <div style="height:6px;background:linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#6366f1,#a855f7);"></div>
  <div style="padding:36px 48px;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0e7490;letter-spacing:.06em;text-transform:uppercase;">${APP_NAME} &bull; You&rsquo;re In!</p>
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#0c4a6e;line-height:1.2;">Welcome to your financial hub, ${userName}!</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.8;">
      From today, every EMI, every bill, every GST deadline, and every subscription renewal will be tracked, organised, and alerted — exactly when you need it.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-collapse:collapse;">
      <tr>
        ${[['&#128197;','Reminders','Add any payment obligation once and get notified every time.'],['&#128200;','Insights','AI analyses your cash flow and flags risks automatically.']].map(([ic,t,d])=>`
        <td style="width:50%;padding-right:12px;vertical-align:top;">
          <table cellpadding="0" cellspacing="0" style="background:#ecfeff;border-radius:12px;padding:16px;width:100%;"><tr><td>
            <p style="margin:0 0 8px;font-size:26px;">${ic}</p>
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0e7490;">${t}</p>
            <p style="margin:0;font-size:12px;color:#475569;line-height:1.5;">${d}</p>
          </td></tr></table>
        </td>`).join('')}
      </tr>
    </table>
    ${cta('Get Started Now', `${APP_URL}/dashboard`, '#0e7490')}
    <p style="margin:24px 0 0;font-size:11px;color:#94a3b8;text-align:center;">${email}</p>
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 19 — Pink celebration, confetti emoji header
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fdf2f8;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(236,72,153,.1);border:1px solid #fce7f3;">
  <div style="background:linear-gradient(135deg,#831843,#be185d,#ec4899);padding:40px;text-align:center;">
    <p style="margin:0;font-size:40px;letter-spacing:4px;line-height:1.4;">&#127881;&nbsp;&#10024;&nbsp;&#127882;</p>
    <h1 style="margin:16px 0 6px;color:#fff;font-size:26px;font-weight:800;">You&rsquo;re officially in, ${userName}!</h1>
    <p style="margin:0;color:#fbcfe8;font-size:14px;">Your ${APP_NAME} journey starts now.</p>
  </div>
  <div style="padding:36px 40px;text-align:center;">
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.8;">We built ${APP_NAME} for one simple reason: <strong style="color:#be185d;">nobody should pay a late fee because they forgot</strong>. And with your account now active, you never will again.</p>
    <div style="background:#fdf2f8;border-radius:14px;padding:20px;margin-bottom:24px;text-align:left;">
      ${[['&#128198;','Business module live — add GST, TDS, vendor payments.'],['&#128276;','Email &amp; push notifications ready to configure.'],['&#127775;','AI Insights will analyse your finances weekly.'],['&#128197;','Calendar shows every payment colour-coded by module.']].map(([ic,t])=>`<p style="margin:0 0 10px;font-size:13px;color:#1e293b;">${ic}&nbsp;&nbsp;${t}</p>`).join('')}
    </div>
    ${cta('Let\'s Go!', `${APP_URL}/dashboard`, '#ec4899')}
    <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;">${email}</p>
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // Variant 20 — Deep navy, colored left sidebar panel layout
  ({ userName, email }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:200px;background:linear-gradient(180deg,#0f172a,#1e3a5f);padding:40px 24px;vertical-align:top;">
        <p style="margin:0 0 20px;font-size:13px;font-weight:700;color:#fff;letter-spacing:.04em;">${APP_NAME}</p>
        <p style="margin:0 0 24px;font-size:36px;line-height:1;">&#128737;</p>
        <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:20px;">
          ${[['&#128197;','Reminders'],['&#127775;','AI Insights'],['&#128276;','Multi-Channel'],['&#128198;','Calendar']].map(([ic,t])=>`
          <p style="margin:0 0 12px;font-size:12px;color:#93c5fd;">${ic}&nbsp;${t}</p>`).join('')}
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:16px;margin-top:8px;">
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,.3);line-height:1.5;">Business<br/>Family<br/>Finance</p>
        </div>
      </td>
      <td style="padding:40px 36px;vertical-align:top;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:.06em;text-transform:uppercase;">Account Confirmed</p>
        <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1e293b;line-height:1.2;">Welcome, ${userName}!</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Your ${APP_NAME} account is fully set up. You now have access to intelligent reminder management across all three financial modules.</p>
        <div style="background:#f1f5f9;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
          ${[['Email',email],['Plan','Free (upgrade anytime)'],['Status','Active &#10003;']].map(([k,v])=>`
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
            <td style="width:70px;font-size:11px;color:#64748b;font-weight:600;">${k}</td>
            <td style="font-size:12px;color:#1e293b;">${v}</td>
          </tr></table>`).join('')}
        </div>
        ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#6366f1')}
      </td>
    </tr>
  </table>
  ${footer()}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,
];

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN SECURITY ALERT  (20 variants)
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

  // Variant 4 — Compact info banner, left red border ribbon
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fafafa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="width:5px;background:linear-gradient(180deg,#ef4444,#dc2626);">&nbsp;</td>
    <td style="padding:36px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
        <td style="width:40px;height:40px;background:#fef2f2;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">&#128274;</td>
        <td style="padding-left:12px;"><p style="margin:0 0 2px;font-size:16px;font-weight:800;color:#1e293b;">Sign-In Alert</p><p style="margin:0;font-size:12px;color:#64748b;">${APP_NAME} Security</p></td>
      </tr></table>
      <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong>${userName}</strong>, a new sign-in was recorded on <strong>${t} IST</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;margin-bottom:16px;">
        <tr><td style="padding:16px 18px;">
          ${[['Email',email],['Device',device||'Web browser'],['IP',ip||'Unknown']].map(([k,v])=>`
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
            <td style="width:70px;font-size:11px;color:#64748b;font-weight:700;">${k}</td>
            <td style="font-size:12px;color:#1e293b;">${v}</td>
          </tr></table>`).join('')}
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:13px;color:#dc2626;font-weight:600;">&#9888;&nbsp;Not you? Change your password immediately at <a href="${APP_URL}/profile" style="color:#dc2626;">Profile Settings</a>.</p>
      ${cta('Review Account', `${APP_URL}/profile`, '#dc2626')}
    </td>
  </tr></table>
  ${footer('Security alerts are sent for every sign-in to your account.')}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 5 — Full-bleed amber warning, table-centric receipt log
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'medium'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fffbeb;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(245,158,11,.12);border:1px solid #fde68a;">
  <div style="background:linear-gradient(90deg,#92400e,#d97706);padding:20px 40px;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#fef3c7;letter-spacing:.06em;text-transform:uppercase;">&#9888;&nbsp;${APP_NAME} &bull; Security Alert</p>
  </div>
  <div style="padding:32px 40px;">
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#78350f;">New Sign-In Access Log</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#92400e;">Hi ${userName}, your account was accessed. Please verify the details below.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      <tr style="background:#fffbeb;"><td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;color:#92400e;letter-spacing:.06em;text-transform:uppercase;">Access Record</td></tr>
      ${[['Account',email],['Date &amp; Time',t+' IST'],['IP Address',ip||'Unknown'],['Device',device||'Web browser'],['Status','Successful sign-in']].map(([k,v],i)=>`
      <tr style="border-top:1px solid #fef3c7;${i%2===0?'':'background:#fffdf0;'}">
        <td style="padding:10px 16px;font-size:12px;color:#92400e;font-weight:600;width:130px;">${k}</td>
        <td style="padding:10px 16px;font-size:12px;color:#44403c;">${v}</td>
      </tr>`).join('')}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-radius:10px;margin-bottom:8px;"><tr><td style="padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#78350f;"><strong>If this wasn&rsquo;t you</strong> — change your password immediately and contact <a href="mailto:${SUPPORT}" style="color:#92400e;">${SUPPORT}</a></p>
    </td></tr></table>
    ${cta('Secure My Account', `${APP_URL}/profile`, '#d97706')}
  </div>${footer('You receive security alerts for every successful sign-in.')}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 6 — Split layout: icon panel left, details right
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:160px;background:linear-gradient(180deg,#1e3a8a,#1d4ed8,#3b82f6);padding:40px 24px;text-align:center;vertical-align:middle;">
        <p style="margin:0 0 12px;font-size:48px;line-height:1;">&#128274;</p>
        <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.06em;">Security</p>
        <p style="margin:4px 0 0;font-size:11px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.06em;">Alert</p>
      </td>
      <td style="padding:32px 32px;vertical-align:top;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#3b82f6;letter-spacing:.06em;text-transform:uppercase;">${APP_NAME}</p>
        <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#1e293b;">New Sign-In Detected</h1>
        <p style="margin:0 0 16px;font-size:13px;color:#475569;line-height:1.7;">Hi <strong>${userName}</strong>, we recorded a new login to your account.</p>
        ${[['When',t+' IST'],['From',ip||'Unknown'],['Device',device||'Web browser']].map(([k,v])=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
          <td style="width:60px;font-size:11px;font-weight:700;color:#64748b;">${k}</td>
          <td style="font-size:12px;color:#1e293b;font-weight:500;">${v}</td>
        </tr></table>`).join('')}
        <div style="background:#eff6ff;border-radius:8px;padding:12px 14px;margin-top:16px;">
          <p style="margin:0;font-size:12px;color:#1d4ed8;"><strong>Not you?</strong> <a href="${APP_URL}/profile" style="color:#1d4ed8;font-weight:700;">Change password now</a></p>
        </div>
        ${cta('Review Security', `${APP_URL}/profile`, '#1d4ed8')}
      </td>
    </tr>
  </table>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 7 — Dark forest, premium glass card
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#0a0f1a,#0f1f14,#0a160d);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;">
  <div style="padding:36px 40px;border-bottom:1px solid rgba(255,255,255,.06);">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#4ade80;letter-spacing:.1em;text-transform:uppercase;">&#9632; Security Event Logged</p>
    <h1 style="margin:0 0 8px;color:#f8fafc;font-size:24px;font-weight:800;">Sign-In Verified</h1>
    <p style="margin:0;color:#6b7280;font-size:13px;">Hi ${userName} — your ${APP_NAME} account was accessed.</p>
  </div>
  <div style="padding:28px 40px;background:rgba(0,0,0,.2);">
    ${[['&#128336;','Time',t+' IST'],['&#127760;','IP Address',ip||'Unknown'],['&#128187;','Device',device||'Web browser'],['&#128231;','Account',email]].map(([ic,k,v])=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.04);"><tr>
      <td style="width:24px;font-size:16px;">${ic}</td>
      <td style="padding:0 0 0 10px;width:100px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${k}</td>
      <td style="font-size:12px;color:#e2e8f0;">${v}</td>
    </tr></table>`).join('')}
  </div>
  <div style="padding:24px 40px;border-top:1px solid rgba(255,255,255,.06);">
    <p style="margin:0 0 16px;font-size:13px;color:#f87171;"><strong>&#9888; Not you?</strong> Secure your account immediately.</p>
    ${cta('Change Password', `${APP_URL}/profile`, '#16a34a')}
  </div>
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.15);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 8 — Cyan/teal, timeline entry style
  ({ userName, email, time, ip }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ecfeff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#ecfeff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(6,182,212,.1);">
  <div style="height:4px;background:linear-gradient(90deg,#06b6d4,#0891b2,#0e7490);"></div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#0e7490;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Account Activity</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0c4a6e;">Sign-In Recorded</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong>${userName}</strong>, here is a timestamped record of your latest sign-in to ${APP_NAME}.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      ${[['Sign-in time',t+' IST','#06b6d4'],['IP address',ip||'Unknown','#0891b2'],['Account',email,'#0e7490']].map(([k,v,col])=>`
      <tr><td style="width:14px;vertical-align:top;padding-top:2px;">
        <div style="width:12px;height:12px;border-radius:50%;background:${col};border:2px solid #e0f2fe;"></div>
      </td><td style="padding-left:12px;padding-bottom:16px;">
        <p style="margin:0 0 1px;font-size:11px;font-weight:700;color:${col};text-transform:uppercase;letter-spacing:.04em;">${k}</p>
        <p style="margin:0;font-size:13px;color:#1e293b;">${v}</p>
      </td></tr>`).join('')}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#cffafe;border-radius:10px;margin-bottom:8px;"><tr><td style="padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#0c4a6e;"><strong>Not you?</strong> <a href="${APP_URL}/profile" style="color:#0e7490;font-weight:700;">Change your password</a> and contact <a href="mailto:${SUPPORT}" style="color:#0e7490;">${SUPPORT}</a></p>
    </td></tr></table>
    ${cta('View Account', `${APP_URL}/profile`, '#0891b2')}
  </div>${footer('Security log generated for every sign-in to your account.')}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 9 — Slate gray, corporate notice style
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,.04);">
  <div style="background:#334155;padding:20px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif;">${APP_NAME} Security Notice</p></td>
      <td style="text-align:right;font-size:11px;color:#94a3b8;font-family:-apple-system,sans-serif;">${new Date().toLocaleDateString('en-IN',{dateStyle:'long'})}</td>
    </tr></table>
  </div>
  <div style="padding:32px 40px;">
    <p style="margin:0 0 16px;font-size:15px;color:#1e293b;line-height:1.7;font-family:-apple-system,sans-serif;">Dear <strong>${userName}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">This is an automated security notification confirming that a successful sign-in was recorded for your <strong>${APP_NAME}</strong> account.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px;font-family:-apple-system,sans-serif;">
      ${[['Date & Time',t+' IST'],['IP Address',ip||'Unknown'],['Device',device||'Web browser'],['Account',email]].map(([k,v],i)=>`
      <tr style="${i>0?'border-top:1px solid #f1f5f9;':''}${i%2===0?'':'background:#fafafa;'}">
        <td style="padding:10px 16px;font-size:12px;color:#64748b;font-weight:600;width:120px;">${k}</td>
        <td style="padding:10px 16px;font-size:12px;color:#1e293b;">${v}</td>
      </tr>`).join('')}
    </table>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">If you did not initiate this sign-in, please change your password immediately and report the incident to <a href="mailto:${SUPPORT}" style="color:#4f46e5;text-decoration:none;">${SUPPORT}</a>.</p>
    ${cta('Access Account Settings', `${APP_URL}/profile`, '#334155')}
  </div>
  <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;text-align:center;font-family:-apple-system,sans-serif;">
    <p style="margin:0;font-size:11px;color:#94a3b8;">This is an automated message. Do not reply to this email.</p>
  </div>
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 10 — Rose/red, bold urgent warning banner
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff5f5;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(220,38,38,.1);">
  <div style="background:#dc2626;padding:12px 40px;text-align:center;">
    <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:.08em;text-transform:uppercase;">&#9888; Security Alert — Action Required</p>
  </div>
  <div style="padding:36px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:56px;line-height:1;">&#128683;</p>
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e293b;">Someone just signed in</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;">to your ${APP_NAME} account</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border:1px solid #fecaca;border-radius:12px;margin-bottom:20px;text-align:left;">
      <tr><td style="padding:20px 24px;">
        ${[['Account',email],['Time',t+' IST'],['Device',device||'Web browser'],['IP',ip||'Unknown']].map(([k,v])=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
          <td style="width:80px;font-size:11px;font-weight:700;color:#dc2626;">${k}</td>
          <td style="font-size:13px;color:#1e293b;font-weight:500;">${v}</td>
        </tr></table>`).join('')}
      </td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">If this was <strong>you</strong>, no action needed. If this was <strong>not you</strong>, change your password right now.</p>
    ${cta('Change Password Now', `${APP_URL}/profile`, '#dc2626')}
  </div>${footer('Security alerts are sent for every successful sign-in.')}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 11 — Full gradient background, floating card
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#1e1b4b,#312e81,#4338ca);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);">
  <div style="padding:36px 40px 24px;text-align:center;">
    <div style="width:64px;height:64px;background:#ede9fe;border-radius:16px;margin:0 auto 16px;line-height:64px;text-align:center;font-size:28px;">&#128737;</div>
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e293b;">Sign-In Notification</h1>
    <p style="margin:0;font-size:13px;color:#64748b;">${APP_NAME} &bull; ${new Date().toLocaleDateString('en-IN',{dateStyle:'long'})}</p>
  </div>
  <div style="padding:0 40px 32px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong style="color:#1e293b;">${userName}</strong>, your account was accessed on <strong>${t} IST</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${[['&#128231;','Account',email],['&#127760;','IP Address',ip||'Unknown'],['&#128187;','Device',device||'Web browser']].map(([ic,k,v])=>`
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:12px 0;font-size:16px;width:28px;">${ic}</td><td style="padding:12px 10px;font-size:12px;font-weight:700;color:#64748b;width:100px;">${k}</td><td style="padding:12px 0;font-size:13px;color:#1e293b;">${v}</td></tr>`).join('')}
    </table>
    <div style="background:#ede9fe;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#4c1d95;"><strong>Not you?</strong> <a href="${APP_URL}/profile" style="color:#6d28d9;font-weight:700;">Change your password</a> right away.</p>
    </div>
    ${cta('Go to Account Settings', `${APP_URL}/profile`, '#4338ca')}
  </div>${footer()}</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.4);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 12 — Compact mobile notification style
  ({ userName, email, time, ip }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;">
<tr><td style="background:#1e293b;border-radius:20px 20px 0 0;padding:16px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-size:13px;font-weight:700;color:#fff;">${APP_NAME}</td>
    <td style="text-align:right;font-size:11px;color:#64748b;">${t} IST</td>
  </tr></table>
</td></tr>
<tr><td style="background:#fff;padding:24px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
    <td style="width:44px;height:44px;background:#fef2f2;border-radius:50%;text-align:center;vertical-align:middle;font-size:22px;">&#128274;</td>
    <td style="padding-left:12px;"><p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1e293b;">New sign-in</p><p style="margin:0;font-size:12px;color:#64748b;">Your account was just accessed</p></td>
  </tr></table>
  <p style="margin:0 0 14px;font-size:13px;color:#475569;line-height:1.6;">Hi ${userName}, a sign-in was recorded from <strong>${ip||'Unknown'}</strong>.</p>
  <p style="margin:0 0 16px;font-size:12px;color:#64748b;">Account: ${email}</p>
  <p style="margin:0 0 16px;font-size:13px;color:#dc2626;font-weight:600;">Not you? <a href="${APP_URL}/profile" style="color:#dc2626;">Change password →</a></p>
  ${cta('Review Sign-In', `${APP_URL}/profile`, '#1e293b')}
</td></tr>
<tr><td style="background:#f8fafc;border-radius:0 0 20px 20px;padding:14px 20px;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">&copy; ${YEAR} ${APP_NAME}</p>
</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 13 — Teal security icon grid
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdfa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(20,184,166,.1);border:1px solid #99f6e4;">
  <div style="background:linear-gradient(90deg,#134e4a,#0f766e,#14b8a6);padding:24px 40px;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#ccfbf1;letter-spacing:.06em;text-transform:uppercase;">&#128737; ${APP_NAME} &bull; Security Alert</p>
  </div>
  <div style="padding:32px 40px;">
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#134e4a;">New Login to Your Account</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#0f766e;line-height:1.7;">Hi <strong>${userName}</strong> — here&rsquo;s a full report of this sign-in.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${[['&#128336;','When',t+' IST'],['&#127760;','Where',ip||'Unknown'],['&#128187;','Device',device||'Web browser'],['&#128231;','Account',email]].map(([ic,k,v])=>`
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0fdfa;vertical-align:middle;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:36px;height:36px;background:#f0fdfa;border-radius:50%;text-align:center;vertical-align:middle;font-size:18px;">${ic}</td>
          <td style="padding-left:12px;"><p style="margin:0 0 1px;font-size:11px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.04em;">${k}</p><p style="margin:0;font-size:13px;color:#1e293b;">${v}</p></td>
        </tr></table>
      </td></tr>`).join('')}
    </table>
    <div style="background:#ccfbf1;border-radius:10px;padding:14px 18px;margin:20px 0 8px;">
      <p style="margin:0;font-size:13px;color:#134e4a;"><strong>Not you?</strong> Secure your account — <a href="${APP_URL}/profile" style="color:#0f766e;font-weight:700;">change password now</a>.</p>
    </div>
    ${cta('View Account Activity', `${APP_URL}/profile`, '#14b8a6')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 14 — Minimal white, centered message, no decorations
  ({ userName, email, time, ip }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="padding-bottom:32px;text-align:center;border-bottom:1px solid #e2e8f0;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">${APP_NAME}</p>
</td></tr>
<tr><td style="padding:36px 0;">
  <p style="margin:0 0 12px;font-size:15px;color:#1e293b;line-height:1.7;">Hi ${userName},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.8;">We detected a new sign-in to your ${APP_NAME} account on <strong>${t} IST</strong> from <strong>${ip||'an unknown IP'}</strong>.</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.8;">If this was you, you can safely ignore this message.</p>
  <p style="margin:0 0 28px;font-size:15px;color:#dc2626;line-height:1.8;"><strong>If this wasn&rsquo;t you</strong>, please change your password immediately using the link below.</p>
  ${cta('Change My Password', `${APP_URL}/profile`, '#1e293b')}
  <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">Account: ${email}</p>
</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">
  <p style="margin:0;font-size:11px;color:#cbd5e1;">&copy; ${YEAR} ${APP_NAME} &mdash; <a href="mailto:${SUPPORT}" style="color:#94a3b8;text-decoration:none;">${SUPPORT}</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 15 — Navy + gold accent, bold large IP display
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0c1a2e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#0c1a2e;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#112240;border-radius:20px;overflow:hidden;border:1px solid #1d3461;">
  <div style="padding:32px 40px;border-bottom:1px solid #1d3461;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#d4a017;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Security</p><p style="margin:0;color:#f8fafc;font-size:20px;font-weight:800;">Sign-In Alert</p></td>
      <td style="text-align:right;"><p style="margin:0;font-size:11px;color:#64748b;">${t} IST</p></td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;text-align:center;border-bottom:1px solid #1d3461;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#d4a017;letter-spacing:.08em;text-transform:uppercase;">IP Address</p>
    <p style="margin:0;font-size:32px;font-weight:800;color:#f8fafc;font-family:monospace;letter-spacing:1px;">${ip||'Unknown'}</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#94a3b8;line-height:1.7;">Hi <strong style="color:#f8fafc;">${userName}</strong>, your ${APP_NAME} account was accessed. Device: <strong style="color:#f8fafc;">${device||'Web browser'}</strong>. Account: <strong style="color:#f8fafc;">${email}</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1d3461;border-radius:10px;margin-bottom:16px;"><tr><td style="padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#fca5a5;"><strong>&#9888; Not you?</strong> Change your password at <a href="${APP_URL}/profile" style="color:#f87171;text-decoration:underline;">${APP_URL}/profile</a></p>
    </td></tr></table>
    ${cta('Secure Account', `${APP_URL}/profile`, '#d4a017', '#0c1a2e')}
  </div>
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:#1d3461;">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 16 — Warm sand, friendly but security-focused
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fafaf9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.06);border:1px solid #e7e5e4;">
  <div style="padding:32px 40px 0;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#1c1917;">${APP_NAME}</p>
    <p style="margin:0 0 20px;font-size:12px;color:#a8a29e;">${t} IST</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
      <td style="width:50px;height:50px;background:#fef2f2;border-radius:12px;text-align:center;vertical-align:middle;font-size:24px;">&#128274;</td>
      <td style="padding-left:14px;"><p style="margin:0 0 2px;font-size:17px;font-weight:800;color:#1c1917;">Heads up, ${userName}!</p><p style="margin:0;font-size:13px;color:#78716c;">Someone signed into your account</p></td>
    </tr></table>
    <p style="margin:0 0 20px;font-size:14px;color:#57534e;line-height:1.75;">We wanted to let you know that a new sign-in was just recorded for your ${APP_NAME} account. Was this you?</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        ${[['Device',device||'Web browser'],['IP Address',ip||'Unknown'],['Account',email]].map(([k,v])=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
          <td style="width:90px;font-size:12px;color:#78716c;font-weight:600;">${k}</td>
          <td style="font-size:12px;color:#1c1917;">${v}</td>
        </tr></table>`).join('')}
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td style="width:50%;padding-right:6px;">${cta('Yes, that was me', `${APP_URL}/dashboard`, '#57534e')}</td>
        <td style="width:50%;padding-left:6px;">${cta('No, change password', `${APP_URL}/profile`, '#dc2626')}</td>
      </tr>
    </table>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 17 — Violet, notification bell header, dense info
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f5f3ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(109,40,217,.1);">
  <div style="background:linear-gradient(135deg,#2e1065,#5b21b6,#7c3aed);padding:32px 40px;text-align:center;">
    <p style="margin:0 0 10px;font-size:36px;line-height:1;">&#128276;</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:20px;font-weight:800;">Login Alert</h1>
    <p style="margin:0;color:#ddd6fe;font-size:12px;">${t} IST</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong style="color:#1e293b;">${userName}</strong>, we noticed a new sign-in to your ${APP_NAME} account. If this was you, great — you can ignore this. If not, take action immediately.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ede9fe;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      ${[['Account',email],['IP Address',ip||'Unknown'],['Device',device||'Web browser']].map(([k,v],i)=>`
      <tr style="${i>0?'border-top:1px solid #f5f3ff;':''}"><td style="padding:10px 16px;font-size:12px;color:#6d28d9;font-weight:700;width:100px;">${k}</td><td style="padding:10px 16px;font-size:12px;color:#1e293b;">${v}</td></tr>`).join('')}
    </table>
    <div style="background:#ede9fe;border-radius:10px;padding:14px 18px;margin-bottom:16px;">
      <p style="margin:0;font-size:13px;color:#4c1d95;"><strong>Was this you?</strong> If yes, no action needed. If no, <a href="${APP_URL}/profile" style="color:#6d28d9;font-weight:700;">change your password now</a>.</p>
    </div>
    ${cta('Go to Security Settings', `${APP_URL}/profile`, '#7c3aed')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 18 — Dark red/maroon emergency style
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#1a0000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#1a0000;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#2d0000;border-radius:20px;overflow:hidden;border:1px solid #7f1d1d;">
  <div style="background:linear-gradient(90deg,#7f1d1d,#991b1b,#b91c1c);padding:16px 40px;text-align:center;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#fff;letter-spacing:.1em;text-transform:uppercase;">&#9888; SECURITY ALERT &bull; ${APP_NAME}</p>
  </div>
  <div style="padding:36px 40px;">
    <h1 style="margin:0 0 16px;color:#fecaca;font-size:22px;font-weight:800;">Account Access Detected</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#fca5a5;line-height:1.7;">Hi <strong>${userName}</strong>, a sign-in event was recorded for your ${APP_NAME} account on <strong>${t} IST</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#3d0000;border:1px solid #7f1d1d;border-radius:12px;margin-bottom:20px;">
      ${[['Account',email],['IP Address',ip||'Unknown'],['Device',device||'Web browser'],['Status','Authenticated']].map(([k,v])=>`
      <tr style="border-bottom:1px solid #7f1d1d;"><td style="padding:10px 16px;font-size:11px;color:#f87171;font-weight:700;width:100px;text-transform:uppercase;">${k}</td><td style="padding:10px 16px;font-size:12px;color:#fecaca;">${v}</td></tr>`).join('')}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#7f1d1d;border-radius:10px;margin-bottom:16px;"><tr><td style="padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#fecaca;"><strong>Not you?</strong> Your account may be compromised. Change your password immediately and contact <a href="mailto:${SUPPORT}" style="color:#f87171;">${SUPPORT}</a>.</p>
    </td></tr></table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td style="border-radius:10px;background:#ef4444;"><a href="${APP_URL}/profile" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:10px;">Secure My Account &rarr;</a></td></tr>
    </table>
  </div>
  <div style="padding:16px 40px;border-top:1px solid #7f1d1d;text-align:center;"><p style="margin:0;font-size:11px;color:#7f1d1d;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 19 — Green "all good if it's you" reassuring style
  ({ userName, email, time, ip }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(22,163,74,.1);border:1px solid #bbf7d0;">
  <div style="background:linear-gradient(135deg,#14532d,#15803d,#16a34a);padding:32px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:36px;line-height:1;">&#9989;</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:20px;font-weight:800;">Successful Sign-In</h1>
    <p style="margin:0;color:#bbf7d0;font-size:12px;">${t} IST</p>
  </div>
  <div style="padding:28px 40px;text-align:center;">
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.75;">Hi <strong style="color:#1e293b;">${userName}</strong>, just a quick check — your ${APP_NAME} account was signed into. If this was you, you&rsquo;re all good! No action needed.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;text-align:left;">
      ${[['Account',email],['IP',ip||'Unknown']].map(([k,v])=>`
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
        <td style="width:80px;font-size:12px;color:#15803d;font-weight:700;">${k}</td>
        <td style="font-size:12px;color:#1e293b;">${v}</td>
      </tr></table>`).join('')}
    </div>
    <div style="border-top:1px dashed #bbf7d0;padding-top:16px;margin-bottom:16px;">
      <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600;">&#9888; Wasn&rsquo;t you? <a href="${APP_URL}/profile" style="color:#dc2626;">Change your password</a> and contact us.</p>
    </div>
    ${cta('All good — Go to Dashboard', `${APP_URL}/dashboard`, '#16a34a')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 20 — Orange bold, prominent warning style
  ({ userName, email, time, ip, device }) => {
    const t = time ? new Date(time).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'medium'}) : new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'long',timeStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff7ed;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,.12);">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="background:linear-gradient(180deg,#ea580c,#f97316);width:8px;">&nbsp;</td>
    <td style="padding:36px 32px;">
      <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#ea580c;letter-spacing:.08em;text-transform:uppercase;">&#9888; ${APP_NAME} &bull; Login Notification</p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#1c1917;line-height:1.2;">New sign-in<br/>detected, ${userName}</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#57534e;line-height:1.7;">A successful sign-in was recorded for your account on ${t} IST.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin-bottom:20px;">
        <tr><td style="padding:16px 18px;">
          ${[['Account',email],['Location',ip||'Unknown'],['Device',device||'Web browser']].map(([k,v])=>`
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
            <td style="width:80px;font-size:11px;font-weight:700;color:#c2410c;">${k}</td>
            <td style="font-size:12px;color:#1c1917;">${v}</td>
          </tr></table>`).join('')}
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:13px;color:#dc2626;">If this wasn&rsquo;t you: <a href="${APP_URL}/profile" style="color:#dc2626;font-weight:700;">change your password immediately</a></p>
      ${cta('Review Account', `${APP_URL}/profile`, '#ea580c')}
    </td>
  </tr></table>
  ${footer('Login alerts fire for every successful sign-in to your account.')}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// REMINDER DIGEST  (20 variants)
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

  // Variant 6 — Bold total hero, compact list below
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const today = new Date().toISOString().split('T')[0];
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9);padding:44px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;">${period} Payment Alert</p>
    <p style="margin:4px 0 2px;font-size:48px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1;">${fmtINR(total)}</p>
    <p style="margin:0;color:#7dd3fc;font-size:13px;">due across ${reminders.length} reminder${reminders.length!==1?'s':''}</p>
  </div>
  <div style="padding:32px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.6;">Hi <strong style="color:#1e293b;">${userName}</strong>, here are the payments scheduled for ${period.toLowerCase()}:</p>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border-bottom:1px solid #f1f5f9;padding-bottom:10px;"><tr>
      <td><div style="width:8px;height:8px;border-radius:50%;background:${moduleColor(r.module)};display:inline-block;margin-right:8px;vertical-align:middle;"></div><span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span><br/><span style="font-size:11px;color:#94a3b8;margin-left:16px;">${r.category} &bull; ${r.dueDate<today?'<span style="color:#dc2626;">Overdue</span>':'Due '+r.dueDate}</span></td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#0c4a6e;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Pay & Mark Complete', `${APP_URL}/reminders`, '#0369a1')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 7 — Dark slate, receipt style with footer total
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#1e293b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#1e293b;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid #334155;">
  <div style="padding:28px 40px;border-bottom:1px solid #334155;">
    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:.1em;text-transform:uppercase;">${APP_NAME} &bull; ${period} Digest</p>
    <h1 style="margin:0;color:#f8fafc;font-size:22px;font-weight:800;">Payment Schedule</h1>
  </div>
  <div style="padding:24px 40px 0;">
    <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${userName}</strong> — ${reminders.length} payment${reminders.length!==1?'s are':' is'} due. Please ensure timely completion.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #334155;border-radius:10px;overflow:hidden;">
      ${reminders.map((r,i)=>`
      <tr style="${i>0?'border-top:1px solid #1e293b;':''}background:${i%2===0?'#0f172a':'#1a2537'};">
        <td style="padding:12px 16px;">
          <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#e2e8f0;">${r.title}</p>
          <p style="margin:0;font-size:11px;color:#64748b;">${r.module} &bull; ${r.dueDate}</p>
        </td>
        <td style="padding:12px 16px;text-align:right;font-size:14px;font-weight:700;color:#a78bfa;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr>`).join('')}
      <tr style="background:#1e1b4b;border-top:2px solid #4338ca;">
        <td style="padding:14px 16px;font-size:13px;font-weight:700;color:#a5b4fc;">Total Due</td>
        <td style="padding:14px 16px;text-align:right;font-size:18px;font-weight:900;color:#fff;">${fmtINR(total)}</td>
      </tr>
    </table>
  </div>
  <div style="padding:24px 40px 32px;">${cta('Open Reminders', `${APP_URL}/reminders`, '#6366f1')}</div>
  <div style="padding:16px 40px;border-top:1px solid #334155;text-align:center;"><p style="margin:0;font-size:11px;color:#334155;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 8 — Emerald, numbered checklist with progress indicator
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(16,185,129,.1);border:1px solid #a7f3d0;">
  <div style="height:4px;background:linear-gradient(90deg,#10b981,#059669,#047857);"></div>
  <div style="padding:32px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;"><tr>
      <td><h1 style="margin:0;font-size:22px;font-weight:800;color:#1e293b;">${period} Checklist</h1></td>
      <td style="text-align:right;"><span style="font-size:20px;font-weight:800;color:#059669;">${fmtINR(total)}</span></td>
    </tr></table>
    <p style="margin:0 0 20px;font-size:13px;color:#059669;">Hi ${userName} — ${reminders.length} item${reminders.length!==1?'s':''} to complete</p>
    <div style="height:6px;background:#d1fae5;border-radius:3px;margin-bottom:24px;"><div style="height:6px;background:linear-gradient(90deg,#10b981,#059669);border-radius:3px;width:0%;"></div></div>
  </div>
  <div style="padding:0 40px 32px;">
    ${reminders.map((r,i)=>`
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:12px;"><tr>
      <td style="width:32px;height:32px;border:2px solid #10b981;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;font-weight:900;color:#059669;min-width:32px;">${i+1}</td>
      <td style="padding-left:14px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><p style="margin:0 0 1px;font-size:13px;font-weight:700;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#6b7280;">${r.module} &bull; ${r.dueDate}</p></td>
          <td style="text-align:right;font-size:14px;font-weight:700;color:#059669;white-space:nowrap;">${fmtINR(r.amount)}</td>
        </tr></table>
      </td>
    </tr></table>`).join('')}
    <div style="border-top:2px dashed #a7f3d0;margin:16px 0;padding-top:16px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:14px;font-weight:700;color:#065f46;">Total to complete</td>
        <td style="text-align:right;font-size:20px;font-weight:800;color:#059669;">${fmtINR(total)}</td>
      </tr></table>
    </div>
    ${cta('Mark as Paid', `${APP_URL}/reminders`, '#059669')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 9 — Corporate gray, letterhead memo style
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const today = new Date().toLocaleDateString('en-IN',{dateStyle:'long'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="border-bottom:2px solid #334155;padding:24px 48px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:16px;font-weight:700;color:#1e293b;font-family:-apple-system,sans-serif;">${APP_NAME}</p></td>
      <td style="text-align:right;font-size:11px;color:#64748b;font-family:-apple-system,sans-serif;">${today}</td>
    </tr></table>
  </div>
  <div style="padding:32px 48px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#475569;font-family:-apple-system,sans-serif;text-transform:uppercase;letter-spacing:.05em;">Payment Digest — ${period}</p>
    <p style="margin:0 0 6px;font-size:11px;color:#64748b;font-family:-apple-system,sans-serif;">To: <strong>${userName}</strong></p>
    <p style="margin:0 0 20px;font-size:11px;color:#64748b;font-family:-apple-system,sans-serif;">Re: ${reminders.length} Payment Obligation${reminders.length!==1?'s':''} &bull; Total: ${fmtINR(total)}</p>
    <div style="border-top:1px solid #e2e8f0;padding-top:20px;">
      <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.85;font-family:-apple-system,sans-serif;">The following payment obligations are scheduled for the ${period.toLowerCase()} period. Please ensure each is settled by its due date to avoid late payment penalties.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:-apple-system,sans-serif;margin-bottom:20px;">
        <tr style="border-bottom:2px solid #334155;"><th style="text-align:left;padding:8px 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Description</th><th style="text-align:center;padding:8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Module</th><th style="text-align:right;padding:8px 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Amount</th></tr>
        ${reminders.map(r=>`
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 0;"><p style="margin:0 0 1px;font-size:13px;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#94a3b8;">Due ${r.dueDate}</p></td>
          <td style="padding:10px 8px;text-align:center;font-size:11px;color:#475569;">${r.module}</td>
          <td style="padding:10px 0;text-align:right;font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap;">${fmtINR(r.amount)}</td>
        </tr>`).join('')}
        <tr style="border-top:2px solid #334155;"><td colspan="2" style="padding:12px 0;font-size:13px;font-weight:700;color:#1e293b;">Total Due</td><td style="padding:12px 0;text-align:right;font-size:16px;font-weight:800;color:#1e293b;">${fmtINR(total)}</td></tr>
      </table>
      ${cta('Access Reminders', `${APP_URL}/reminders`, '#334155')}
    </div>
  </div>
  <div style="background:#f8fafc;padding:16px 48px;border-top:1px solid #e2e8f0;text-align:center;font-family:-apple-system,sans-serif;"><p style="margin:0;font-size:11px;color:#94a3b8;">Automated digest from ${APP_NAME} &mdash; <a href="mailto:${SUPPORT}" style="color:#64748b;text-decoration:none;">${SUPPORT}</a></p></div>
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 10 — Rose gradient, left-border card per reminder
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff1f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff1f2;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,.1);">
  <div style="background:linear-gradient(135deg,#881337,#be123c,#f43f5e);padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><h1 style="margin:0 0 4px;color:#fff;font-size:20px;font-weight:800;">${period} Payment Reminder</h1><p style="margin:0;color:#fecdd3;font-size:12px;">Hi ${userName} &mdash; ${reminders.length} item${reminders.length!==1?'s':''} need attention</p></td>
      <td style="text-align:right;"><p style="margin:0;font-size:26px;font-weight:800;color:#fff;">${fmtINR(total)}</p></td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;background:#fafafa;border-radius:10px;overflow:hidden;"><tr>
      <td style="width:4px;background:${moduleColor(r.module)};">&nbsp;</td>
      <td style="padding:12px 14px;"><p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#94a3b8;">${r.module} &bull; ${r.category} &bull; Due ${r.dueDate}</p></td>
      <td style="padding:12px 14px;text-align:right;font-size:14px;font-weight:700;color:#be123c;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    <div style="border-top:2px solid #fecdd3;padding-top:16px;margin-top:8px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:14px;font-weight:700;color:#1e293b;">Total</td>
        <td style="text-align:right;font-size:20px;font-weight:800;color:#f43f5e;">${fmtINR(total)}</td>
      </tr></table>
    </div>
    ${cta('View & Complete', `${APP_URL}/reminders`, '#f43f5e')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 11 — Full gradient background, module grouped
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const grouped = {};
    reminders.forEach(r=>{ if(!grouped[r.module]) grouped[r.module]=[]; grouped[r.module].push(r); });
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#0f172a,#1e1b4b,#312e81);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:rgba(255,255,255,.95);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4);">
  <div style="padding:32px 40px 24px;border-bottom:1px solid #f1f5f9;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:.08em;text-transform:uppercase;">${period} Digest</p>
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#1e293b;">${fmtINR(total)} due ${period.toLowerCase()}</h1>
    <p style="margin:0;font-size:13px;color:#64748b;">Hi ${userName} &mdash; ${reminders.length} payment${reminders.length!==1?'s':''} across ${Object.keys(grouped).length} module${Object.keys(grouped).length!==1?'s':''}</p>
  </div>
  <div style="padding:24px 40px 32px;">
    ${Object.entries(grouped).map(([mod,items])=>{
      const modTotal=items.reduce((s,r)=>s+r.amount,0);
      return `<div style="margin-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
          <td><span style="font-size:11px;font-weight:700;color:${moduleColor(mod)};letter-spacing:.06em;text-transform:uppercase;">&#9632; ${mod}</span></td>
          <td style="text-align:right;font-size:12px;font-weight:700;color:${moduleColor(mod)};">${fmtINR(modTotal)}</td>
        </tr></table>
        ${items.map(r=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;background:#f8fafc;border-radius:8px;padding:10px 14px;"><tr>
          <td style="font-size:13px;color:#1e293b;">${r.title}<span style="color:#94a3b8;font-size:11px;"> &bull; ${r.dueDate}</span></td>
          <td style="text-align:right;font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap;">${fmtINR(r.amount)}</td>
        </tr></table>`).join('')}
      </div>`;
    }).join('')}
    ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#6366f1')}
  </div>${footer()}
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.3);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 12 — Amber/warm, side-by-side amount + details
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fefce8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fefce8;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(234,179,8,.12);border:1px solid #fef08a;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:180px;background:linear-gradient(180deg,#713f12,#a16207,#ca8a04);padding:36px 24px;text-align:center;vertical-align:middle;">
        <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.06em;">${period}</p>
        <p style="margin:0 0 2px;font-size:32px;font-weight:900;color:#fff;letter-spacing:-1px;">${fmtINR(total)}</p>
        <p style="margin:0;font-size:12px;color:#fef08a;">${reminders.length} payment${reminders.length!==1?'s':''}</p>
      </td>
      <td style="padding:24px 28px;vertical-align:top;">
        <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#713f12;">Hi ${userName},</p>
        ${reminders.slice(0,6).map(r=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #fef9c3;"><tr>
          <td><span style="font-size:12px;font-weight:600;color:#1c1917;">${r.title}</span><br/><span style="font-size:10px;color:#a8a29e;">${r.dueDate}</span></td>
          <td style="text-align:right;font-size:12px;font-weight:700;color:#a16207;white-space:nowrap;">${fmtINR(r.amount)}</td>
        </tr></table>`).join('')}
        ${reminders.length>6?`<p style="margin:4px 0 8px;font-size:11px;color:#a8a29e;">+${reminders.length-6} more reminder${reminders.length-6!==1?'s':''}</p>`:''}
        ${cta('View All', `${APP_URL}/reminders`, '#ca8a04')}
      </td>
    </tr>
  </table>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 13 — Teal, compact mobile-first dense list
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;background:#f0fdfa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;">
<tr><td style="background:#0f766e;border-radius:16px 16px 0 0;padding:18px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#fff;">${APP_NAME} &bull; ${period}</p><p style="margin:0;font-size:11px;color:#99f6e4;">${reminders.length} payment${reminders.length!==1?'s':''}</p></td>
    <td style="text-align:right;"><p style="margin:0;font-size:22px;font-weight:800;color:#fff;">${fmtINR(total)}</p></td>
  </tr></table>
</td></tr>
<tr><td style="background:#fff;padding:16px 20px;">
  <p style="margin:0 0 14px;font-size:13px;color:#475569;">Hi ${userName}, here&rsquo;s your ${period.toLowerCase()} summary:</p>
  ${reminders.map((r,i)=>`
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;padding:10px 0;${i>0?'border-top:1px solid #f0fdfa;':''}"><tr>
    <td style="vertical-align:middle;">
      <div style="width:8px;height:8px;border-radius:50%;background:${moduleColor(r.module)};display:inline-block;vertical-align:middle;margin-right:6px;"></div>
      <span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span>
      <br/><span style="font-size:11px;color:#94a3b8;margin-left:14px;">${r.dueDate}</span>
    </td>
    <td style="text-align:right;font-size:13px;font-weight:700;color:#0f766e;white-space:nowrap;">${fmtINR(r.amount)}</td>
  </tr></table>`).join('')}
  <div style="border-top:2px solid #99f6e4;margin-top:12px;padding-top:12px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:13px;font-weight:700;color:#134e4a;">Total</td>
      <td style="text-align:right;font-size:16px;font-weight:800;color:#0f766e;">${fmtINR(total)}</td>
    </tr></table>
  </div>
  ${cta('Pay Now', `${APP_URL}/reminders`, '#0f766e')}
</td></tr>
<tr><td style="background:#f0fdfa;border-radius:0 0 16px 16px;padding:12px 20px;text-align:center;border-top:1px solid #ccfbf1;">
  <p style="margin:0;font-size:11px;color:#5eead4;">&copy; ${YEAR} ${APP_NAME}</p>
</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 14 — White minimal, icon-accent list
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="padding-bottom:24px;border-bottom:2px solid #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><p style="margin:0;font-size:15px;font-weight:800;color:#1e293b;">${APP_NAME}</p></td>
    <td style="text-align:right;font-size:12px;color:#64748b;">${period} Payment Digest</td>
  </tr></table>
</td></tr>
<tr><td style="padding:28px 0;">
  <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1e293b;">Hi ${userName},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.7;">You have <strong style="color:#1e293b;">${reminders.length} payment${reminders.length!==1?'s':''}</strong> due ${period.toLowerCase()} totalling <strong style="color:#1e293b;">${fmtINR(total)}</strong>.</p>
  ${reminders.map((r,i)=>`
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;${i>0?'padding-top:16px;border-top:1px solid #f1f5f9;':''}"><tr>
    <td style="width:40px;height:40px;background:#f1f5f9;border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;">&#128197;</td>
    <td style="padding-left:14px;">
      <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1e293b;">${r.title}</p>
      <p style="margin:0;font-size:12px;color:#64748b;">${r.module} &bull; ${r.dueDate}</p>
    </td>
    <td style="text-align:right;font-size:16px;font-weight:800;color:#1e293b;white-space:nowrap;">${fmtINR(r.amount)}</td>
  </tr></table>`).join('')}
  <div style="border-top:2px solid #1e293b;padding-top:16px;margin-top:8px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:14px;font-weight:700;color:#1e293b;">Total</td>
      <td style="text-align:right;font-size:22px;font-weight:800;color:#1e293b;">${fmtINR(total)}</td>
    </tr></table>
  </div>
  ${cta('View in Dashboard', `${APP_URL}/reminders`, '#1e293b')}
</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">
  <p style="margin:0;font-size:11px;color:#cbd5e1;">&copy; ${YEAR} ${APP_NAME} &mdash; <a href="mailto:${SUPPORT}" style="color:#94a3b8;text-decoration:none;">${SUPPORT}</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 15 — Violet, bold large title, no table header
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#faf5ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,.1);">
  <div style="background:linear-gradient(135deg,#2e1065,#6d28d9,#7c3aed);padding:36px 40px;">
    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#ddd6fe;letter-spacing:.08em;text-transform:uppercase;">${period} Digest</p>
    <p style="margin:0 0 8px;font-size:36px;font-weight:900;color:#fff;letter-spacing:-1px;line-height:1;">${fmtINR(total)}</p>
    <p style="margin:0;font-size:13px;color:#ddd6fe;">Hi ${userName} &mdash; ${reminders.length} item${reminders.length!==1?'s require':' requires'} payment</p>
  </div>
  <div style="padding:28px 40px 32px;">
    ${reminders.map((r,i)=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="${i>0?'border-top:1px solid #f5f3ff;':''}padding:12px 0;"><tr>
      <td style="vertical-align:middle;padding:2px 0;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${moduleColor(r.module)};vertical-align:middle;margin-right:8px;"></span>
        <span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span>
        <br/><span style="font-size:11px;color:#94a3b8;margin-left:18px;">${r.category} &bull; Due ${r.dueDate}</span>
      </td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#7c3aed;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    <div style="background:#f5f3ff;border-radius:12px;padding:14px 18px;margin-top:20px;margin-bottom:4px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:13px;font-weight:700;color:#4c1d95;">Grand Total</td>
        <td style="text-align:right;font-size:18px;font-weight:800;color:#7c3aed;">${fmtINR(total)}</td>
      </tr></table>
    </div>
    ${cta('View Reminders', `${APP_URL}/reminders`, '#7c3aed')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 16 — Sky blue, 3-column stat chips at top
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const today = new Date().toISOString().split('T')[0];
    const overdue = reminders.filter(r=>r.dueDate<today).length;
    const modules = [...new Set(reminders.map(r=>r.module))].length;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,165,233,.1);">
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9);padding:28px 40px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;">${period} Payment Summary</p>
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Hi ${userName}!</h1>
  </div>
  <div style="padding:20px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        ${[['Total Due',fmtINR(total),'#0ea5e9'],['Reminders',String(reminders.length),'#6366f1'],['Modules',String(modules),'#10b981'],['Overdue',String(overdue),overdue>0?'#dc2626':'#10b981']].map(([l,v,c])=>`
        <td style="text-align:center;padding:0 4px;">
          <div style="background:#f8fafc;border-radius:10px;padding:12px 6px;">
            <p style="margin:0 0 2px;font-size:18px;font-weight:800;color:${c};">${v}</p>
            <p style="margin:0;font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">${l}</p>
          </div>
        </td>`).join('')}
      </tr>
    </table>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;border:1px solid #e0f2fe;border-radius:10px;overflow:hidden;"><tr>
      <td style="width:4px;background:${moduleColor(r.module)};">&nbsp;</td>
      <td style="padding:10px 14px;"><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#64748b;">${r.dueDate}</p></td>
      <td style="padding:10px 14px;text-align:right;font-size:14px;font-weight:700;color:#0369a1;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Open Reminders', `${APP_URL}/reminders`, '#0369a1')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 17 — Dark navy, payment schedule list
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#020617;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid #1e293b;">
  <div style="padding:28px 40px;border-bottom:1px solid #1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#3b82f6;font-family:monospace;letter-spacing:.06em;">${period.toUpperCase()}_DIGEST</p><p style="margin:0;color:#f8fafc;font-size:20px;font-weight:800;">Payment Schedule</p></td>
      <td style="text-align:right;"><p style="margin:0;font-size:28px;font-weight:900;color:#3b82f6;">${fmtINR(total)}</p></td>
    </tr></table>
  </div>
  <div style="padding:24px 40px;">
    <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Hi <strong style="color:#e2e8f0;">${userName}</strong> — ${reminders.length} payment${reminders.length!==1?'s':''} scheduled:</p>
    ${reminders.map((r,i)=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="${i>0?'border-top:1px solid #1e293b;':''}padding:12px 0;"><tr>
      <td style="width:6px;height:40px;vertical-align:middle;"><div style="width:4px;height:4px;border-radius:50%;background:${moduleColor(r.module)};margin:0 auto;"></div></td>
      <td style="padding:0 10px;"><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#e2e8f0;">${r.title}</p><p style="margin:0;font-size:10px;color:#475569;font-family:monospace;">${r.dueDate} &bull; ${r.module}</p></td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#3b82f6;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    <div style="border-top:1px solid #3b82f6;margin-top:12px;padding-top:12px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:13px;color:#64748b;font-family:monospace;">TOTAL_DUE</td>
        <td style="text-align:right;font-size:20px;font-weight:800;color:#fff;">${fmtINR(total)}</td>
      </tr></table>
    </div>
    ${cta('Process Payments', `${APP_URL}/reminders`, '#3b82f6')}
  </div>
  <div style="padding:16px 40px;border-top:1px solid #1e293b;text-align:center;"><p style="margin:0;font-size:11px;color:#1e293b;font-family:monospace;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 18 — Warm green, amounts on left with visual bars
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const maxAmt = Math.max(...reminders.map(r=>r.amount));
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f7fee7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f7fee7;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(101,163,13,.1);border:1px solid #d9f99d;">
  <div style="background:linear-gradient(135deg,#1a2e05,#365314,#4d7c0f);padding:32px 40px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;">${period} Digest</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:800;">Hi ${userName} — ${reminders.length} due</h1>
    <p style="margin:0;font-size:28px;font-weight:900;color:#bef264;">${fmtINR(total)}</p>
  </div>
  <div style="padding:28px 40px 32px;">
    ${reminders.map(r=>{
      const pct=Math.round((r.amount/maxAmt)*100);
      return `
    <div style="margin-bottom:14px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;"><tr>
        <td style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</td>
        <td style="text-align:right;font-size:13px;font-weight:700;color:#4d7c0f;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr></table>
      <div style="height:5px;background:#f0fdf4;border-radius:3px;"><div style="height:5px;background:linear-gradient(90deg,#65a30d,#4d7c0f);border-radius:3px;width:${pct}%;"></div></div>
      <p style="margin:2px 0 0;font-size:10px;color:#94a3b8;">${r.module} &bull; ${r.dueDate}</p>
    </div>`;}).join('')}
    ${cta('Complete Payments', `${APP_URL}/reminders`, '#65a30d')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 19 — Slate dark + colored total box
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="height:5px;background:linear-gradient(90deg,#f43f5e,#fb923c,#facc15,#4ade80,#22d3ee,#818cf8);"></div>
  <div style="padding:28px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
      <td><h1 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#1e293b;">${period} Payment Digest</h1><p style="margin:0;font-size:13px;color:#64748b;">Hi ${userName} — ${reminders.length} item${reminders.length!==1?'s':''} pending</p></td>
      <td style="text-align:right;">
        <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);border-radius:12px;padding:10px 16px;display:inline-block;">
          <p style="margin:0 0 1px;font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.05em;">Total</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#fff;white-space:nowrap;">${fmtINR(total)}</p>
        </div>
      </td>
    </tr></table>
  </div>
  <div style="padding:0 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <tr style="background:#f8fafc;"><th style="padding:10px 14px;text-align:left;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Payment</th><th style="padding:10px 14px;text-align:center;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Due</th><th style="padding:10px 14px;text-align:right;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Amount</th></tr>
      ${reminders.map((r,i)=>`
      <tr style="${i>0?'border-top:1px solid #f1f5f9;':''}">
        <td style="padding:11px 14px;"><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:10px;color:#94a3b8;">${r.module}</p></td>
        <td style="padding:11px 14px;text-align:center;font-size:12px;color:#475569;">${r.dueDate}</td>
        <td style="padding:11px 14px;text-align:right;font-size:14px;font-weight:700;color:#1d4ed8;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr>`).join('')}
    </table>
    ${cta('View & Complete', `${APP_URL}/reminders`, '#1d4ed8')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 20 — Newspaper / newsletter minimal text style
  ({ userName, reminders, period }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const today = new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 24px;background:#fafaf9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="border-bottom:3px double #1c1917;padding-bottom:14px;text-align:center;">
  <p style="margin:0 0 2px;font-size:22px;font-weight:700;color:#1c1917;letter-spacing:.02em;">${APP_NAME}</p>
  <p style="margin:0;font-size:11px;color:#78716c;letter-spacing:.06em;text-transform:uppercase;">${period} Payment Bulletin &bull; ${today}</p>
</td></tr>
<tr><td style="padding:24px 0;">
  <p style="margin:0 0 16px;font-size:15px;color:#1c1917;line-height:1.75;font-family:-apple-system,sans-serif;">Dear ${userName},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#44403c;line-height:1.85;font-family:-apple-system,sans-serif;">The following <strong>${reminders.length} payment obligation${reminders.length!==1?'s':''}</strong> are scheduled for the ${period.toLowerCase()} period, with a combined total of <strong>${fmtINR(total)}</strong>. Please arrange payment by each due date to avoid late fees.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1c1917;font-family:-apple-system,sans-serif;margin-bottom:20px;">
    ${reminders.map((r,i)=>`
    <tr style="border-bottom:1px solid ${i<reminders.length-1?'#e7e5e4':'#1c1917'};">
      <td style="padding:10px 0;font-size:14px;color:#1c1917;">
        <strong>${r.title}</strong><br/>
        <span style="font-size:12px;color:#78716c;">${r.module} &bull; ${r.category} &bull; Due ${r.dueDate}</span>
      </td>
      <td style="padding:10px 0;text-align:right;font-size:15px;font-weight:700;color:#1c1917;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr>`).join('')}
    <tr><td style="padding:12px 0;font-size:15px;font-weight:700;color:#1c1917;">Total Due</td><td style="padding:12px 0;text-align:right;font-size:18px;font-weight:800;color:#1c1917;">${fmtINR(total)}</td></tr>
  </table>
  ${cta('Access Reminders', `${APP_URL}/reminders`, '#1c1917')}
</td></tr>
<tr><td style="border-top:1px solid #e7e5e4;padding-top:14px;text-align:center;font-family:-apple-system,sans-serif;">
  <p style="margin:0;font-size:11px;color:#a8a29e;">&copy; ${YEAR} ${APP_NAME} &mdash; <a href="mailto:${SUPPORT}" style="color:#78716c;text-decoration:none;">${SUPPORT}</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// OVERDUE ALERT  (20 variants)
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

  // Variant 5 — Left ribbon, professional warning
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fafafa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(220,38,38,.08);">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="width:6px;background:linear-gradient(180deg,#dc2626,#b91c1c,#991b1b);">&nbsp;</td>
    <td style="padding:36px 32px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#dc2626;letter-spacing:.08em;text-transform:uppercase;">&#9888; ${APP_NAME} &bull; Overdue Alert</p>
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#1e293b;">${fmtINR(total)} is past due</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong>${userName}</strong>, ${reminders.length} payment${reminders.length!==1?'s':''} in your ${APP_NAME} account ${reminders.length===1?'has':'have'} passed their due date. Please action them immediately.</p>
      ${reminders.map(r=>`
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;background:#fef2f2;border-radius:8px;"><tr>
        <td style="padding:10px 14px;"><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#dc2626;">Was due ${r.dueDate} &bull; ${r.module}</p></td>
        <td style="padding:10px 14px;text-align:right;font-size:14px;font-weight:700;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr></table>`).join('')}
      ${cta('Clear Overdue', `${APP_URL}/reminders`, '#dc2626')}
    </td>
  </tr></table>
  ${footer('Overdue alerts are sent daily until all payments are cleared.')}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 6 — Bold large amount, compact list
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff5f5;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(220,38,38,.1);">
  <div style="background:linear-gradient(135deg,#7f1d1d,#b91c1c,#dc2626);padding:40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;">Total Overdue</p>
    <p style="margin:0 0 4px;font-size:48px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1;">${fmtINR(total)}</p>
    <p style="margin:0;color:#fca5a5;font-size:13px;">${reminders.length} payment${reminders.length!==1?'s':''} past due</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong style="color:#1e293b;">${userName}</strong>, these payments need immediate attention. Late fees may be accumulating.</p>
    ${reminders.map((r,i)=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="${i>0?'border-top:1px solid #fef2f2;':''}padding:10px 0;"><tr>
      <td><span style="font-size:13px;font-weight:600;color:#1e293b;">${r.title}</span><br/><span style="font-size:11px;color:#dc2626;">Due ${r.dueDate} &bull; ${r.module}</span></td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Settle Now', `${APP_URL}/reminders`, '#dc2626')}
  </div>${footer('Overdue alerts are sent daily until all payments are marked complete.')}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 7 — Dark maroon, monospace receipt log
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#1a0000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#1a0000;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#2d0000;border-radius:20px;overflow:hidden;border:1px solid #7f1d1d;">
  <div style="padding:24px 40px;border-bottom:1px solid #7f1d1d;">
    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#ef4444;letter-spacing:.1em;font-family:monospace;text-transform:uppercase;">OVERDUE_ALERT &bull; ${APP_NAME}</p>
    <h1 style="margin:0;color:#fecaca;font-size:22px;font-weight:800;">${fmtINR(total)} Requires Action</h1>
  </div>
  <div style="padding:24px 40px;">
    <p style="margin:0 0 16px;font-size:13px;color:#fca5a5;font-family:monospace;">HI ${userName.toUpperCase()}, ${reminders.length} PAYMENT${reminders.length!==1?'S ARE':' IS'} PAST DUE:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #7f1d1d;border-radius:10px;overflow:hidden;margin-bottom:20px;">
      ${reminders.map((r,i)=>`
      <tr style="${i>0?'border-top:1px solid #3d0000;':''}background:${i%2===0?'#2d0000':'#3d0000'};">
        <td style="padding:10px 14px;font-size:12px;font-family:monospace;color:#fecaca;">${r.title}</td>
        <td style="padding:10px 14px;text-align:center;font-size:11px;font-family:monospace;color:#f87171;">${r.dueDate}</td>
        <td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:700;color:#ef4444;white-space:nowrap;font-family:monospace;">${fmtINR(r.amount)}</td>
      </tr>`).join('')}
      <tr style="border-top:2px solid #dc2626;background:#1a0000;"><td style="padding:12px 14px;font-size:11px;font-family:monospace;color:#f87171;" colspan="2">TOTAL_OVERDUE</td><td style="padding:12px 14px;text-align:right;font-size:16px;font-weight:900;color:#fff;font-family:monospace;">${fmtINR(total)}</td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px;background:#ef4444;"><a href="${APP_URL}/reminders" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:10px;font-family:monospace;">RESOLVE_NOW &rarr;</a></td></tr></table>
  </div>
  <div style="padding:16px 40px;border-top:1px solid #7f1d1d;text-align:center;"><p style="margin:0;font-size:11px;color:#7f1d1d;font-family:monospace;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 8 — White, numbered list with urgency score
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding-bottom:20px;border-bottom:2px solid #dc2626;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">${APP_NAME}</p></td>
    <td style="text-align:right;"><span style="font-size:11px;font-weight:700;color:#dc2626;background:#fef2f2;padding:4px 10px;border-radius:999px;">&#9888; OVERDUE</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:28px 0;">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1e293b;">Overdue payments, ${userName}</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.7;">${reminders.length} payment${reminders.length!==1?'s require':' requires'} immediate attention — ${fmtINR(total)} outstanding.</p>
  ${reminders.map((r,i)=>`
  <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%;"><tr>
    <td style="width:32px;height:32px;background:#fef2f2;border-radius:50%;text-align:center;vertical-align:middle;font-size:13px;font-weight:900;color:#dc2626;border:2px solid #fecaca;min-width:32px;">${i+1}</td>
    <td style="padding-left:14px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td><p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:12px;color:#94a3b8;">Was due ${r.dueDate} &bull; ${r.module}</p></td>
        <td style="text-align:right;font-size:15px;font-weight:800;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr></table>
    </td>
  </tr></table>`).join('')}
  <div style="border-top:2px solid #dc2626;padding-top:16px;margin-top:8px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:14px;font-weight:700;color:#1e293b;">Total Outstanding</td>
      <td style="text-align:right;font-size:22px;font-weight:800;color:#dc2626;">${fmtINR(total)}</td>
    </tr></table>
  </div>
  ${cta('Clear All Overdue', `${APP_URL}/reminders`, '#dc2626')}
</td></tr>
<tr><td style="padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p></td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 9 — Orange, split stat header + list
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const oldest = reminders.reduce((a,r)=>r.dueDate<a?r.dueDate:a, reminders[0]?.dueDate||'');
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff7ed;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,.1);">
  <div style="background:linear-gradient(135deg,#c2410c,#ea580c,#f97316);padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      ${[['Overdue',String(reminders.length)],['Total',fmtINR(total)],['Oldest',oldest]].map(([l,v])=>`
      <td style="text-align:center;border-right:1px solid rgba(255,255,255,.2);padding:0 16px;"><p style="margin:0 0 2px;font-size:20px;font-weight:800;color:#fff;">${v}</p><p style="margin:0;font-size:10px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.05em;">${l}</p></td>`).join('')}
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong>${userName}</strong>, these payments are overdue and may be accruing late fees:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fed7aa;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      ${reminders.map((r,i)=>`
      <tr style="${i>0?'border-top:1px solid #fff7ed;':''}${i%2===0?'':'background:#fffbf5;'}">
        <td style="padding:11px 14px;"><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#ea580c;">Due ${r.dueDate}</p></td>
        <td style="padding:11px 14px;text-align:right;font-size:14px;font-weight:700;color:#c2410c;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr>`).join('')}
    </table>
    ${cta('Pay Overdue Now', `${APP_URL}/reminders`, '#ea580c')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 10 — Purple urgent, emergency banner top
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#faf5ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(126,34,206,.1);">
  <div style="background:#dc2626;padding:10px 40px;text-align:center;">
    <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:.1em;text-transform:uppercase;">&#9888; IMMEDIATE ACTION REQUIRED</p>
  </div>
  <div style="background:linear-gradient(135deg,#3b0764,#6b21a8,#7e22ce);padding:32px 40px;text-align:center;">
    <p style="margin:0 0 6px;font-size:32px;font-weight:900;color:#fff;">${fmtINR(total)}</p>
    <p style="margin:0;color:#ddd6fe;font-size:14px;">overdue across ${reminders.length} payment${reminders.length!==1?'s':''}</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong>${userName}</strong>, these ${APP_NAME} reminders are past their due dates:</p>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid #ede9fe;border-radius:10px;"><tr>
      <td style="width:4px;background:#7e22ce;border-radius:10px 0 0 10px;">&nbsp;</td>
      <td style="padding:11px 14px;"><p style="margin:0 0 1px;font-size:13px;font-weight:700;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#7e22ce;">Was due ${r.dueDate} &bull; ${r.module}</p></td>
      <td style="padding:11px 14px;text-align:right;font-size:14px;font-weight:700;color:#7e22ce;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Resolve Overdue', `${APP_URL}/reminders`, '#7e22ce')}
  </div>${footer('Overdue alerts are sent daily until all payments are resolved.')}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 11 — Corporate letterhead, firm notice
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const today = new Date().toLocaleDateString('en-IN',{dateStyle:'long'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:#7f1d1d;padding:3px 0;"></div>
  <div style="padding:24px 48px;border-bottom:1px solid #e2e8f0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:16px;font-weight:700;color:#1e293b;font-family:-apple-system,sans-serif;">${APP_NAME}</p></td>
      <td style="text-align:right;font-size:12px;color:#64748b;font-family:-apple-system,sans-serif;">OVERDUE NOTICE &bull; ${today}</td>
    </tr></table>
  </div>
  <div style="padding:32px 48px;">
    <p style="margin:0 0 16px;font-size:15px;color:#1e293b;font-family:-apple-system,sans-serif;">Dear <strong>${userName}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">This is a formal notice that the following <strong>${reminders.length} payment obligation${reminders.length!==1?'s':''}</strong> on your ${APP_NAME} account are past their due dates, with a combined outstanding balance of <strong>${fmtINR(total)}</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:-apple-system,sans-serif;margin-bottom:20px;">
      <tr style="border-bottom:2px solid #1e293b;"><th style="text-align:left;padding:8px 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Description</th><th style="text-align:center;padding:8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Was Due</th><th style="text-align:right;padding:8px 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Amount</th></tr>
      ${reminders.map(r=>`
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px 0;font-size:13px;color:#1e293b;">${r.title} <span style="font-size:11px;color:#64748b;">(${r.module})</span></td>
        <td style="padding:10px 8px;text-align:center;font-size:12px;color:#dc2626;">${r.dueDate}</td>
        <td style="padding:10px 0;text-align:right;font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr>`).join('')}
      <tr style="border-top:2px solid #1e293b;"><td colspan="2" style="padding:12px 0;font-size:13px;font-weight:700;">Total Overdue</td><td style="padding:12px 0;text-align:right;font-size:16px;font-weight:800;color:#dc2626;">${fmtINR(total)}</td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">Kindly resolve these obligations at the earliest to avoid further late fees or complications.</p>
    ${cta('Resolve Overdue Payments', `${APP_URL}/reminders`, '#1e293b')}
  </div>
  <div style="background:#f8fafc;padding:14px 48px;border-top:1px solid #e2e8f0;text-align:center;font-family:-apple-system,sans-serif;"><p style="margin:0;font-size:11px;color:#94a3b8;">Automated overdue notice from ${APP_NAME}</p></div>
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 12 — Teal + compact mobile card
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;background:#f0fdfa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;">
<tr><td style="background:#dc2626;border-radius:12px 12px 0 0;padding:14px 20px;">
  <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:.06em;text-transform:uppercase;">&#9888; Overdue Alert &bull; ${APP_NAME}</p>
</td></tr>
<tr><td style="background:#fff;padding:20px;">
  <p style="margin:0 0 4px;font-size:26px;font-weight:900;color:#dc2626;">${fmtINR(total)}</p>
  <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Hi ${userName} — ${reminders.length} overdue payment${reminders.length!==1?'s':''}</p>
  ${reminders.map((r,i)=>`
  <table width="100%" cellpadding="0" cellspacing="0" style="${i>0?'border-top:1px solid #fef2f2;':''}padding:9px 0;"><tr>
    <td><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:10px;color:#dc2626;">Due ${r.dueDate}</p></td>
    <td style="text-align:right;font-size:13px;font-weight:700;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
  </tr></table>`).join('')}
  ${cta('Pay Now', `${APP_URL}/reminders`, '#dc2626')}
</td></tr>
<tr><td style="background:#fef2f2;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;border-top:1px solid #fecaca;">
  <p style="margin:0;font-size:11px;color:#dc2626;">Daily alerts until resolved</p>
</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 13 — Sky blue + diagonal accent, calm professional
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,165,233,.08);">
  <div style="height:5px;background:linear-gradient(90deg,#dc2626,#f97316,#eab308);"></div>
  <div style="padding:28px 40px;border-bottom:1px solid #e0f2fe;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="width:52px;height:52px;background:#fef2f2;border-radius:14px;text-align:center;vertical-align:middle;font-size:28px;">&#9888;&#65039;</td>
      <td style="padding-left:14px;"><h1 style="margin:0 0 2px;font-size:20px;font-weight:800;color:#1e293b;">Overdue Payments</h1><p style="margin:0;font-size:13px;color:#dc2626;">${reminders.length} item${reminders.length!==1?'s':''} &bull; ${fmtINR(total)} outstanding</p></td>
    </tr></table>
  </div>
  <div style="padding:24px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">Hi <strong style="color:#1e293b;">${userName}</strong>, the following payments in your ${APP_NAME} account are past due and need to be resolved.</p>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;"><tr>
      <td style="padding:12px 14px;"><p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#dc2626;">&#9888; Was due ${r.dueDate} &bull; ${r.module}</p></td>
      <td style="padding:12px 14px;text-align:right;font-size:14px;font-weight:700;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Clear Overdue Now', `${APP_URL}/reminders`, '#0369a1')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 14 — Warm gold, financial advisory tone
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fffbeb;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(245,158,11,.12);border:1px solid #fde68a;">
  <div style="background:linear-gradient(135deg,#78350f,#b45309,#d97706);padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">&#128181; Financial Alert</h1><p style="margin:0;color:#fde68a;font-size:13px;">${reminders.length} overdue payment${reminders.length!==1?'s':''} &bull; ${fmtINR(total)} outstanding</p></td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#44403c;line-height:1.75;">Hi <strong>${userName}</strong>, late payments affect your financial health and may attract penalty interest. We strongly recommend resolving these today.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      ${reminders.map((r,i)=>`
      <tr style="${i>0?'border-top:1px solid #fef3c7;':''}${i%2===0?'':'background:#fffdf0;'}">
        <td style="padding:11px 16px;"><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#1c1917;">${r.title}</p><p style="margin:0;font-size:11px;color:#b45309;">Was due ${r.dueDate} &bull; ${r.module}</p></td>
        <td style="padding:11px 16px;text-align:right;font-size:14px;font-weight:700;color:#b45309;white-space:nowrap;">${fmtINR(r.amount)}</td>
      </tr>`).join('')}
      <tr style="background:#fffbeb;border-top:2px solid #fde68a;"><td style="padding:12px 16px;font-size:13px;font-weight:700;color:#78350f;">Total Overdue</td><td style="padding:12px 16px;text-align:right;font-size:17px;font-weight:800;color:#b45309;">${fmtINR(total)}</td></tr>
    </table>
    ${cta('Settle Overdue Payments', `${APP_URL}/reminders`, '#b45309')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 15 — Dark green/emerald urgent
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#022c22;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#022c22;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#064e3b;border-radius:20px;overflow:hidden;border:1px solid #065f46;">
  <div style="padding:28px 40px;border-bottom:1px solid #065f46;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#34d399;letter-spacing:.1em;text-transform:uppercase;">Overdue Alert &bull; ${APP_NAME}</p>
    <h1 style="margin:0;color:#f0fdfa;font-size:24px;font-weight:800;">${fmtINR(total)} needs urgent attention</h1>
  </div>
  <div style="padding:24px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#99f6e4;line-height:1.7;">Hi <strong>${userName}</strong>, ${reminders.length} payment${reminders.length!==1?'s':''} in your account ${reminders.length===1?'has':'have'} gone past due. Please resolve them as soon as possible.</p>
    ${reminders.map((r,i)=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="${i>0?'border-top:1px solid #065f46;':''}padding:12px 0;"><tr>
      <td><p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#f0fdfa;">${r.title}</p><p style="margin:0;font-size:11px;color:#34d399;">Was due ${r.dueDate} &bull; ${r.module}</p></td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#f87171;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    <div style="border-top:2px solid #065f46;padding-top:14px;margin-top:12px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:13px;color:#99f6e4;">Total outstanding</td>
        <td style="text-align:right;font-size:20px;font-weight:800;color:#f0fdfa;">${fmtINR(total)}</td>
      </tr></table>
    </div>
    ${cta('Mark as Resolved', `${APP_URL}/reminders`, '#10b981')}
  </div>
  <div style="padding:14px 40px;border-top:1px solid #065f46;text-align:center;"><p style="margin:0;font-size:11px;color:#065f46;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 16 — Slate + progress bar showing how many are overdue
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="background:#1e293b;padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 2px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">${APP_NAME} Overdue Notice</p><p style="margin:0;color:#f8fafc;font-size:20px;font-weight:800;">Action Required</p></td>
      <td style="text-align:right;"><p style="margin:0 0 2px;font-size:11px;color:#64748b;">Outstanding</p><p style="margin:0;font-size:24px;font-weight:800;color:#f87171;">${fmtINR(total)}</p></td>
    </tr></table>
  </div>
  <div style="padding:24px 40px;">
    <p style="margin:0 0 8px;font-size:13px;color:#475569;">Hi <strong style="color:#1e293b;">${userName}</strong>, ${reminders.length} payment${reminders.length!==1?'s have':' has'} passed due date:</p>
    <div style="height:8px;background:#f1f5f9;border-radius:4px;margin-bottom:20px;"><div style="height:8px;background:linear-gradient(90deg,#dc2626,#f97316);border-radius:4px;width:100%;"></div></div>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;padding:12px 16px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 10px 10px 0;"><tr>
      <td><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#dc2626;">Was due ${r.dueDate} &bull; ${r.module}</p></td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    ${cta('Clear Overdue Payments', `${APP_URL}/reminders`, '#1e293b')}
  </div>${footer('Daily overdue alerts until all payments are resolved.')}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 17 — Rose, personal/empathetic tone
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff1f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff1f2;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,.1);border:1px solid #fecdd3;">
  <div style="padding:32px 40px 0;text-align:center;">
    <p style="margin:0 0 8px;font-size:40px;line-height:1;">&#128533;</p>
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e293b;">Hey ${userName}, just checking in…</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#f43f5e;">${reminders.length} payment${reminders.length!==1?'s':''} overdue &bull; ${fmtINR(total)} outstanding</p>
  </div>
  <div style="padding:0 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;text-align:center;">We know life gets busy. But these outstanding payments could attract late fees if left unresolved. Here&rsquo;s a quick summary:</p>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid #fecdd3;border-radius:10px;background:#fff1f2;"><tr>
      <td style="padding:12px 14px;"><p style="margin:0 0 1px;font-size:13px;font-weight:700;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:11px;color:#f43f5e;">Was due ${r.dueDate} &bull; ${r.module}</p></td>
      <td style="padding:12px 14px;text-align:right;font-size:14px;font-weight:700;color:#f43f5e;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
  </div>
  <div style="padding:20px 40px 32px;">${cta('Take Care of It Now', `${APP_URL}/reminders`, '#f43f5e')}</div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 18 — Minimal white, clean table, no extra decoration
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="padding-bottom:20px;border-bottom:1px solid #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><p style="margin:0;font-size:13px;font-weight:700;color:#1e293b;">${APP_NAME}</p></td>
    <td style="text-align:right;"><span style="background:#fef2f2;color:#dc2626;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;border:1px solid #fecaca;">OVERDUE</span></td>
  </tr></table>
</td></tr>
<tr><td style="padding:28px 0;">
  <p style="margin:0 0 20px;font-size:16px;color:#1e293b;line-height:1.6;">Hi ${userName}, you have <strong style="color:#dc2626;">${reminders.length} overdue payment${reminders.length!==1?'s':''}</strong> totalling <strong style="color:#dc2626;">${fmtINR(total)}</strong>.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;margin-bottom:20px;">
    ${reminders.map(r=>`
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px 0;"><p style="margin:0 0 1px;font-size:14px;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:12px;color:#dc2626;">Due ${r.dueDate}</p></td>
      <td style="padding:12px 0;text-align:right;font-size:15px;font-weight:700;color:#dc2626;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr>`).join('')}
    <tr><td style="padding:14px 0;font-size:14px;font-weight:700;color:#1e293b;">Total</td><td style="padding:14px 0;text-align:right;font-size:18px;font-weight:800;color:#dc2626;">${fmtINR(total)}</td></tr>
  </table>
  ${cta('Resolve Payments', `${APP_URL}/reminders`, '#dc2626')}
</td></tr>
<tr><td style="padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p></td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 19 — Full dark background, glowing red card
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f0000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#0f0000;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#1a0000;border-radius:20px;overflow:hidden;border:1px solid #7f1d1d;box-shadow:0 0 40px rgba(220,38,38,.2);">
  <div style="padding:36px 40px;text-align:center;border-bottom:1px solid #7f1d1d;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#ef4444;letter-spacing:.1em;text-transform:uppercase;">${APP_NAME} &bull; Critical Alert</p>
    <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;">Overdue: ${fmtINR(total)}</h1>
    <p style="margin:0;color:#fca5a5;font-size:14px;">${reminders.length} unresolved payment${reminders.length!==1?'s':''}</p>
  </div>
  <div style="padding:24px 40px;">
    <p style="margin:0 0 16px;font-size:13px;color:#fca5a5;">Hi ${userName} — your ${APP_NAME} account has overdue payments requiring immediate action.</p>
    ${reminders.map(r=>`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;padding:10px 14px;background:#2d0000;border-radius:8px;border:1px solid #7f1d1d;"><tr>
      <td><p style="margin:0 0 1px;font-size:13px;font-weight:600;color:#fecaca;">${r.title}</p><p style="margin:0;font-size:11px;color:#ef4444;">Due ${r.dueDate} &bull; ${r.module}</p></td>
      <td style="text-align:right;font-size:14px;font-weight:700;color:#fca5a5;white-space:nowrap;">${fmtINR(r.amount)}</td>
    </tr></table>`).join('')}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px auto 0;"><tr><td style="border-radius:10px;background:#dc2626;box-shadow:0 4px 16px rgba(220,38,38,.4);"><a href="${APP_URL}/reminders" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;border-radius:10px;">Resolve Immediately &rarr;</a></td></tr></table>
  </div>
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:#7f1d1d;">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 20 — Violet + sidebar module summary
  ({ userName, reminders }) => {
    const total = reminders.reduce((s,r)=>s+r.amount,0);
    const grouped = {};
    reminders.forEach(r=>{ if(!grouped[r.module]) grouped[r.module]=[]; grouped[r.module].push(r); });
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f5f3ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(109,40,217,.1);">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:160px;background:linear-gradient(180deg,#3b0764,#6d28d9,#7e22ce);padding:36px 20px;vertical-align:top;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.06em;text-transform:uppercase;">Overdue</p>
        <p style="margin:0 0 20px;font-size:28px;font-weight:900;color:#fff;">${fmtINR(total)}</p>
        ${Object.entries(grouped).map(([mod,items])=>`
        <div style="margin-bottom:12px;">
          <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;">${mod}</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#ddd6fe;">${fmtINR(items.reduce((s,r)=>s+r.amount,0))}</p>
        </div>`).join('')}
      </td>
      <td style="padding:32px 28px;vertical-align:top;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#7e22ce;letter-spacing:.06em;text-transform:uppercase;">Action Required</p>
        <p style="margin:0 0 14px;font-size:13px;color:#475569;">Hi ${userName} — resolve overdue payments:</p>
        ${reminders.map(r=>`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f3f0ff;"><tr>
          <td><p style="margin:0 0 1px;font-size:12px;font-weight:700;color:#1e293b;">${r.title}</p><p style="margin:0;font-size:10px;color:#7e22ce;">Due ${r.dueDate}</p></td>
          <td style="text-align:right;font-size:13px;font-weight:700;color:#7e22ce;white-space:nowrap;">${fmtINR(r.amount)}</td>
        </tr></table>`).join('')}
        ${cta('Fix Now', `${APP_URL}/reminders`, '#7e22ce')}
      </td>
    </tr>
  </table>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// TEST EMAIL  (20 variants)
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

  // Variant 3 — Dark navy, monospace terminal aesthetic
  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:monospace;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#0f172a;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#020617;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
  <div style="background:#020617;padding:16px 24px;border-bottom:1px solid #1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-size:12px;font-weight:700;color:#4ade80;letter-spacing:.04em;">● DELIVERED</span></td>
      <td style="text-align:center;"><span style="font-size:13px;font-weight:700;color:#64748b;">${APP_NAME} / test-email</span></td>
      <td style="text-align:right;"><span style="font-size:11px;color:#334155;">${t} IST</span></td>
    </tr></table>
  </div>
  <div style="padding:32px 24px;font-family:monospace;">
    <p style="margin:0 0 16px;font-size:13px;color:#22d3ee;"># Email Delivery Test — SUCCESS</p>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">$ ${APP_NAME.toLowerCase()} test-email --recipient="${email}"</p>
      <p style="margin:0 0 4px;font-size:12px;color:#4ade80;">→ SMTP handshake: OK</p>
      <p style="margin:0 0 4px;font-size:12px;color:#4ade80;">→ Authentication: PASS</p>
      <p style="margin:0 0 4px;font-size:12px;color:#4ade80;">→ Delivery: CONFIRMED</p>
      <p style="margin:0 0 4px;font-size:12px;color:#4ade80;">→ Inbox: REACHED</p>
      <p style="margin:0;font-size:12px;color:#fbbf24;">→ To: ${email}</p>
    </div>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.75;">Hi ${userName}, ${APP_NAME} email delivery is confirmed. You will receive payment reminders, digests, and overdue alerts at this address.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:8px;background:#22d3ee;"><a href="${APP_URL}/dashboard" target="_blank" style="display:inline-block;padding:12px 32px;font-size:13px;font-weight:700;color:#0f172a;text-decoration:none;font-family:monospace;">→ open_dashboard()</a></td></tr></table>
  </div>
  <div style="padding:14px 24px;border-top:1px solid #1e293b;text-align:center;"><p style="margin:0;font-size:11px;color:#1e293b;font-family:monospace;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 4 — White minimal, friendly chatty tone
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="padding-bottom:20px;text-align:center;border-bottom:2px solid #1e293b;">
  <p style="margin:0;font-size:15px;font-weight:800;color:#1e293b;">${APP_NAME}</p>
</td></tr>
<tr><td style="padding:36px 0;">
  <p style="margin:0 0 4px;font-size:40px;text-align:center;">&#128231;</p>
  <h1 style="margin:8px 0 16px;font-size:26px;font-weight:800;color:#1e293b;text-align:center;">It works!</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.8;text-align:center;">Hey <strong>${userName}</strong>! You asked us to send you a test email and we did exactly that.</p>
  <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.8;text-align:center;">This means ${APP_NAME} can reach you at <strong style="color:#1e293b;">${email}</strong> — so you'll get all your payment reminders on time. 🎉</p>
  ${cta('Back to Dashboard', `${APP_URL}/dashboard`, '#1e293b')}
</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">
  <p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p>
</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 5 — Full gradient, floating glass card
  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95,#6b21a8);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:rgba(255,255,255,.96);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);">
  <div style="padding:40px 40px 28px;text-align:center;">
    <p style="margin:0 0 12px;font-size:48px;line-height:1;">&#127881;</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#1e293b;">Test email delivered!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Hi ${userName} — your ${APP_NAME} email setup is working perfectly.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:14px;margin-bottom:24px;"><tr><td style="padding:20px 24px;">
      ${[['Recipient',email],['Time',t+' IST'],['Status','✅ Delivered'],['System',APP_NAME+' SMTP']].map(([l,v])=>`
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
        <td style="font-size:11px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:.04em;width:90px;">${l}</td>
        <td style="font-size:13px;color:#1e293b;">${v}</td>
      </tr></table>`).join('')}
    </td></tr></table>
    <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.7;">Email alerts for payment reminders, overdue notices, and digests will now reach your inbox reliably.</p>
    ${cta('View Dashboard', `${APP_URL}/dashboard`, '#6d28d9')}
  </div>
  ${footer(`Test email from ${APP_NAME} Profile settings.`)}
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.3);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 6 — Amber/warm, celebratory banner
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fffbeb;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(245,158,11,.12);border:2px solid #fde68a;">
  <div style="background:linear-gradient(135deg,#78350f,#b45309,#d97706);padding:32px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;">${APP_NAME} System Check</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;">&#9989; Email Confirmed!</h1>
    <p style="margin:0;color:#fde68a;font-size:13px;">Your inbox is connected and receiving alerts</p>
  </div>
  <div style="padding:32px 40px;text-align:center;">
    <p style="margin:0 0 20px;font-size:15px;color:#1c1917;line-height:1.75;">Hey <strong>${userName}</strong>, great news! We just confirmed that ${APP_NAME} can successfully deliver emails to <strong>${email}</strong>.</p>
    <div style="background:#fef3c7;border-radius:14px;padding:20px 24px;margin-bottom:24px;display:inline-block;width:100%;box-sizing:border-box;">
      <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#92400e;">100%</p>
      <p style="margin:0;font-size:13px;color:#78350f;">Email Delivery Rate</p>
    </div>
    <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.7;">Expect daily payment reminders, weekly digests, and overdue alerts directly in your inbox.</p>
    ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#b45309')}
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 7 — Slate corporate, info card
  ({ userName, email }) => {
    const t = new Date().toLocaleDateString('en-IN',{dateStyle:'long'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="padding:20px 48px;border-bottom:2px solid #334155;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:16px;font-weight:700;color:#1e293b;font-family:-apple-system,sans-serif;">${APP_NAME}</p></td>
      <td style="text-align:right;font-size:11px;color:#64748b;font-family:-apple-system,sans-serif;">EMAIL DELIVERY TEST &bull; ${t}</td>
    </tr></table>
  </div>
  <div style="padding:32px 48px;">
    <p style="margin:0 0 14px;font-size:15px;color:#1e293b;font-family:-apple-system,sans-serif;">Dear <strong>${userName}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">This email serves as confirmation that your ${APP_NAME} account email notification system has been tested and is functioning correctly. The message was successfully delivered to:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 20px;margin-bottom:24px;font-family:-apple-system,sans-serif;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#334155;">${email}</p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">You will continue to receive timely payment reminders, weekly financial digests, and overdue payment alerts at this address.</p>
    ${cta('Return to Dashboard', `${APP_URL}/dashboard`, '#334155')}
  </div>
  <div style="background:#f8fafc;padding:14px 48px;border-top:1px solid #e2e8f0;font-family:-apple-system,sans-serif;text-align:center;"><p style="margin:0;font-size:11px;color:#94a3b8;">Automated test from ${APP_NAME}</p></div>
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 8 — Sky blue, tick animation-feel design
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,165,233,.1);">
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9);padding:36px 40px;text-align:center;">
    <div style="width:80px;height:80px;background:rgba(255,255,255,.15);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
      <p style="margin:0;font-size:40px;line-height:80px;">&#10003;</p>
    </div>
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">Delivery Confirmed</h1>
    <p style="margin:0;color:#bae6fd;font-size:13px;">${APP_NAME} email system verified</p>
  </div>
  <div style="padding:32px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong style="color:#1e293b;">${userName}</strong>, your test email was delivered successfully. ${APP_NAME} is ready to send you:</p>
    ${[['📅','Daily/Weekly payment reminders'],['⚠️','Overdue payment alerts'],['📊','Financial digest summaries'],['🔐','Security login notifications']].map(([e,l])=>`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
      <td style="width:28px;font-size:16px;">${e}</td>
      <td style="font-size:13px;color:#1e293b;">${l}</td>
    </tr></table>`).join('')}
    ${cta('Explore Dashboard', `${APP_URL}/dashboard`, '#0369a1')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 9 — Emerald, checklist features
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;border:1px solid #a7f3d0;box-shadow:0 4px 20px rgba(16,185,129,.08);">
  <div style="height:4px;background:linear-gradient(90deg,#10b981,#059669,#047857);"></div>
  <div style="padding:36px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
      <td><h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#1e293b;">&#128233; Email Setup Complete</h1><p style="margin:0;font-size:13px;color:#059669;">Delivered to ${email}</p></td>
      <td style="text-align:right;font-size:40px;line-height:1;">&#127881;</td>
    </tr></table>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, your ${APP_NAME} email notifications are now active. Here&rsquo;s what you&rsquo;ll receive:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${[['✅','Payment reminders before due dates'],['✅','Weekly/monthly financial digests'],['✅','Immediate overdue alerts'],['✅','Login security notifications'],['✅','Password reset & OTP emails']].map(([e,l])=>`
      <tr><td style="padding:5px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:14px;width:24px;">${e}</td>
          <td style="font-size:13px;color:#1e293b;padding-left:8px;">${l}</td>
        </tr></table>
      </td></tr>`).join('')}
    </table>
    ${cta('Go to Dashboard', `${APP_URL}/dashboard`, '#059669')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 10 — Rose, compact celebration
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff1f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff1f2;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,.1);border:1px solid #fecdd3;">
  <div style="background:linear-gradient(135deg,#881337,#be123c,#f43f5e);padding:32px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:44px;line-height:1;">&#127881;</p>
    <h1 style="margin:8px 0 4px;color:#fff;font-size:22px;font-weight:800;">You're all wired up!</h1>
    <p style="margin:0;color:#fecdd3;font-size:13px;">Email delivery verified, ${userName}</p>
  </div>
  <div style="padding:28px 40px;text-align:center;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">${APP_NAME} successfully delivered this test to <strong style="color:#1e293b;">${email}</strong>. Your payment alerts are ready to roll! 🚀</p>
    <div style="background:#fff1f2;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#f43f5e;font-weight:700;">From now on, you'll never miss a due date.</p>
    </div>
    ${cta('View Reminders', `${APP_URL}/reminders`, '#f43f5e')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 11 — Dark indigo + teal accent
  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0c1a2e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#0c1a2e;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#0f2237;border-radius:20px;overflow:hidden;border:1px solid #163354;">
  <div style="padding:28px 36px;border-bottom:1px solid #163354;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#22d3ee;letter-spacing:.06em;text-transform:uppercase;">${APP_NAME} &bull; Diagnostic</p><h1 style="margin:0;color:#f8fafc;font-size:20px;font-weight:800;">Email Test: Passed ✓</h1></td>
      <td style="text-align:right;font-size:11px;color:#334155;white-space:nowrap;">${t}</td>
    </tr></table>
  </div>
  <div style="padding:24px 36px;">
    <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;line-height:1.7;">Hi <strong style="color:#e2e8f0;">${userName}</strong> — this confirms that ${APP_NAME} can successfully deliver email notifications to <span style="color:#22d3ee;">${email}</span>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${[['SMTP Connection','Established','#4ade80'],['Email Auth','Google DKIM','#4ade80'],['Spam Filter','Bypassed','#4ade80'],['Recipient','Delivered','#22d3ee']].map(([k,v,c])=>`
      <tr style="border-bottom:1px solid #1e3a5f;"><td style="padding:9px 0;font-size:12px;color:#64748b;">${k}</td><td style="padding:9px 0;text-align:right;font-size:12px;font-weight:700;color:${c};">${v}</td></tr>`).join('')}
    </table>
    ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#22d3ee')}
  </div>
  <div style="padding:14px 36px;border-top:1px solid #163354;text-align:center;"><p style="margin:0;font-size:11px;color:#163354;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 12 — Violet + confetti emojis, joyful
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#faf5ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(124,58,237,.1);border:1px solid #ddd6fe;">
  <div style="padding:40px 40px 28px;text-align:center;">
    <p style="margin:0;font-size:36px;letter-spacing:6px;">&#127881; &#9989; &#127881;</p>
    <h1 style="margin:14px 0 6px;font-size:24px;font-weight:800;color:#1e293b;">It actually works!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">This test email reached your inbox successfully, ${userName}!</p>
    <div style="background:#f5f3ff;border-radius:14px;padding:18px 24px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:.05em;">Delivered to</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">${email}</p>
    </div>
    <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.7;">${APP_NAME} will now send you payment reminders, overdue alerts, and weekly digests — all designed to keep your finances on track!</p>
    ${cta('Let&rsquo;s Go!', `${APP_URL}/dashboard`, '#7c3aed')}
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 13 — Teal, split two-col info layout
  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'short',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdfa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(20,184,166,.1);border:1px solid #ccfbf1;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:160px;background:linear-gradient(180deg,#0f3d38,#0f766e,#0d9488);padding:36px 20px;vertical-align:middle;text-align:center;">
        <p style="margin:0 0 8px;font-size:48px;line-height:1;">&#9989;</p>
        <p style="margin:0;font-size:12px;font-weight:700;color:#99f6e4;text-transform:uppercase;letter-spacing:.04em;">Delivered</p>
      </td>
      <td style="padding:28px 28px;vertical-align:top;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:.06em;text-transform:uppercase;">Email Test Result</p>
        <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#1e293b;">Success! &#128233;</h1>
        <p style="margin:0 0 14px;font-size:13px;color:#475569;line-height:1.7;">Hi ${userName} — ${APP_NAME} confirmed email delivery to <strong>${email}</strong>.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          ${[['Sent',t+' IST'],['Status','✅ OK']].map(([l,v])=>`<tr><td style="font-size:11px;color:#0d9488;font-weight:700;padding:3px 0;width:60px;">${l}</td><td style="font-size:12px;color:#1e293b;">${v}</td></tr>`).join('')}
        </table>
        ${cta('Dashboard', `${APP_URL}/dashboard`, '#0f766e')}
      </td>
    </tr>
  </table>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 14 — Rainbow top border, feature grid
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
  <div style="height:5px;background:linear-gradient(90deg,#f43f5e,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6);"></div>
  <div style="padding:32px 40px 0;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#64748b;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} Email Test</p>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1e293b;">&#127881; All systems go!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Hi ${userName} — your inbox at <strong style="color:#1e293b;">${email}</strong> is receiving ${APP_NAME} emails.</p>
  </div>
  <div style="padding:0 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      ${[['🔔','Reminders','Daily payment alerts before due dates'],['📊','Digests','Weekly/monthly financial summaries'],['⚠️','Overdue','Immediate notifications for past-due items'],['🔒','Security','Login and password change alerts']].map(([e,h,d],i)=>`
      <tr style="${i>0?'border-top:1px solid #f1f5f9;':''}">
        <td style="width:44px;padding:14px;font-size:22px;text-align:center;">${e}</td>
        <td style="padding:14px 0;"><p style="margin:0 0 1px;font-size:13px;font-weight:700;color:#1e293b;">${h}</p><p style="margin:0;font-size:11px;color:#64748b;">${d}</p></td>
      </tr>`).join('')}
    </table>
    ${cta('Explore Dashboard', `${APP_URL}/dashboard`, '#1e293b')}
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 15 — Indigo + minimal large stat
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#eef2ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,.12);">
  <div style="padding:48px 40px;text-align:center;">
    <div style="width:80px;height:80px;background:linear-gradient(135deg,#4338ca,#6366f1);border-radius:20px;margin:0 auto 20px;display:inline-block;">
      <p style="margin:0;font-size:40px;line-height:80px;">&#9989;</p>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#1e293b;">Inbox verified!</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#64748b;">Hi ${userName}</p>
    <p style="margin:0 0 28px;font-size:14px;color:#6366f1;font-weight:600;">${email}</p>
    <div style="background:#eef2ff;border-radius:14px;padding:20px;margin-bottom:28px;">
      <p style="margin:0 0 2px;font-size:14px;color:#4338ca;">Email delivery success rate</p>
      <p style="margin:0;font-size:48px;font-weight:900;color:#4338ca;line-height:1.2;">100%</p>
    </div>
    <p style="margin:0 0 24px;font-size:13px;color:#64748b;line-height:1.7;">${APP_NAME} payment reminders, digests, and security alerts will reach you right here.</p>
    ${cta('Go to Dashboard', `${APP_URL}/dashboard`, '#4338ca')}
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 16 — Dark + neon green, hacker aesthetic
  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#000;font-family:monospace;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#000;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#001100;border-radius:16px;overflow:hidden;border:1px solid #003300;">
  <div style="background:#001100;padding:14px 24px;border-bottom:1px solid #003300;">
    <p style="margin:0;font-size:12px;color:#00ff41;font-family:monospace;">${APP_NAME}.test() &bull; ${t}</p>
  </div>
  <div style="padding:32px 24px;">
    <p style="margin:0 0 8px;font-size:22px;color:#00ff41;font-weight:700;font-family:monospace;">[SUCCESS] DELIVERY_CONFIRMED</p>
    <p style="margin:0 0 20px;font-size:12px;color:#00cc33;font-family:monospace;">→ {status: "ok", smtp: "verified", inbox: "reached"}</p>
    <div style="background:#000;border:1px solid #003300;border-radius:8px;padding:16px;margin-bottom:20px;font-family:monospace;">
      <p style="margin:0 0 6px;font-size:12px;color:#00ff41;">msg.to = "${email}"</p>
      <p style="margin:0 0 6px;font-size:12px;color:#00ff41;">msg.from = "${APP_NAME}"</p>
      <p style="margin:0 0 6px;font-size:12px;color:#00cc33;">msg.status = "DELIVERED"</p>
      <p style="margin:0;font-size:12px;color:#009900;">// Hi ${userName}, alerts are live!</p>
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:6px;background:#00ff41;"><a href="${APP_URL}/dashboard" target="_blank" style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;color:#000;text-decoration:none;font-family:monospace;">OPEN_DASHBOARD();</a></td></tr></table>
  </div>
  <div style="padding:12px 24px;border-top:1px solid #003300;text-align:center;"><p style="margin:0;font-size:10px;color:#003300;font-family:monospace;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`;
  },

  // Variant 17 — Coral/peach, warm friendly
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff7f4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(249,115,22,.1);border:1px solid #fed7aa;">
  <div style="background:linear-gradient(135deg,#c2410c,#ea580c,#fb923c);padding:36px 40px;text-align:center;">
    <p style="margin:0 0 12px;font-size:48px;line-height:1;">&#128231;</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:800;">Email landed!</h1>
    <p style="margin:0;color:#fed7aa;font-size:13px;">${APP_NAME} can reach you at ${email}</p>
  </div>
  <div style="padding:32px 40px;text-align:center;">
    <p style="margin:0 0 20px;font-size:15px;color:#1c1917;line-height:1.8;">Hi <strong>${userName}</strong>! We&rsquo;re thrilled your inbox is connected. From now on, ${APP_NAME} will ping you for every payment deadline so you&rsquo;re always on top of your finances. 💪</p>
    <div style="background:#fff7ed;border-radius:12px;padding:16px;border:1px solid #fed7aa;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:.05em;">What&rsquo;s next</p>
      <p style="margin:0;font-size:13px;color:#44403c;">Add your first reminder and we&rsquo;ll take care of the rest!</p>
    </div>
    ${cta('Add a Reminder', `${APP_URL}/reminders`, '#ea580c')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 18 — Gray stone, ultra minimal
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:64px 24px;background:#fafaf9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
<tr><td style="padding-bottom:24px;border-bottom:1px solid #e7e5e4;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#1c1917;">${APP_NAME}</p>
</td></tr>
<tr><td style="padding:32px 0;">
  <p style="margin:0 0 20px;font-size:22px;font-weight:800;color:#1c1917;">Test email delivered &#9989;</p>
  <p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.8;">Hi ${userName}, this confirms that ${APP_NAME} can send emails to <strong style="color:#1c1917;">${email}</strong>.</p>
  <p style="margin:0 0 28px;font-size:15px;color:#57534e;line-height:1.8;">You&rsquo;ll receive payment reminders, digest summaries, and overdue alerts here going forward.</p>
  ${cta('Open App', `${APP_URL}/dashboard`, '#1c1917')}
</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #e7e5e4;">
  <p style="margin:0;font-size:11px;color:#a8a29e;">&copy; ${YEAR} ${APP_NAME}</p>
</td></tr>
</table></td></tr></table></body></html>`;
  },

  // Variant 19 — Navy sidebar, info list right
  ({ userName, email }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:140px;background:#0f172a;padding:36px 20px;vertical-align:middle;text-align:center;">
        <p style="margin:0 0 8px;font-size:36px;line-height:1;">&#9989;</p>
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">Result</p>
        <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">PASS</p>
      </td>
      <td style="padding:28px 28px;vertical-align:top;">
        <h1 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#1e293b;">Email Test</h1>
        <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Hi ${userName} — delivery confirmed!</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          ${[['To',email],['At',t+' IST'],['App',APP_NAME],['Status','✅ Delivered']].map(([l,v])=>`
          <tr style="border-bottom:1px solid #f8fafc;"><td style="padding:6px 0;font-size:11px;color:#94a3b8;font-weight:700;width:56px;">${l}</td><td style="padding:6px 0;font-size:12px;color:#1e293b;">${v}</td></tr>`).join('')}
        </table>
        ${cta('Dashboard', `${APP_URL}/dashboard`, '#0f172a')}
      </td>
    </tr>
  </table>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // Variant 20 — Cyan wide, gradient stripe
  ({ userName, email }) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ecfeff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#ecfeff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(6,182,212,.1);border:1px solid #a5f3fc;">
  <div style="height:5px;background:linear-gradient(90deg,#06b6d4,#0891b2,#0e7490,#155e75);"></div>
  <div style="padding:36px 40px;border-bottom:1px solid #ecfeff;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#0891b2;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Email System</p><h1 style="margin:0;font-size:22px;font-weight:800;color:#1e293b;">Test passed successfully &#127881;</h1></td>
      <td style="text-align:right;font-size:40px;line-height:1;">&#128233;</td>
    </tr></table>
  </div>
  <div style="padding:24px 40px 32px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong style="color:#1e293b;">${userName}</strong>, email notifications are now active for your ${APP_NAME} account. Future alerts will be delivered to <strong style="color:#0e7490;">${email}</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${[['✅','SMTP auth verified — emails authenticated with DKIM'],['✅','Inbox test passed — message delivered without spam filter'],['✅','Encoding correct — content renders across all email clients']].map(([e,l])=>`
      <tr><td style="padding:5px 0;"><p style="margin:0;font-size:13px;color:#1e293b;">${e} ${l}</p></td></tr>`).join('')}
    </table>
    ${cta('Open Dashboard', `${APP_URL}/dashboard`, '#0891b2')}
  </div>${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
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

// ══════════════════════════════════════════════════════════════════════════════
// PASSWORD RESET  (20 variants)
// ══════════════════════════════════════════════════════════════════════════════

const passwordResetVariants = [

  // V1 — Indigo gradient, lock icon, original
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
  <div style="background:linear-gradient(135deg,#1e1b4b,#4338ca);padding:44px 40px;text-align:center;">
    <div style="width:64px;height:64px;background:rgba(255,255,255,.12);border-radius:50%;margin:0 auto 16px;line-height:64px;font-size:28px;">&#128274;</div>
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;">Reset Your Password</h1>
    <p style="margin:0;color:#a5b4fc;font-size:13px;">${APP_NAME} &bull; Password Recovery</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 16px;font-size:15px;color:#1e293b;">Hi <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">We received a request to reset the password for your ${APP_NAME} account. Click the button below to choose a new password. This link expires in <strong>30 minutes</strong>.</p>
    ${cta('Reset My Password', resetUrl, '#4338ca')}
    <div style="margin:28px 0 0;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#475569;">Or copy this link:</p>
      <p style="margin:0;font-size:11px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;line-height:1.7;">If you did not request a password reset, please ignore this email — your account remains secure.</p>
  </div>
  ${footer('This reset link expires in 30 minutes. If you did not request this, no action is needed.')}
</td></tr><tr><td style="padding-top:18px;text-align:center;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`,

  // V2 — Minimal white, direct
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="padding-bottom:20px;border-bottom:2px solid #1e293b;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">${APP_NAME}</p>
</td></tr>
<tr><td style="padding:32px 0;">
  <h1 style="margin:0 0 14px;font-size:26px;font-weight:800;color:#1e293b;">Reset your password</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.8;">Hi ${userName}, click the button below to reset your ${APP_NAME} password. The link expires in <strong>30 minutes</strong>.</p>
  ${cta('Reset Password', resetUrl, '#1e293b')}
  <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.7;">Didn&rsquo;t request this? Ignore this email — your account is safe.</p>
</td></tr>
<tr><td style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;"><p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p></td></tr>
</table></td></tr></table></body></html>`,

  // V3 — Full gradient, glass card
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9);">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:rgba(255,255,255,.97);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);">
  <div style="padding:40px 40px 28px;text-align:center;">
    <p style="margin:0 0 16px;font-size:52px;line-height:1;">&#128272;</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#1e293b;">Password Reset</h1>
    <p style="margin:0 0 24px;font-size:13px;color:#64748b;">${APP_NAME} &bull; Secure Link</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">Hi ${userName}, tap the button below to choose a new password. This secure link is valid for <strong>30 minutes</strong> and can only be used once.</p>
    ${cta('Choose New Password', resetUrl, '#0369a1')}
    <div style="margin:24px 0 0;background:#f0f9ff;border-radius:10px;padding:14px 18px;border:1px solid #bae6fd;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#0369a1;">Backup link:</p>
      <p style="margin:0;font-size:10px;color:#0369a1;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Didn&rsquo;t request this? No action needed. Your account is safe.</p>
  </div>
  ${footer('Expires in 30 minutes.')}
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.4);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`,

  // V4 — Dark slate, security focused
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#0f172a;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid #334155;">
  <div style="padding:28px 40px;border-bottom:1px solid #334155;">
    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#f59e0b;letter-spacing:.08em;text-transform:uppercase;">&#9888; Security &bull; ${APP_NAME}</p>
    <h1 style="margin:0;color:#f8fafc;font-size:22px;font-weight:800;">Password Reset Request</h1>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${userName}</strong>, we received a request to reset your ${APP_NAME} account password. This link expires in <strong style="color:#f8fafc;">30 minutes</strong>.</p>
    ${cta('Reset Password', resetUrl, '#f59e0b')}
    <div style="margin:20px 0;padding:14px 16px;background:#0f172a;border-radius:8px;border:1px solid #334155;">
      <p style="margin:0 0 4px;font-size:11px;color:#475569;font-weight:700;">Direct link:</p>
      <p style="margin:0;font-size:11px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:12px;color:#475569;line-height:1.7;">If you did not request this, your account is safe. No changes have been made.</p>
  </div>
  <div style="padding:14px 40px;border-top:1px solid #334155;text-align:center;"><p style="margin:0;font-size:11px;color:#334155;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V5 — Rose/red, urgent expiry notice
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff1f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff1f2;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,.1);border:1px solid #fecdd3;">
  <div style="background:linear-gradient(135deg,#881337,#be123c,#f43f5e);padding:32px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:40px;">&#128274;</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">Reset Password</h1>
    <p style="margin:0;color:#fecdd3;font-size:12px;">Expires in 30 minutes</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, a password reset was requested for your ${APP_NAME} account. Act quickly — this link expires soon!</p>
    ${cta('Reset My Password', resetUrl, '#f43f5e')}
    <div style="margin:20px 0 0;padding:14px;background:#fef2f2;border-radius:10px;border:1px solid #fecdd3;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#be123c;">Reset link:</p>
      <p style="margin:0;font-size:11px;color:#be123c;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Ignore this email if you didn&rsquo;t request a reset.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V6 — Emerald, calm reassuring
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(16,185,129,.08);border:1px solid #a7f3d0;">
  <div style="height:4px;background:linear-gradient(90deg,#10b981,#059669);"></div>
  <div style="padding:36px 40px;text-align:center;">
    <p style="margin:0 0 12px;font-size:48px;line-height:1;">&#128272;</p>
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e293b;">Password Reset</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#059669;">${APP_NAME} &bull; Secure Recovery</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, no worries! Just click below to set a new password. The link expires in <strong>30 minutes</strong>.</p>
    ${cta('Set New Password', resetUrl, '#059669')}
    <div style="margin:20px 0 0;padding:14px;background:#f0fdf4;border-radius:10px;border:1px solid #a7f3d0;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#059669;">Or use this link:</p>
      <p style="margin:0;font-size:10px;color:#047857;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Didn&rsquo;t ask for this? Your account is safe — just ignore this email.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V7 — Corporate letterhead style
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="border-bottom:2px solid #1e293b;padding:20px 48px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;font-family:-apple-system,sans-serif;">${APP_NAME}</p></td>
      <td style="text-align:right;font-size:11px;color:#64748b;font-family:-apple-system,sans-serif;">PASSWORD RESET REQUEST</td>
    </tr></table>
  </div>
  <div style="padding:32px 48px;">
    <p style="margin:0 0 14px;font-size:15px;color:#1e293b;font-family:-apple-system,sans-serif;">Dear <strong>${userName}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">We received a request to reset the password associated with your ${APP_NAME} account. Please click the link below within the next <strong>30 minutes</strong> to complete the reset.</p>
    ${cta('Reset Password', resetUrl, '#1e293b')}
    <div style="margin:24px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 20px;font-family:-apple-system,sans-serif;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#475569;">If the button above does not work, paste this URL:</p>
      <p style="margin:0;font-size:11px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.85;font-family:-apple-system,sans-serif;">If you did not initiate this request, please disregard this message. Your account remains protected.</p>
  </div>
  <div style="background:#f8fafc;padding:14px 48px;border-top:1px solid #e2e8f0;text-align:center;font-family:-apple-system,sans-serif;"><p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V8 — Amber, time-sensitive design
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fffbeb;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(245,158,11,.1);border:1px solid #fde68a;">
  <div style="background:linear-gradient(135deg,#78350f,#b45309,#d97706);padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">&#9201; Password Reset</h1><p style="margin:0;color:#fde68a;font-size:12px;">Link expires in 30 minutes</p></td>
      <td style="text-align:right;font-size:48px;line-height:1;">&#128274;</td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, use the button below to reset your ${APP_NAME} password. This secure link is time-sensitive!</p>
    ${cta('Reset Password Now', resetUrl, '#d97706')}
    <div style="margin:20px 0;background:#fef3c7;border-radius:10px;padding:14px;border:1px solid #fde68a;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#92400e;">Backup link:</p>
      <p style="margin:0;font-size:10px;color:#a16207;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t request this? Ignore this email. Your account is safe.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V9 — Violet, split layout
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#faf5ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,.1);">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:140px;background:linear-gradient(180deg,#3b0764,#6d28d9,#7c3aed);padding:36px 20px;vertical-align:middle;text-align:center;">
        <p style="margin:0 0 8px;font-size:40px;line-height:1;">&#128274;</p>
        <p style="margin:0;font-size:11px;font-weight:700;color:#ddd6fe;text-transform:uppercase;letter-spacing:.04em;">Reset</p>
      </td>
      <td style="padding:28px 28px;vertical-align:top;">
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#1e293b;">Password Reset</h1>
        <p style="margin:0 0 14px;font-size:13px;color:#475569;line-height:1.7;">Hi ${userName}, click below to set a new password. Link expires in <strong>30 min</strong>.</p>
        ${cta('Reset Now', resetUrl, '#7c3aed')}
        <p style="margin:14px 0 4px;font-size:10px;font-weight:700;color:#6d28d9;">Or paste:</p>
        <p style="margin:0;font-size:10px;color:#7c3aed;word-break:break-all;">${resetUrl}</p>
        <p style="margin:14px 0 0;font-size:11px;color:#94a3b8;">Didn&rsquo;t request this? Ignore safely.</p>
      </td>
    </tr>
  </table>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V10 — Teal, left border accent
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdfa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(20,184,166,.1);">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="width:6px;background:linear-gradient(180deg,#0f766e,#0d9488,#14b8a6);">&nbsp;</td>
    <td style="padding:36px 32px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:.08em;text-transform:uppercase;">Password Recovery &bull; ${APP_NAME}</p>
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#1e293b;">Reset Your Password &#128272;</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, tap below to choose a new ${APP_NAME} password. This link is valid for <strong>30 minutes</strong>.</p>
      ${cta('Reset Password', resetUrl, '#0f766e')}
      <div style="margin:20px 0;background:#f0fdfa;border-radius:8px;padding:12px 16px;border:1px solid #99f6e4;">
        <p style="margin:0 0 4px;font-size:11px;color:#0f766e;font-weight:700;">Backup link:</p>
        <p style="margin:0;font-size:10px;color:#047857;word-break:break-all;">${resetUrl}</p>
      </div>
      <p style="margin:0;font-size:12px;color:#94a3b8;">Ignore if you didn&rsquo;t request this. No changes have been made.</p>
    </td>
  </tr></table>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V11 — Sky blue, steps design
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,165,233,.1);">
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9);padding:32px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Account Security</p>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Password Reset</h1>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, here&rsquo;s how to reset your password:</p>
    ${[['1','Click the button below'],['2','Enter your new password'],['3','Log in with your new credentials']].map(([n,l])=>`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
      <td style="width:28px;height:28px;background:#0369a1;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;font-weight:900;color:#fff;min-width:28px;">${n}</td>
      <td style="padding-left:12px;font-size:13px;color:#1e293b;">${l}</td>
    </tr></table>`).join('')}
    ${cta('Reset My Password', resetUrl, '#0369a1')}
    <p style="margin:16px 0 4px;font-size:11px;font-weight:700;color:#64748b;">Direct link (expires in 30 min):</p>
    <p style="margin:0 0 12px;font-size:10px;color:#0369a1;word-break:break-all;">${resetUrl}</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Ignore this if you didn&rsquo;t request a reset.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V12 — Navy + gold, premium look
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#020617;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid #1e293b;">
  <div style="border-bottom:2px solid #f59e0b;padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#f59e0b;letter-spacing:.06em;text-transform:uppercase;">${APP_NAME} &bull; Password Recovery</p><h1 style="margin:0;color:#f8fafc;font-size:22px;font-weight:800;">Reset Your Password</h1></td>
      <td style="text-align:right;font-size:40px;">&#128274;</td>
    </tr></table>
  </div>
  <div style="padding:24px 40px;">
    <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;line-height:1.75;">Hi <strong style="color:#e2e8f0;">${userName}</strong>, a password reset was requested for your account. This link expires in <strong style="color:#f59e0b;">30 minutes</strong>.</p>
    ${cta('Reset Password', resetUrl, '#f59e0b')}
    <div style="margin:20px 0;background:#020617;border:1px solid #334155;border-radius:8px;padding:14px;">
      <p style="margin:0 0 4px;font-size:11px;color:#475569;font-weight:700;">Backup link:</p>
      <p style="margin:0;font-size:10px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:12px;color:#475569;">Didn&rsquo;t request this? Your account is safe.</p>
  </div>
  <div style="padding:14px 40px;border-top:1px solid #1e293b;text-align:center;"><p style="margin:0;font-size:11px;color:#1e293b;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V13 — Rose gradient, big centered icon
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fdf2f8;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(219,39,119,.1);border:1px solid #fbcfe8;">
  <div style="padding:44px 40px 24px;text-align:center;">
    <div style="width:80px;height:80px;background:linear-gradient(135deg,#be185d,#ec4899);border-radius:24px;margin:0 auto 16px;line-height:80px;font-size:36px;">&#128274;</div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#1e293b;">Forgot your password?</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#db2777;">No worries — we&rsquo;ve got you, ${userName}!</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">Click the button below to reset your password. This link expires in 30 minutes.</p>
    ${cta('Reset My Password', resetUrl, '#db2777')}
    <p style="margin:20px 0 4px;font-size:11px;color:#94a3b8;">Or use this link:</p>
    <p style="margin:0;font-size:10px;color:#db2777;word-break:break-all;">${resetUrl}</p>
  </div>
  ${footer('Ignore this email if you did not request a password reset.')}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V14 — Warm stone, newspaper style
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;background:#fafaf9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="border-bottom:3px double #1c1917;padding-bottom:14px;text-align:center;">
  <p style="margin:0 0 2px;font-size:20px;font-weight:700;color:#1c1917;">${APP_NAME}</p>
  <p style="margin:0;font-size:11px;color:#78716c;letter-spacing:.06em;text-transform:uppercase;">Password Reset Notice</p>
</td></tr>
<tr><td style="padding:24px 0;">
  <p style="margin:0 0 16px;font-size:15px;color:#1c1917;font-family:-apple-system,sans-serif;">Dear <strong>${userName}</strong>,</p>
  <p style="margin:0 0 20px;font-size:14px;color:#44403c;line-height:1.85;font-family:-apple-system,sans-serif;">A password reset has been requested for your account. Please follow the link below within <strong>30 minutes</strong> to complete the process.</p>
  ${cta('Reset Password', resetUrl, '#1c1917')}
  <div style="margin:20px 0;border-top:1px solid #e7e5e4;border-bottom:1px solid #e7e5e4;padding:14px 0;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#57534e;font-family:-apple-system,sans-serif;">Direct link:</p>
    <p style="margin:0;font-size:11px;color:#78716c;font-family:-apple-system,sans-serif;word-break:break-all;">${resetUrl}</p>
  </div>
  <p style="margin:0;font-size:13px;color:#78716c;line-height:1.85;font-family:-apple-system,sans-serif;">If you did not initiate this request, disregard this message. Your account has not been changed.</p>
</td></tr>
<tr><td style="border-top:1px solid #e7e5e4;padding-top:14px;text-align:center;font-family:-apple-system,sans-serif;"><p style="margin:0;font-size:11px;color:#a8a29e;">&copy; ${YEAR} ${APP_NAME}</p></td></tr>
</table></td></tr></table></body></html>`,

  // V15 — Cyan, compact mobile
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ecfeff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;background:#ecfeff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:400px;">
<tr><td style="background:#0891b2;border-radius:12px 12px 0 0;padding:16px 20px;text-align:center;">
  <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">&#128274; ${APP_NAME} &bull; Password Reset</p>
</td></tr>
<tr><td style="background:#fff;padding:24px 20px;">
  <p style="margin:0 0 12px;font-size:14px;color:#1e293b;">Hi <strong>${userName}</strong>, tap below to reset your password. Link expires in <strong>30 min</strong>.</p>
  ${cta('Reset Password', resetUrl, '#0891b2')}
  <p style="margin:16px 0 4px;font-size:11px;color:#0891b2;font-weight:700;">Or copy:</p>
  <p style="margin:0;font-size:10px;color:#0e7490;word-break:break-all;">${resetUrl}</p>
  <p style="margin:14px 0 0;font-size:11px;color:#94a3b8;">Ignore if not requested. Account is safe.</p>
</td></tr>
<tr><td style="background:#ecfeff;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;border-top:1px solid #a5f3fc;">
  <p style="margin:0;font-size:10px;color:#22d3ee;">&copy; ${YEAR} ${APP_NAME}</p>
</td></tr>
</table></td></tr></table></body></html>`,

  // V16 — Orange + gradient, friendly
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff7ed;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,.1);border:1px solid #fed7aa;">
  <div style="background:linear-gradient(135deg,#c2410c,#ea580c,#fb923c);padding:36px 40px;text-align:center;">
    <p style="margin:0 0 10px;font-size:48px;">&#128272;</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">Password Reset</h1>
    <p style="margin:0;color:#fed7aa;font-size:12px;">30-minute secure link</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hey <strong>${userName}</strong>! You requested a password reset. Click below to set a new one — quick, it expires soon!</p>
    ${cta('Reset My Password', resetUrl, '#ea580c')}
    <div style="margin:20px 0;background:#fff7ed;border-radius:10px;padding:12px 16px;border:1px solid #fed7aa;">
      <p style="margin:0 0 4px;font-size:11px;color:#c2410c;font-weight:700;">Backup link:</p>
      <p style="margin:0;font-size:10px;color:#ea580c;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Ignore this if it wasn&rsquo;t you.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V17 — Indigo + rainbow stripe
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#eef2ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,.1);">
  <div style="height:5px;background:linear-gradient(90deg,#4338ca,#7c3aed,#db2777,#ea580c);"></div>
  <div style="padding:36px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
      <td><h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#1e293b;">Password Reset</h1><p style="margin:0;font-size:13px;color:#4338ca;">${APP_NAME} &bull; Secure link expires in 30 min</p></td>
      <td style="text-align:right;font-size:44px;line-height:1;">&#128274;</td>
    </tr></table>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, click the button below to reset your ${APP_NAME} account password.</p>
    ${cta('Reset My Password', resetUrl, '#4338ca')}
    <div style="margin:20px 0;background:#eef2ff;border-radius:10px;padding:14px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#4338ca;">Copy link:</p>
      <p style="margin:0;font-size:10px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Ignore if you didn&rsquo;t request this reset.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V18 — Green dark, plain receipt style
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#052e16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#052e16;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#064e3b;border-radius:16px;overflow:hidden;border:1px solid #065f46;">
  <div style="padding:24px 36px;border-bottom:1px solid #065f46;">
    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#34d399;letter-spacing:.06em;text-transform:uppercase;">${APP_NAME} &bull; Account Security</p>
    <h1 style="margin:0;color:#f0fdfa;font-size:20px;font-weight:800;">Password Reset Request</h1>
  </div>
  <div style="padding:24px 36px;">
    <p style="margin:0 0 16px;font-size:13px;color:#6ee7b7;line-height:1.75;">Hi <strong style="color:#d1fae5;">${userName}</strong>, a password reset was requested for your account. Use the button below — this link is valid for <strong style="color:#34d399;">30 minutes</strong>.</p>
    ${cta('Set New Password', resetUrl, '#10b981')}
    <div style="margin:20px 0;background:#052e16;border:1px solid #065f46;border-radius:8px;padding:12px 14px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6ee7b7;font-weight:700;">Backup URL:</p>
      <p style="margin:0;font-size:10px;color:#34d399;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:12px;color:#065f46;">Not you? Ignore this email safely.</p>
  </div>
  <div style="padding:12px 36px;border-top:1px solid #065f46;text-align:center;"><p style="margin:0;font-size:11px;color:#065f46;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V19 — Slate with info table, professional
  ({ userName, resetUrl }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
  <div style="background:#1e293b;padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 2px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">${APP_NAME} Security</p><p style="margin:0;color:#f8fafc;font-size:20px;font-weight:800;">Password Reset</p></td>
      <td style="text-align:right;font-size:36px;">&#128274;</td>
    </tr></table>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong style="color:#1e293b;">${userName}</strong>, here&rsquo;s the security summary for this password reset request:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
      ${[['Requested',t+' IST'],['Expires','30 minutes from now'],['Account',userName],['Status','Link ready']].map(([l,v],i)=>`
      <tr style="${i>0?'border-top:1px solid #f1f5f9;':''}">
        <td style="padding:9px 14px;font-size:11px;font-weight:700;color:#64748b;">${l}</td>
        <td style="padding:9px 14px;font-size:12px;color:#1e293b;">${v}</td>
      </tr>`).join('')}
    </table>
    ${cta('Reset Password', resetUrl, '#1e293b')}
    <p style="margin:16px 0 4px;font-size:11px;font-weight:700;color:#64748b;">Backup link:</p>
    <p style="margin:0;font-size:10px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
    <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;">If this wasn&rsquo;t you, your account is safe. No action needed.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // V20 — Deep blue, key icon, clean
  ({ userName, resetUrl }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#eff6ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,.1);border:1px solid #bfdbfe;">
  <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8,#2563eb);padding:36px 40px;text-align:center;">
    <p style="margin:0 0 12px;font-size:48px;line-height:1;">&#128273;</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:800;">Password Reset</h1>
    <p style="margin:0;color:#bfdbfe;font-size:12px;">${APP_NAME} &bull; Expires in 30 minutes</p>
  </div>
  <div style="padding:28px 40px;">
    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>, we&rsquo;ve received a request to reset your ${APP_NAME} password. Use the button below to set a new one.</p>
    ${cta('Reset My Password', resetUrl, '#1d4ed8')}
    <div style="margin:20px 0;background:#eff6ff;border-radius:10px;padding:14px;border:1px solid #bfdbfe;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#1d4ed8;">Backup link:</p>
      <p style="margin:0;font-size:10px;color:#2563eb;word-break:break-all;">${resetUrl}</p>
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;">If you did not request a password reset, ignore this email. Your account remains secure.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,
];

async function sendPasswordResetEmail(user, resetUrl) {
  const html = pickRandom(passwordResetVariants)({ userName: user.name, resetUrl });
  return sendMail({ to: user.email, subject: `${APP_NAME}: Reset your password`, html });
}

// ══════════════════════════════════════════════════════════════════════════════
// OTP EMAIL  (20 variants)
// ══════════════════════════════════════════════════════════════════════════════

const otpVariants = [

  // V1 — Emerald, dashed box, original
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(5,150,105,.1);">
  <div style="background:linear-gradient(135deg,#064e3b,#059669);padding:40px;text-align:center;">
    <p style="margin:0 0 10px;font-size:36px;">&#128272;</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:800;">Password Change OTP</h1>
    <p style="margin:0;color:#6ee7b7;font-size:13px;">${APP_NAME} &bull; Security Verification</p>
  </div>
  <div style="padding:36px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:14px;color:#475569;">Hi <strong style="color:#1e293b;">${userName}</strong>, use this OTP to confirm your password change:</p>
    <div style="margin:24px auto;background:#f0fdf4;border:2px dashed #10b981;border-radius:16px;padding:20px 36px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#059669;letter-spacing:.1em;text-transform:uppercase;">Your One-Time Password</p>
      <p style="margin:0;font-size:40px;font-weight:900;color:#064e3b;letter-spacing:12px;">${otp}</p>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.7;">This OTP is valid for <strong>10 minutes</strong> and can only be used once.</p>
    <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">If you did not request this, your password has not been changed.</p>
  </div>
  ${footer('OTP requested from Alert-Guard Profile settings.')}
</td></tr><tr><td style="padding-top:18px;text-align:center;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`,

  // V2 — Indigo, large letter-spaced OTP
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#eef2ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,.1);">
  <div style="background:linear-gradient(135deg,#1e1b4b,#4338ca,#6366f1);padding:36px;text-align:center;">
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">Your OTP Code</h1>
    <p style="margin:0;color:#c7d2fe;font-size:12px;">${APP_NAME} &bull; Valid for 10 minutes</p>
  </div>
  <div style="padding:32px 36px;text-align:center;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;">Hi <strong>${userName}</strong>, enter this code to verify your password change:</p>
    <div style="background:#eef2ff;border-radius:16px;padding:24px 20px;margin:0 auto 20px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#4338ca;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">If you didn&rsquo;t request this, your password is unchanged.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V3 — Dark navy, monospace OTP display
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#020617;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid #1e293b;">
  <div style="padding:24px 36px;border-bottom:1px solid #1e293b;">
    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:.08em;font-family:monospace;text-transform:uppercase;">${APP_NAME} &bull; OTP Verification</p>
    <h1 style="margin:0;color:#f8fafc;font-size:20px;font-weight:800;">Password Change Code</h1>
  </div>
  <div style="padding:28px 36px;text-align:center;">
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${userName}</strong>, enter the code below to confirm your password change:</p>
    <div style="background:#020617;border:1px solid #6366f1;border-radius:14px;padding:24px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:11px;color:#6366f1;font-family:monospace;letter-spacing:.08em;text-transform:uppercase;">One-Time Password</p>
      <p style="margin:0;font-size:48px;font-weight:900;color:#fff;letter-spacing:14px;line-height:1;font-family:monospace;">${otp}</p>
    </div>
    <p style="margin:0 0 6px;font-size:12px;color:#475569;">Valid for <strong style="color:#e2e8f0;">10 minutes</strong>. Single use only.</p>
    <p style="margin:0;font-size:11px;color:#334155;">Didn&rsquo;t request this? Your password is unchanged.</p>
  </div>
  <div style="padding:14px 36px;border-top:1px solid #1e293b;text-align:center;"><p style="margin:0;font-size:11px;color:#1e293b;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V4 — Rose, bold OTP in pink box
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff1f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff1f2;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,.1);border:1px solid #fecdd3;">
  <div style="background:linear-gradient(135deg,#881337,#be123c,#f43f5e);padding:36px;text-align:center;">
    <p style="margin:0 0 10px;font-size:36px;">&#128272;</p>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Verification Code</h1>
  </div>
  <div style="padding:32px 36px;text-align:center;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;">Hi ${userName}, here&rsquo;s your OTP for password change:</p>
    <div style="background:#fff1f2;border:2px solid #f43f5e;border-radius:16px;padding:22px 20px;margin:0 auto 20px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#f43f5e;letter-spacing:.08em;text-transform:uppercase;">Enter this code</p>
      <p style="margin:0;font-size:48px;font-weight:900;color:#881337;letter-spacing:12px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Expires in <strong>10 minutes</strong>. One-time use only.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Not you? Your password is safe — ignore this.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V5 — Sky blue, digit chips
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,165,233,.1);">
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9);padding:32px;text-align:center;">
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">&#128272; OTP Code</h1>
    <p style="margin:0;color:#bae6fd;font-size:12px;">${APP_NAME} Password Change Verification</p>
  </div>
  <div style="padding:28px 36px;text-align:center;">
    <p style="margin:0 0 16px;font-size:13px;color:#475569;">Hi <strong>${userName}</strong>, enter this one-time code:</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr>${otp.split('').map(d=>`<td style="padding:0 4px;"><div style="width:48px;height:64px;background:#f0f9ff;border:2px solid #0369a1;border-radius:12px;text-align:center;line-height:64px;font-size:32px;font-weight:900;color:#0c4a6e;">${d}</div></td>`).join('')}</tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Valid for <strong>10 minutes</strong> only.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t request this? Your account is safe.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V6 — Amber, warning-style secure code
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fffbeb;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(245,158,11,.12);border:1px solid #fde68a;">
  <div style="background:linear-gradient(135deg,#78350f,#b45309,#d97706);padding:32px;text-align:center;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Security Code</p>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Password Change OTP</h1>
  </div>
  <div style="padding:28px 36px;text-align:center;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;">Hi <strong>${userName}</strong>, use this code to verify your password change:</p>
    <div style="background:#fef3c7;border-radius:16px;padding:22px;margin:0 auto 20px;border:2px solid #fde68a;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.06em;">OTP Code</p>
      <p style="margin:0;font-size:52px;font-weight:900;color:#78350f;letter-spacing:12px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Expires in <strong>10 minutes</strong>. Never share this code.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t request this? Ignore safely.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V7 — Full gradient background
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#0f172a,#1e1b4b,#2e1065);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:rgba(255,255,255,.97);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);">
  <div style="padding:36px 36px 24px;text-align:center;">
    <p style="margin:0 0 12px;font-size:52px;line-height:1;">&#128272;</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#1e293b;">Verification OTP</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#64748b;">${APP_NAME} &bull; Password Change</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;">Hi <strong>${userName}</strong>, enter this code to confirm your request:</p>
    <div style="background:#f5f3ff;border-radius:16px;padding:24px;margin:0 auto 20px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#6d28d9;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Valid for <strong>10 minutes</strong>. One-time use.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Not you? Your account is unchanged.</p>
  </div>
  ${footer()}
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.3);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`,

  // V8 — Teal, left ribbon card
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0fdfa;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(20,184,166,.1);">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="width:6px;background:linear-gradient(180deg,#0f766e,#0d9488,#14b8a6);">&nbsp;</td>
    <td style="padding:32px 28px;text-align:center;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:.06em;text-transform:uppercase;">${APP_NAME} &bull; OTP</p>
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#1e293b;">Hi ${userName}, your verification code:</h1>
      <div style="background:#f0fdfa;border:2px dashed #14b8a6;border-radius:16px;padding:20px;margin:0 auto 20px;">
        <p style="margin:0;font-size:48px;font-weight:900;color:#0f766e;letter-spacing:12px;line-height:1;">${otp}</p>
      </div>
      <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Expires in <strong>10 min</strong>. One-time only.</p>
      <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t ask? Your password is unchanged.</p>
    </td>
  </tr></table>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V9 — Corporate gray, formal
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="border-bottom:2px solid #1e293b;padding:18px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e293b;font-family:-apple-system,sans-serif;">${APP_NAME}</p></td>
      <td style="text-align:right;font-size:11px;color:#64748b;font-family:-apple-system,sans-serif;">SECURITY VERIFICATION CODE</td>
    </tr></table>
  </div>
  <div style="padding:32px 40px;text-align:center;">
    <p style="margin:0 0 14px;font-size:15px;color:#1e293b;font-family:-apple-system,sans-serif;">Dear <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.85;font-family:-apple-system,sans-serif;">As requested, please use the following one-time password to verify your password change. This code expires in <strong>10 minutes</strong> and is valid for a single use only.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin:0 auto 24px;">
      <p style="margin:0;font-size:48px;font-weight:900;color:#1e293b;letter-spacing:14px;line-height:1;font-family:-apple-system,sans-serif;">${otp}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;font-family:-apple-system,sans-serif;">If you did not initiate this request, your password has not been changed and no action is required.</p>
  </div>
  <div style="background:#f8fafc;padding:14px 40px;border-top:1px solid #e2e8f0;text-align:center;font-family:-apple-system,sans-serif;"><p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V10 — White minimal, huge OTP
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;">
<tr><td style="padding-bottom:20px;border-bottom:2px solid #1e293b;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">${APP_NAME}</p>
</td></tr>
<tr><td style="padding:32px 0;text-align:center;">
  <p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hi ${userName}, your OTP:</p>
  <p style="margin:20px 0;font-size:64px;font-weight:900;color:#1e293b;letter-spacing:16px;line-height:1;">${otp}</p>
  <p style="margin:0 0 8px;font-size:14px;color:#475569;">Valid for <strong>10 minutes</strong>.</p>
  <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t request this? Ignore it.</p>
</td></tr>
<tr><td style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;"><p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p></td></tr>
</table></td></tr></table></body></html>`,

  // V11 — Navy sidebar + OTP
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f1f5f9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:130px;background:#0f172a;padding:36px 20px;vertical-align:middle;text-align:center;">
        <p style="margin:0 0 8px;font-size:36px;line-height:1;">&#128272;</p>
        <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">OTP</p>
      </td>
      <td style="padding:28px 28px;text-align:center;vertical-align:middle;">
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Hi <strong style="color:#1e293b;">${userName}</strong>, your verification code:</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:18px;margin:12px 0;">
          <p style="margin:0;font-size:48px;font-weight:900;color:#0f172a;letter-spacing:12px;line-height:1;">${otp}</p>
        </div>
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Valid <strong>10 minutes</strong>. One-time use.</p>
        <p style="margin:0;font-size:11px;color:#94a3b8;">Not you? Password unchanged.</p>
      </td>
    </tr>
  </table>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V12 — Orange gradient
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#fff7ed;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,.1);border:1px solid #fed7aa;">
  <div style="background:linear-gradient(135deg,#c2410c,#ea580c,#fb923c);padding:32px;text-align:center;">
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">&#128272; Verification Code</h1>
    <p style="margin:0;color:#fed7aa;font-size:12px;">${APP_NAME} &bull; 10 minutes only</p>
  </div>
  <div style="padding:28px 36px;text-align:center;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;">Hi <strong>${userName}</strong>, use this OTP:</p>
    <div style="background:#fff7ed;border:2px solid #fb923c;border-radius:16px;padding:22px;margin:0 auto 20px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#c2410c;letter-spacing:12px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Expires in <strong>10 min</strong>. Keep it secret.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Not you? Ignore safely.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V13 — Violet, rainbow stripe
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#faf5ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,.1);">
  <div style="height:5px;background:linear-gradient(90deg,#f43f5e,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6);"></div>
  <div style="padding:32px 36px;text-align:center;">
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e293b;">OTP Verification</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#7c3aed;">${APP_NAME} &bull; Password Change</p>
    <p style="margin:0 0 16px;font-size:14px;color:#475569;">Hi <strong>${userName}</strong>, enter this code to confirm:</p>
    <div style="background:#f5f3ff;border-radius:16px;padding:24px;margin:0 auto 20px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#7c3aed;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Valid <strong>10 minutes</strong>.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t request this? Ignore it.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V14 — Compact mobile card
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:380px;">
<tr><td style="background:#4338ca;border-radius:12px 12px 0 0;padding:14px 20px;text-align:center;">
  <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:.04em;">&#128272; ${APP_NAME} &bull; Verification Code</p>
</td></tr>
<tr><td style="background:#fff;padding:24px 20px;text-align:center;">
  <p style="margin:0 0 14px;font-size:13px;color:#475569;">Hi ${userName}, here&rsquo;s your OTP:</p>
  <div style="background:#eef2ff;border-radius:14px;padding:18px;margin:0 auto 16px;">
    <p style="margin:0;font-size:44px;font-weight:900;color:#4338ca;letter-spacing:12px;line-height:1;">${otp}</p>
  </div>
  <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Valid <strong>10 min</strong>. One-time use.</p>
  <p style="margin:0;font-size:11px;color:#94a3b8;">Not you? Ignore.</p>
</td></tr>
<tr><td style="background:#f8fafc;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-size:10px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p>
</td></tr>
</table></td></tr></table></body></html>`,

  // V15 — Green dark, secure terminal
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#000;font-family:monospace;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#000;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#001100;border-radius:16px;overflow:hidden;border:1px solid #003300;">
  <div style="background:#001100;padding:14px 24px;border-bottom:1px solid #003300;">
    <p style="margin:0;font-size:12px;color:#00ff41;font-family:monospace;">${APP_NAME}.verifyOtp()</p>
  </div>
  <div style="padding:28px 24px;text-align:center;font-family:monospace;">
    <p style="margin:0 0 4px;font-size:12px;color:#00cc33;">$ echo "Hi ${userName}, your OTP:"</p>
    <p style="margin:0 0 20px;font-size:12px;color:#009900;">→ Generating secure code...</p>
    <div style="background:#000;border:1px solid #00ff41;border-radius:8px;padding:24px;margin:0 auto 20px;">
      <p style="margin:0;font-size:48px;font-weight:900;color:#00ff41;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 4px;font-size:11px;color:#00cc33;">expires_in=10m &bull; single_use=true</p>
    <p style="margin:0;font-size:11px;color:#003300;">not_you? → ignore_safely</p>
  </div>
  <div style="padding:12px 24px;border-top:1px solid #003300;text-align:center;"><p style="margin:0;font-size:10px;color:#003300;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V16 — Cyan, circle digits
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ecfeff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#ecfeff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(6,182,212,.1);border:1px solid #a5f3fc;">
  <div style="height:5px;background:linear-gradient(90deg,#06b6d4,#0891b2,#0e7490);"></div>
  <div style="padding:32px 36px;text-align:center;">
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1e293b;">&#128272; OTP Code</h1>
    <p style="margin:0 0 16px;font-size:13px;color:#0891b2;">${APP_NAME} &bull; Hi ${userName}!</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;">Your password change verification code:</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr>${otp.split('').map(d=>`<td style="padding:0 4px;"><div style="width:44px;height:56px;background:#ecfeff;border:2px solid #0891b2;border-radius:50%;text-align:center;line-height:56px;font-size:28px;font-weight:900;color:#0e7490;">${d}</div></td>`).join('')}</tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Expires in <strong>10 min</strong>.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Not you? Your password is safe.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  // V17 — Deep indigo, lock receipt
  ({ userName, otp }) => {
    const t = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',timeStyle:'short',dateStyle:'medium'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f8fafc;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
  <div style="background:#1e293b;padding:22px 36px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0 0 2px;font-size:11px;color:#64748b;letter-spacing:.05em;text-transform:uppercase;">${APP_NAME} &bull; Security</p><p style="margin:0;color:#f8fafc;font-size:18px;font-weight:800;">OTP Verification</p></td>
      <td style="text-align:right;font-size:32px;">&#128274;</td>
    </tr></table>
  </div>
  <div style="padding:24px 36px;text-align:center;">
    <p style="margin:0 0 16px;font-size:13px;color:#475569;">Hi <strong style="color:#1e293b;">${userName}</strong>, your one-time password:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:22px;margin:0 auto 20px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#1e293b;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      ${[['Generated',t+' IST'],['Expires','10 minutes'],['Use','One-time only']].map(([l,v])=>`<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px 0;font-size:11px;color:#94a3b8;text-align:left;">${l}</td><td style="padding:6px 0;font-size:12px;color:#1e293b;text-align:right;">${v}</td></tr>`).join('')}
    </table>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Not you? Your account is unchanged.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`;
  },

  // V18 — Warm stone, newspaper
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;background:#fafaf9;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="border-bottom:3px double #1c1917;padding-bottom:14px;text-align:center;">
  <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:#1c1917;">${APP_NAME}</p>
  <p style="margin:0;font-size:11px;color:#78716c;letter-spacing:.06em;text-transform:uppercase;">Security Verification</p>
</td></tr>
<tr><td style="padding:24px 0;text-align:center;">
  <p style="margin:0 0 14px;font-size:15px;color:#1c1917;font-family:-apple-system,sans-serif;">Dear ${userName},</p>
  <p style="margin:0 0 20px;font-size:14px;color:#44403c;line-height:1.85;font-family:-apple-system,sans-serif;">Your one-time password for the password change request is:</p>
  <div style="border:1px solid #e7e5e4;border-radius:8px;padding:20px;margin:0 auto 20px;background:#fff;">
    <p style="margin:0;font-size:52px;font-weight:900;color:#1c1917;letter-spacing:14px;line-height:1;font-family:-apple-system,sans-serif;">${otp}</p>
  </div>
  <p style="margin:0 0 8px;font-size:13px;color:#78716c;font-family:-apple-system,sans-serif;">Valid for <strong>10 minutes</strong>. Single use only.</p>
  <p style="margin:0;font-size:12px;color:#a8a29e;font-family:-apple-system,sans-serif;">Did not request this? No action needed.</p>
</td></tr>
<tr><td style="border-top:1px solid #e7e5e4;padding-top:14px;text-align:center;font-family:-apple-system,sans-serif;"><p style="margin:0;font-size:11px;color:#a8a29e;">&copy; ${YEAR} ${APP_NAME}</p></td></tr>
</table></td></tr></table></body></html>`,

  // V19 — Maroon dark, emergency style
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#1a0000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#1a0000;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#2d0000;border-radius:20px;overflow:hidden;border:1px solid #7f1d1d;">
  <div style="padding:24px 36px;border-bottom:1px solid #7f1d1d;">
    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#ef4444;letter-spacing:.08em;font-family:monospace;text-transform:uppercase;">${APP_NAME} &bull; SECURITY CODE</p>
    <h1 style="margin:0;color:#fecaca;font-size:20px;font-weight:800;">OTP Verification</h1>
  </div>
  <div style="padding:28px 36px;text-align:center;">
    <p style="margin:0 0 16px;font-size:13px;color:#fca5a5;">Hi <strong style="color:#fecaca;">${userName}</strong>, your verification code:</p>
    <div style="background:#1a0000;border:2px solid #ef4444;border-radius:14px;padding:24px;margin:0 auto 20px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#fca5a5;letter-spacing:14px;line-height:1;font-family:monospace;">${otp}</p>
    </div>
    <p style="margin:0 0 6px;font-size:12px;color:#f87171;">Expires in <strong>10 minutes</strong>. Do not share.</p>
    <p style="margin:0;font-size:11px;color:#7f1d1d;">Not you? Your password is unchanged.</p>
  </div>
  <div style="padding:12px 36px;border-top:1px solid #7f1d1d;text-align:center;"><p style="margin:0;font-size:10px;color:#7f1d1d;">&copy; ${YEAR} ${APP_NAME}</p></div>
</td></tr></table></td></tr></table></body></html>`,

  // V20 — Blue bright, with countdown message
  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#eff6ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,.1);border:1px solid #bfdbfe;">
  <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8,#2563eb);padding:32px;text-align:center;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Verification</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">Your OTP Code</h1>
    <p style="margin:0;color:#bfdbfe;font-size:12px;">Valid for 10 minutes &bull; Single use</p>
  </div>
  <div style="padding:28px 36px;text-align:center;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;">Hi <strong>${userName}</strong>, enter this code to confirm your password change:</p>
    <div style="background:#eff6ff;border:2px solid #2563eb;border-radius:18px;padding:24px;margin:0 auto 20px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#1d4ed8;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">⏱️ Use this within <strong>10 minutes</strong>.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Not you? Your password is unchanged — safely ignore this.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,
];

async function sendOtpEmail(user, otp) {
  const html = pickRandom(otpVariants)({ userName: user.name, otp });
  return sendMail({ to: user.email, subject: `${APP_NAME}: Your password change OTP — ${otp}`, html });
}

// ══════════════════════════════════════════════════════════════════════════════
// SIGNUP EMAIL VERIFICATION  (6 variants)
// ══════════════════════════════════════════════════════════════════════════════

const signupVerificationVariants = [

  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#eff6ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,.1);border:1px solid #bfdbfe;">
  <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8,#2563eb);padding:40px;text-align:center;">
    <p style="margin:0 0 12px;font-size:52px;line-height:1;">&#9993;&#65039;</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;">Verify Your Email</h1>
    <p style="margin:0;color:#bfdbfe;font-size:13px;">${APP_NAME} &bull; Account Verification</p>
  </div>
  <div style="padding:36px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:15px;color:#1e293b;">Hi <strong>${userName}</strong> — almost there!</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">Enter the 6-digit code below to verify your email address and complete your ${APP_NAME} account setup.</p>
    <div style="background:#eff6ff;border:2px solid #2563eb;border-radius:20px;padding:24px 20px;margin:0 auto 24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#1d4ed8;letter-spacing:.1em;text-transform:uppercase;">Verification Code</p>
      <p style="margin:0;font-size:52px;font-weight:900;color:#1e3a8a;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">This code expires in <strong>10 minutes</strong>.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t create an account? Safely ignore this email.</p>
  </div>
  ${footer('Code is valid for 10 minutes and can only be used once.')}
</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#f0fdf4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(16,185,129,.1);border:1px solid #a7f3d0;">
  <div style="height:5px;background:linear-gradient(90deg,#10b981,#059669,#047857);"></div>
  <div style="padding:40px 40px 28px;text-align:center;">
    <p style="margin:0 0 12px;font-size:52px;line-height:1;">&#127881;</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#1e293b;">One step away!</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#059669;">${APP_NAME} &bull; Verify your email to continue</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">Hey <strong>${userName}</strong>! Enter this code in the signup page to activate your account:</p>
    <div style="background:#f0fdf4;border:2px dashed #10b981;border-radius:20px;padding:24px;margin:0 auto 24px;">
      <p style="margin:0;font-size:52px;font-weight:900;color:#064e3b;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Valid for <strong>10 minutes</strong>. One-time use only.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t sign up? Ignore this email.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:rgba(255,255,255,.97);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);">
  <div style="padding:40px 40px 28px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6d28d9;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Email Verification</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1e293b;">Confirm your email</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">Hi <strong>${userName}</strong>! Enter the code below to verify your email and complete signup:</p>
    <div style="background:#f5f3ff;border-radius:18px;padding:26px;margin:0 auto 24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6d28d9;letter-spacing:.08em;text-transform:uppercase;">Your code</p>
      <p style="margin:0;font-size:52px;font-weight:900;color:#4c1d95;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Expires in <strong>10 minutes</strong>.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Not signing up? You can ignore this.</p>
  </div>
  ${footer('Verification code for Alert-Guard signup.')}
</td></tr>
<tr><td style="padding-top:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.3);">&copy; ${YEAR} ${APP_NAME}</td></tr>
</table></td></tr></table></body></html>`,

  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 24px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
<tr><td style="padding-bottom:20px;border-bottom:2px solid #1e293b;">
  <p style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">${APP_NAME}</p>
</td></tr>
<tr><td style="padding:32px 0;text-align:center;">
  <h1 style="margin:0 0 14px;font-size:26px;font-weight:800;color:#1e293b;">Verify your email &#9989;</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.8;">Hi <strong>${userName}</strong>! Use this code to complete your ${APP_NAME} signup:</p>
  <p style="margin:0 0 24px;font-size:64px;font-weight:900;color:#1e293b;letter-spacing:14px;line-height:1;">${otp}</p>
  <p style="margin:0 0 8px;font-size:14px;color:#475569;">Valid for <strong>10 minutes</strong>.</p>
  <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t sign up? Ignore this email.</p>
</td></tr>
<tr><td style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;"><p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${YEAR} ${APP_NAME}</p></td></tr>
</table></td></tr></table></body></html>`,

  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#fff7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;background:#fff7f4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(249,115,22,.1);border:1px solid #fed7aa;">
  <div style="background:linear-gradient(135deg,#c2410c,#ea580c,#fb923c);padding:36px 40px;text-align:center;">
    <p style="margin:0 0 10px;font-size:44px;line-height:1;">&#128233;</p>
    <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;">Verify Your Email</h1>
    <p style="margin:0;color:#fed7aa;font-size:12px;">${APP_NAME} Account Setup</p>
  </div>
  <div style="padding:32px 40px;text-align:center;">
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Hey <strong>${userName}</strong>! You&rsquo;re almost done. Enter this code to activate your ${APP_NAME} account:</p>
    <div style="background:#fff7ed;border:2px solid #fb923c;border-radius:18px;padding:22px 20px;margin:0 auto 20px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:.06em;">Email Verification Code</p>
      <p style="margin:0;font-size:52px;font-weight:900;color:#c2410c;letter-spacing:14px;line-height:1;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Expires in <strong>10 min</strong>.</p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t create an account? Ignore this.</p>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,

  ({ userName, otp }) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f0f9ff;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,165,233,.1);">
  <div style="height:5px;background:linear-gradient(90deg,#f43f5e,#fb923c,#facc15,#4ade80,#22d3ee,#818cf8);"></div>
  <div style="padding:36px 40px;text-align:center;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
      <td style="text-align:center;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#0369a1;letter-spacing:.08em;text-transform:uppercase;">${APP_NAME} &bull; Email Verification</p>
        <h1 style="margin:0 0 14px;font-size:22px;font-weight:800;color:#1e293b;">Hi ${userName}, confirm your email!</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.75;">Enter this code on the signup page to activate your account. It expires in <strong>10 minutes</strong>.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
          <tr>${otp.split('').map(d=>`<td style="padding:0 4px;"><div style="width:48px;height:64px;background:#f0f9ff;border:2px solid #0369a1;border-radius:12px;text-align:center;line-height:64px;font-size:32px;font-weight:900;color:#0c4a6e;">${d}</div></td>`).join('')}</tr>
        </table>
        <p style="margin:0;font-size:12px;color:#94a3b8;">Didn&rsquo;t sign up? Ignore this email.</p>
      </td>
    </tr></table>
  </div>
  ${footer()}</td></tr>${brandFooter()}</table></td></tr></table></body></html>`,
];

async function sendSignupVerificationEmail(user, otp) {
  const html = pickRandom(signupVerificationVariants)({ userName: user.name, otp });
  return sendMail({ to: user.email, subject: `${APP_NAME}: Your verification code — ${otp}`, html });
}

module.exports = {
  verifySmtp,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendReminderDigest,
  sendOverdueAlert,
  sendTestEmail,
  sendPasswordResetEmail,
  sendOtpEmail,
  sendSignupVerificationEmail,
  sendMail,
};
