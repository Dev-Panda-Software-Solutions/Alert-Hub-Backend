require('dotenv').config();
const app = require('./src/app');
const { verifySmtp }    = require('./src/services/email.service');
const { startCronJobs } = require('./src/services/cron.service');

const PORT = process.env.PORT || 3005;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 AlertHub API is running`);
  console.log(`   URL  : http://localhost:${PORT}`);
  console.log(`   ENV  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB   : ${process.env.DATABASE_URL?.split('@')[1] || 'local postgres'}`);
  console.log(`   SMTP : ${process.env.SMTP_USER || 'not configured'}\n`);

  // Cron ALWAYS starts — never blocked by SMTP
  startCronJobs();

  // SMTP check is fire-and-forget — errors never crash the server
  verifySmtp().catch(() => {});
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
