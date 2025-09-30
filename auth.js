// Authentication routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbService = require('../services/database');
const logger = require('../utils/logger');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!dbService.isReady()) {
      // Mock authentication when database is not ready
      if (email === 'admin@aidpr.com' && password === 'admin123') {
        const token = jwt.sign(
          { id: 'mock-admin', email, role: 'admin' },
          process.env.JWT_SECRET || 'default-secret',
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          token,
          user: {
            id: 'mock-admin',
            email,
            full_name: 'System Administrator',
            role: 'admin'
          },
          mockData: true,
          message: 'Mock authentication - database not configured'
        });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Real authentication would go here when database is ready
    res.status(501).json({ error: 'Authentication not yet implemented with database' });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'Please set up the database first'
      });
    }

    // Registration logic would go here
    res.status(501).json({ error: 'Registration not yet implemented' });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Since we're using JWT, logout is handled client-side
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // This would normally validate JWT and return user info
    res.status(501).json({ error: 'User info endpoint not yet implemented' });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;