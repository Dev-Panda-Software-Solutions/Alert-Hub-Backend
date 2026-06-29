const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes      = require('./routes/auth.routes');
const userRoutes      = require('./routes/user.routes');
const reminderRoutes  = require('./routes/reminder.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const calendarRoutes  = require('./routes/calendar.routes');
const insightsRoutes  = require('./routes/insights.routes');
const emailRoutes     = require('./routes/email.routes');
const pushRoutes      = require('./routes/push.routes');
const errorHandler    = require('./middleware/errorHandler');

const app = express();

// ── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────────────────────
// Override helmet's CORP: same-origin so cross-origin <img> tags can load avatars
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/user',      userRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar',  calendarRoutes);
app.use('/api/insights',  insightsRoutes);
app.use('/api/email',     emailRoutes);
app.use('/api/push',      pushRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AlertHub API', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
