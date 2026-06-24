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
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Always allow any localhost port in development
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    // In production, restrict to configured CLIENT_URL
    const allowed = process.env.CLIENT_URL;
    if (allowed && origin === allowed) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
