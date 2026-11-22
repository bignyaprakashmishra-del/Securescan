// SecureScan Website Management Routes
const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { authenticateToken } = require('../middleware/auth');
const { validateDomainInput } = require('../middleware/validator');

router.get('/', authenticateToken, websiteController.getWebsites);
router.post('/', authenticateToken, validateDomainInput, websiteController.createWebsite);
router.post('/:id/verify', authenticateToken, websiteController.verifyWebsite);
router.delete('/:id', authenticateToken, websiteController.deleteWebsite);

module.exports = router;
