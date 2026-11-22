// SecureScan JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'securescan_dev_jwt_secret_key_change_in_production_987654321';

async function authenticateToken(req, res, next) {
  try {
    // Check for token in signed/regular cookies or Authorization header
    let token = req.cookies?.securescan_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. Please sign in.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to confirm account is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({
        error: 'User session invalid. Account not found.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication credentials.' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
};
