// SecureScan Demonstration Mode Routes (Unauthenticated for Judges)
const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');

router.get('/overview', demoController.getDemoOverview);
router.get('/websites', demoController.getDemoWebsites);
router.get('/scans/compare', demoController.compareDemoScans);
router.get('/scans/:id', demoController.getDemoScan);
router.get('/scans/:id/report', demoController.downloadDemoReport);

module.exports = router;
