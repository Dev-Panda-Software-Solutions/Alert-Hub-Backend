const PLAN_RANK = { FREE: 0, PERSONAL: 1, FAMILY: 2, BUSINESS: 3 };

// Returns the plan the user is effectively on right now.
// FREE users with an active trial behave as PERSONAL.
const effectivePlan = (user = {}) => {
  if (!user) return 'FREE';
  if (PLAN_RANK[user.plan] >= PLAN_RANK.PERSONAL) return user.plan;
  if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) return 'PERSONAL';
  return user.plan || 'FREE';
};

// Middleware factory: require minimum plan tier (respects trial)
const requirePlan = (minPlan) => (req, res, next) => {
  const plan = effectivePlan(req.user);
  if (PLAN_RANK[plan] < PLAN_RANK[minPlan]) {
    return res.status(403).json({
      error: `This feature requires the ${minPlan} plan or higher.`,
      requiredPlan: minPlan,
      currentPlan: plan,
    });
  }
  next();
};

// Sanitise channels array based on effective plan before saving
const sanitiseChannels = (channels = [], plan = 'FREE') => {
  const rank = PLAN_RANK[plan] ?? 0;
  return channels.filter((ch) => {
    if (ch === 'push')      return true;
    if (ch === 'email')     return rank >= PLAN_RANK.PERSONAL;
    if (ch === 'whatsapp')  return rank >= PLAN_RANK.PERSONAL;
    if (ch === 'sms')       return rank >= PLAN_RANK.FAMILY;
    return false;
  });
};

module.exports = { requirePlan, sanitiseChannels, effectivePlan, PLAN_RANK };
