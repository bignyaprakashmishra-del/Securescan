// SecureScan Scan Routes
const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { authenticateToken } = require('../middleware/auth');
const { scanLimiter } = require('../middleware/rateLimiter');

router.post('/:websiteId', authenticateToken, scanLimiter, scanController.createScan);
router.get('/', authenticateToken, scanController.getScans);
router.get('/:id', authenticateToken, scanController.getScanById);
router.get('/:id/report', authenticateToken, scanController.downloadReport);
router.get('/:id/compare', authenticateToken, scanController.compareScansController);

module.exports = router;
