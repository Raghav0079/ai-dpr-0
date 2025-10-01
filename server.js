const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import modules
const rateLimiter = require('./rateLimiter');
const logger = require('./logger');
const errorHandler = require('./errorHandler');
const healthRoutes = require('./health');
const uploadRoutes = require('./uploads');
const analyticsRoutes = require('./analytics');
const reportsRoutes = require('./reports');
const authRoutes = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use(rateLimiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/reports', reportsRoutes);

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;