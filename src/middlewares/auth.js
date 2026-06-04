'use strict';
const { verifyToken } = require('../token');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : req.cookies && req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Token yaroqsiz yoki muddati o\'tgan' });
  }
}

function requireRole(...roles) {
  return [requireAuth, (req, res, next) => {
    // Admins bypass role checks
    if (req.user.role === 'admin') return next();
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }
    next();
  }];
}

module.exports = { requireAuth, requireRole };
