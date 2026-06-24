const svc = require('../services/insights.service');

// GET /api/insights
const insights = async (req, res, next) => {
  try {
    const userId     = req.user.id;
    const simBalance = req.user.simBalance || 75000;

    if (req.user.sandbox) {
      return res.json({ insights: sandboxInsights() });
    }

    const result = await svc.generateInsights(userId, simBalance);
    res.json({ insights: result });
  } catch (err) { next(err); }
};

// GET /api/insights/cashflow
const cashflow = async (req, res, next) => {
  try {
    if (req.user.sandbox) {
      return res.json({ points: sandboxCashflow() });
    }
    const points = await svc.cashflowChart(req.user.id);
    res.json({ points });
  } catch (err) { next(err); }
};

// POST /api/insights/query
const query = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(422).json({ error: 'question is required.' });
    }

    const simBalance = req.user.simBalance || 75000;
    const answer = req.user.sandbox
      ? "In sandbox mode, I'm working with demo data. Sign up to get personalised insights!"
      : await svc.processQuery(req.user.id, question, simBalance);

    res.json({ question, answer });
  } catch (err) { next(err); }
};

// ── sandbox data ─────────────────────────────────────────────────────────────

function sandboxInsights() {
  return [
    { type: 'weekly_outflow', severity: 'warning', title: 'Weekly Cash Outflow', body: '₹18,500 is due in the next 7 days across 3 reminders.', affectedIds: [] },
    { type: 'liquidity_alert', severity: 'info', title: 'Liquidity Alert', body: 'Monthly obligations consume 56% of your simulated balance.', affectedIds: [] },
    { type: 'subscription_audit', severity: 'info', title: 'Subscription Audit', body: 'You have 3 recurring subscriptions totalling ₹2,100/mo. Review for unused services.', affectedIds: [] },
  ];
}

function sandboxCashflow() {
  const today = new Date();
  return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(today); d.setDate(d.getDate() + offset);
    return {
      date: d.toISOString().split('T')[0],
      outflow: Math.round(Math.random() * 12000 + 1000),
      paid: offset < 0 ? Math.round(Math.random() * 8000) : 0,
    };
  });
}

module.exports = { insights, cashflow, query };
