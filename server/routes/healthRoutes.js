// SecureScan Health Check Route (for Render Web Service & Monitoring)
const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

router.get('/health', async (req, res) => {
  let dbStatus = 'healthy';
  try {
    // Quick query to test DB connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = `degraded: ${err.message}`;
  }

  res.json({
    status: dbStatus === 'healthy' ? 'healthy' : 'warning',
    service: 'SecureScan Security Intelligence API',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  });
});

module.exports = router;
