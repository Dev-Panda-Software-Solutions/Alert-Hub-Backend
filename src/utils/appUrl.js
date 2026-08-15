// Canonical public URL of the frontend — used to build links inside emails.
// CLIENT_URL is also read elsewhere for CORS, but a bad value there (e.g. "*",
// used to mean "allow all origins") must never leak into an email link.
const DEFAULT_APP_URL = 'https://alert-hub-roan.vercel.app';

function getAppUrl() {
  const raw = (process.env.CLIENT_URL || '').split(',')[0].trim();
  if (/^https?:\/\/[^*\s]+$/i.test(raw)) return raw.replace(/\/+$/, '');
  return DEFAULT_APP_URL;
}

module.exports = { getAppUrl, DEFAULT_APP_URL };
