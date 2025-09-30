// AI DPR System - Main Application Entry Point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/uploads');
const healthRoutes = require('./routes/health');

// Import services
const dbService = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for development
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') || ['https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));

// Rate limiting
app.use('/api/', rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/health', healthRoutes);

// Serve main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    logger.info('🚀 Starting AI DPR System...');
    
    // Initialize database connection
    await dbService.initialize();
    
    // For Vercel deployment, export the app
    if (process.env.VERCEL) {
      logger.info('🚀 AI DPR System configured for Vercel deployment');
      return app;
    }
    
    // Start server for local development
    app.listen(PORT, () => {
      logger.info(`🚀 AI DPR System server running on port ${PORT}`);
      logger.info(`📊 Dashboard: http://localhost:${PORT}`);
      logger.info(`🔌 API Base URL: http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.info('🛠️  Development mode - CORS enabled for local development');
      }
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

// For Vercel serverless functions, export the app directly
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  // Initialize database and export app
  dbService.initialize().then(() => {
    console.log('Database initialized for serverless deployment');
  }).catch(error => {
    console.error('Database initialization failed:', error);
  });
  
  module.exports = app;
} else {
  // Start the server for local development
  startServer();
  
  // Handle uncaught exceptions (only for local development)
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}