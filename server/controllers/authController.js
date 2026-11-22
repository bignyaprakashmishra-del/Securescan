// SecureScan Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const COOKIE_NAME = 'securescan_token';
const TOKEN_EXPIRY = '7d';

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction, // Secure in production (requires HTTPS)
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function extractAuthFields(req) {
  const rawName =
    req.cleanedName ?? req.body?.name ?? req.body?.fullName ?? req.name ?? '';
  const rawEmail =
    req.cleanedEmail ?? req.body?.email ?? req.email ?? '';
  const password =
    req.cleanedPassword ??
    req.body?.password ??
    req.body?.pass ??
    req.password;

  const cleanedName = typeof rawName === 'string' ? rawName.trim() : '';
  const cleanedEmail =
    typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

  return { cleanedName, cleanedEmail, password };
}

async function register(req, res, next) {
  try {
    const { cleanedName, cleanedEmail, password } = extractAuthFields(req);

    if (!cleanedEmail || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        error: 'Valid email and a password of at least 8 characters are required.',
      });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanedEmail },
    });

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        name: cleanedName || cleanedEmail.split('@')[0],
        email: cleanedEmail,
        passwordHash: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Sign JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Account successfully registered.',
      user: user,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { cleanedEmail, password } = extractAuthFields(req);

    if (!cleanedEmail || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: cleanedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify bcrypt hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    setAuthCookie(res, token);

    res.json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.json({ message: 'Logged out successfully.' });
}

function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};