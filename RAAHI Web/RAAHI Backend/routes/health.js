const express = require('express');
const databaseManager = require('../config/database');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Smart Tourism Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check with database status
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      service: 'Smart Tourism Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: null
    };

    // Check database health if connected
    try {
      if (databaseManager.isHealthy && databaseManager.isHealthy().overall) {
        const dbTests = await databaseManager.testConnections();
        health.database = dbTests;
        health.status = 'ok';
      } else {
        health.database = { status: 'disconnected' };
        health.status = 'degraded';
      }
    } catch (error) {
      health.database = { status: 'error', error: error.message };
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      service: 'Smart Tourism Backend',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
