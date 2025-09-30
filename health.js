// Health check routes
const express = require('express');
const router = express.Router();
const dbService = require('../services/database');
const packageJson = require('../../package.json');

// Basic health check
router.get('/', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: process.uptime(),
    database: {
      connected: dbService.isReady(),
      status: dbService.isReady() ? 'connected' : 'disconnected'
    },
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(healthCheck);
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    database: {
      connected: dbService.isReady(),
      status: dbService.isReady() ? 'connected' : 'disconnected'
    },
    environment: process.env.NODE_ENV || 'development'
  };

  // Test database connection if connected
  if (dbService.isReady()) {
    try {
      const connectionTest = await dbService.testConnection();
      healthCheck.database.lastTest = new Date().toISOString();
      healthCheck.database.testResult = connectionTest.success ? 'passed' : 'failed';
      if (!connectionTest.success) {
        healthCheck.database.error = connectionTest.error;
      }
    } catch (error) {
      healthCheck.database.testResult = 'error';
      healthCheck.database.error = error.message;
    }
  }

  res.json(healthCheck);
});

module.exports = router;