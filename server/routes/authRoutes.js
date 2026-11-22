// SecureScan Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegisterInput, validateLoginInput } = require('../middleware/validator');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateRegisterInput, authController.register);
router.post('/login', authLimiter, validateLoginInput, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
