// Netlify serverless function - Main API handler
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import middleware
const errorHandler = require('../../src/middleware/errorHandler');
const rateLimiter = require('../../src/middleware/rateLimiter');
const logger = require('../../src/utils/logger');

// Import routes
const authRoutes = require('../../src/routes/auth');
const reportRoutes = require('../../src/routes/reports');
const analyticsRoutes = require('../../src/routes/analytics');
const uploadRoutes = require('../../src/routes/uploads');
const healthRoutes = require('../../src/routes/health');

// Import services
const dbService = require('../../src/services/database');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for Netlify
  credentials: true
}));

// Rate limiting (lighter for serverless)
app.use('/api/', rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database connection (cached in serverless)
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    try {
      await dbService.initialize();
      dbInitialized = true;
      logger.info('🚀 Database initialized for Netlify function');
    } catch (error) {
      logger.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
}

// API Routes
app.use('/api/auth', async (req, res, next) => {
  await initializeDatabase();
  next();
}, authRoutes);

app.use('/api/reports', async (req, res, next) => {
  await initializeDatabase();
  next();
}, reportRoutes);

app.use('/api/analytics', async (req, res, next) => {
  await initializeDatabase();
  next();
}, analyticsRoutes);

app.use('/api/upload', async (req, res, next) => {
  await initializeDatabase();
  next();
}, uploadRoutes);

app.use('/api/health', healthRoutes);

// Default API response
app.use('/api', (req, res) => {
  res.json({
    message: 'AI DPR System API - Netlify',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Export the serverless function
exports.handler = serverless(app);