const jwt = require('jsonwebtoken');

// Verifies the JWT carries the { admin: true } claim minted by admin.controller#login.
// No DB lookup — the single admin account lives entirely in env vars, not the users table.
const adminAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please log in.' });
    }

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    if (!decoded.admin) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = adminAuth;
