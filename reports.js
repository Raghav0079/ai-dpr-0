// Reports routes
const express = require('express');
const router = express.Router();
const dbService = require('../services/database');
const logger = require('../utils/logger');

// Get all reports
router.get('/', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      // Return sample reports when database is not ready
      const sampleReports = getSampleReports();
      return res.json({
        reports: sampleReports,
        total: sampleReports.length,
        mockData: true,
        message: 'Database not configured - showing sample data'
      });
    }

    const { page = 1, limit = 10, status, type } = req.query;
    const supabase = dbService.getClient();
    
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('report_type', type);
    }

    const { data: reports, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      reports: reports || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    logger.error('Get reports error:', error);
    
    // Return sample data on error
    const sampleReports = getSampleReports();
    res.json({
      reports: sampleReports,
      total: sampleReports.length,
      mockData: true,
      error: 'Database error - showing sample data'
    });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'Please set up the database first'
      });
    }

    const { id } = req.params;
    const supabase = dbService.getClient();
    
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Report not found' });
      }
      throw error;
    }

    res.json(report);

  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create new report
router.post('/', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      // Mock successful creation when database is not ready
      logger.info('Database not ready, mocking report creation');
      return res.status(201).json({
        id: 'mock-' + Date.now(),
        ...req.body,
        created_at: new Date().toISOString(),
        mockData: true,
        message: 'Report would be created when database is configured'
      });
    }

    const supabase = dbService.getClient();
    const reportData = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: report, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Report created successfully:', report.id);
    res.status(201).json(report);

  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Update report
router.put('/:id', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'Please set up the database first'
      });
    }

    const { id } = req.params;
    const supabase = dbService.getClient();
    
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: report, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Report not found' });
      }
      throw error;
    }

    logger.info('Report updated successfully:', report.id);
    res.json(report);

  } catch (error) {
    logger.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete report
router.delete('/:id', async (req, res) => {
  try {
    if (!dbService.isReady()) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'Please set up the database first'
      });
    }

    const { id } = req.params;
    const supabase = dbService.getClient();
    
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    logger.info('Report deleted successfully:', id);
    res.json({ message: 'Report deleted successfully' });

  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Helper function to get sample reports
function getSampleReports() {
  return [
    {
      id: 'sample-1',
      title: 'Budget Variance Analysis',
      report_type: 'Budget Mismatch',
      issue_type: 'Budget Mismatch',
      description: 'Significant variance detected in Q3 budget allocation vs actual spending',
      status: 'Open',
      severity: 'High',
      ai_analysis: 'AI analysis indicates potential cost overruns due to scope creep and inflation. Recommend immediate budget revision and stakeholder approval for additional funding.',
      ai_risk_score: 0.85,
      ai_confidence_score: 0.92,
      sentiment_score: -0.3,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-2',
      title: 'Resource Allocation Review',
      report_type: 'Resource Allocation',
      issue_type: 'Resource Allocation',
      description: 'Current resource allocation may not meet project timeline requirements',
      status: 'In Progress',
      severity: 'Medium',
      ai_analysis: 'AI resource optimization suggests redistributing team members from non-critical tasks. Current allocation efficiency is at 68% - potential 15% improvement available.',
      ai_risk_score: 0.65,
      ai_confidence_score: 0.78,
      sentiment_score: 0.1,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-3',
      title: 'Timeline Risk Assessment',
      report_type: 'Unrealistic Schedule',
      issue_type: 'Unrealistic Schedule',
      description: 'Project timeline appears aggressive given current progress and resource constraints',
      status: 'Open',
      severity: 'High',
      ai_analysis: 'AI timeline analysis shows 73% probability of delays based on historical project data. Consider extending timeline by 2-3 weeks and reallocating critical path resources.',
      ai_risk_score: 0.73,
      ai_confidence_score: 0.88,
      sentiment_score: -0.2,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

module.exports = router;