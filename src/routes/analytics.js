// Analytics routes
const express = require('express');
const router = express.Router();
const dbService = require('../services/database');
const logger = require('../utils/logger');

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      // Return mock data when database is not ready
      logger.info('Database not ready, returning mock data for dashboard');
      return res.json({
        totalReports: 12,
        openReports: 5,
        highSeverityReports: 2,
        recentReports: 8,
        mockData: true,
        message: 'Database not configured - showing sample data'
      });
    }

    const supabase = dbService.getClient();
    
    // Get analytics data from database
    const [
      totalReports,
      openReports,
      highSeverityReports,
      recentReports
    ] = await Promise.all([
      supabase.from('reports').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'Open'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).in('severity', ['High', 'Critical']),
      supabase.from('reports').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    res.json({
      totalReports: totalReports.count || 0,
      openReports: openReports.count || 0,
      highSeverityReports: highSeverityReports.count || 0,
      recentReports: recentReports.count || 0
    });

  } catch (error) {
    logger.error('Analytics dashboard error:', error);
    
    // Return mock data on error to prevent dashboard crash
    res.json({
      totalReports: 12,
      openReports: 5,
      highSeverityReports: 2,
      recentReports: 8,
      mockData: true,
      error: 'Database error - showing sample data'
    });
  }
});

// Comprehensive analytics
router.get('/comprehensive', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'Please set up the database first'
      });
    }

    const supabase = dbService.getClient();
    
    // Get comprehensive analytics
    const analytics = {
      summary: {
        totalReports: 0,
        openReports: 0,
        closedReports: 0,
        highSeverityReports: 0
      },
      trends: {
        reportsThisWeek: 0,
        reportsThisMonth: 0,
        avgResolutionTime: 0
      },
      distribution: {
        byType: [],
        bySeverity: [],
        byStatus: []
      }
    };

    // You can expand this with actual queries when database is ready
    res.json(analytics);

  } catch (error) {
    logger.error('Comprehensive analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;