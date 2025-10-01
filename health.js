const express = require('express');
const router = express.Router();
const logger = require('./logger');
const database = require('./database');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Check database connection
    try {
      await database.checkConnection();
      healthStatus.database = 'connected';
    } catch (error) {
      healthStatus.database = 'disconnected';
      healthStatus.status = 'unhealthy';
      logger.error('Database health check failed:', error);
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;