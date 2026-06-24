// Middleware factory: require minimum plan tier
const PLAN_RANK = { FREE: 0, PERSONAL: 1, FAMILY: 2, BUSINESS: 3 };

const requirePlan = (minPlan) => (req, res, next) => {
  const userPlan = req.user?.plan || 'FREE';
  if (PLAN_RANK[userPlan] < PLAN_RANK[minPlan]) {
    return res.status(403).json({
      error: `This feature requires the ${minPlan} plan or higher.`,
      requiredPlan: minPlan,
      currentPlan: userPlan,
    });
  }
  next();
};

// Sanitise channels array based on user plan before saving
const sanitiseChannels = (channels = [], plan = 'FREE') => {
  const rank = PLAN_RANK[plan];
  return channels.filter((ch) => {
    if (ch === 'push')      return true;
    if (ch === 'email')     return rank >= PLAN_RANK.PERSONAL;
    if (ch === 'whatsapp')  return rank >= PLAN_RANK.PERSONAL;
    if (ch === 'sms')       return rank >= PLAN_RANK.FAMILY;
    return false;
  });
};

module.exports = { requirePlan, sanitiseChannels, PLAN_RANK };
