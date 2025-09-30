// Load environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const supabaseService = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for development
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'your-domain.com' 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only specific file types are allowed (images, PDF, Word, Excel, text files)'));
    }
  }
});

// Body parsing middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve React build files (for production)
app.use(express.static(path.join(__dirname, 'react-frontend/dist')));

// Initialize Supabase connection and setup
async function initializeSupabase() {
  try {
    // Test Supabase connection
    const testConnection = await supabaseService.testConnection();
    if (testConnection.success) {
      console.log('✅ Connected to Supabase database successfully');
      
      // Initialize sample data if needed
      await insertSampleData();
      
      console.log('✅ Database initialization completed');
    } else {
      console.error('❌ Failed to connect to Supabase:', testConnection.error);
      
      if (testConnection.needsSetup) {
        console.log('');
        console.log('🔧 Database Setup Required:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the SQL script from database_setup.sql');
        console.log('4. Or run: node setup-basic-db.js');
        console.log('');
        console.log('⚠️  Server will continue running but database operations will fail');
        console.log('   until tables are created.');
      }
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('⚠️  Server will continue running in limited mode');
  }
}

// Initialize database on startup
initializeSupabase();

// Insert sample data using Supabase
async function insertSampleData() {
  try {
    // Check if sample data already exists
    const existingReports = await supabaseService.getReports({ page: 1, limit: 1 });
    if (existingReports.success && existingReports.data.length > 0) {
      console.log('📊 Sample data already exists, skipping initialization');
      return;
    }

    const sampleReports = [
      {
        id: 'RPT-2023-001',
        project_name: 'Project Alpha',
        issue_type: 'Budget Mismatch',
        description: 'Budget exceeds allocated funds by 15%',
        severity: 'High',
        status: 'Open',
        ai_analysis: 'AI analysis indicates potential cost overruns due to scope creep and inflation. Recommend immediate budget revision and stakeholder approval for additional funding.',
        confidence_score: 0.92,
        completeness_score: 0.88,
        compliance_score: 0.75,
        risk_score: 0.85,
        priority: 'High'
      },
      {
        id: 'RPT-2023-002',
        project_name: 'Project Beta',
        issue_type: 'Unrealistic Schedule',
        description: 'Project timeline is too short for the scope of work',
        severity: 'Medium',
        status: 'In Review',
        ai_analysis: 'AI timeline analysis shows 73% probability of delays based on historical project data. Consider extending timeline by 2-3 weeks and reallocating critical path resources.',
        confidence_score: 0.87,
        completeness_score: 0.82,
        compliance_score: 0.90,
        risk_score: 0.65,
        priority: 'Medium'
      },
      {
        id: 'RPT-2023-003',
        project_name: 'Project Gamma',
        issue_type: 'Resource Allocation',
        description: 'Insufficient resources allocated to critical tasks',
        severity: 'Low',
        status: 'Resolved',
        ai_analysis: 'AI resource optimization suggests redistributing team members from non-critical tasks. Current allocation efficiency is at 68% - potential 15% improvement available.',
        confidence_score: 0.79,
        completeness_score: 0.85,
        compliance_score: 0.92,
        risk_score: 0.35,
        priority: 'Low'
      },
      {
        id: 'RPT-2023-004',
        project_name: 'Project Delta',
        issue_type: 'Budget Mismatch',
        description: 'Discrepancy between planned and actual expenses',
        severity: 'High',
        status: 'Open',
        ai_analysis: 'Significant variance detected in expense categories. AI recommends detailed audit of procurement processes and vendor contracts.',
        confidence_score: 0.95,
        completeness_score: 0.90,
        compliance_score: 0.72,
        risk_score: 0.88,
        priority: 'High'
      },
      {
        id: 'RPT-2023-005',
        project_name: 'Project Epsilon',
        issue_type: 'Unrealistic Schedule',
        description: 'Project milestones are not achievable',
        severity: 'Medium',
        status: 'In Review',
        ai_analysis: 'Critical path analysis reveals bottlenecks in design phase. AI suggests parallel execution of independent tasks to recover 2 weeks.',
        confidence_score: 0.83,
        completeness_score: 0.78,
        compliance_score: 0.88,
        risk_score: 0.60,
        priority: 'Medium'
      }
    ];

    // Create sample reports
    for (const report of sampleReports) {
      const result = await supabaseService.createReport(report);
      if (!result.success) {
        console.warn(`⚠️ Failed to create sample report ${report.id}:`, result.error);
      }
    }

    console.log('📊 Sample data inserted successfully');
  } catch (error) {
    console.error('❌ Failed to insert sample data:', error.message);
  }
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await supabaseService.createUser({
      username,
      email,
      password: hashedPassword
    });

    if (!result.success) {
      if (result.error.includes('duplicate key') || result.error.includes('already exists')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    const token = jwt.sign({ id: result.data.id, username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ 
      message: 'User created successfully', 
      token,
      user: { id: result.data.id, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await supabaseService.getUserByUsername(username);
    
    if (!result.success || !result.data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.data;
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reports API
app.get('/api/reports', async (req, res) => {
  try {
    const { filter, search, page = 1, limit = 10 } = req.query;
    
    const result = await supabaseService.getReports({
      filter: filter !== 'all' ? filter : null,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    if (!result.success) {
      console.log('Database not ready, returning sample reports for demo');
      // Return sample reports when database isn't set up
      return res.json({
        reports: getSampleReports(),
        pagination: {
          page: 1,
          totalPages: 1,
          totalReports: 3,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    res.json({
      reports: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supabaseService.getReportById(id);
    
    if (!result.success) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!result.data) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(result.data);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const { 
      title, 
      project_name, 
      department, 
      assigned_to, 
      issue_type, 
      description, 
      severity, 
      priority, 
      due_date, 
      tags 
    } = req.body;
    
    if (!project_name || !issue_type || !description || !severity) {
      return res.status(400).json({ error: 'Project name, issue type, description, and severity are required' });
    }

    // Generate report ID
    const reportId = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    // Simulate comprehensive AI analysis
    const aiAnalysis = generateAIAnalysis(issue_type, description);
    const confidenceScore = Math.random() * 0.3 + 0.7;
    const completenessScore = Math.random() * 0.4 + 0.6;
    const complianceScore = Math.random() * 0.3 + 0.7;
    const riskScore = severity === 'High' ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5 + 0.3;
    
    const reportData = {
      id: reportId,
      title: title || `${issue_type} - ${project_name}`,
      project_name,
      department,
      assigned_to,
      issue_type,
      description,
      severity,
      priority: priority || 'Medium',
      status: 'Open',
      due_date,
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      ai_analysis: aiAnalysis,
      confidence_score: confidenceScore,
      completeness_score: completenessScore,
      compliance_score: complianceScore,
      risk_score: riskScore
    };

    const result = await supabaseService.createReport(reportData);
    
    if (!result.success) {
      console.log('Database not ready, simulating report creation for demo');
      // If database tables don't exist, simulate successful creation for demo
      return res.status(201).json({ 
        message: 'Report created successfully (Demo Mode - Database not connected)',
        report: {
          ...reportData,
          tags: reportData.tags.split(',').filter(t => t.trim()),
          created_at: new Date().toISOString(),
          demo_mode: true
        }
      });
    }

    // Log AI analysis (skip if database not ready)
    try {
      await supabaseService.createAIAnalysisLog({
        report_id: reportId,
        analysis_type: issue_type,
        input_data: JSON.stringify(req.body),
        output_analysis: aiAnalysis,
        confidence_score: confidenceScore,
        processing_time: Math.random() * 2000 + 500
      });
    } catch (logError) {
      console.log('AI analysis logging skipped (database not ready)');
    }

    res.status(201).json({ 
      message: 'Report created successfully',
      report: {
        ...reportData,
        tags: reportData.tags.split(',').filter(t => t.trim()),
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const result = await supabaseService.updateReport(id, updates);
    
    if (!result.success) {
      if (result.error.includes('not found')) {
        return res.status(404).json({ error: 'Report not found' });
      }
      return res.status(500).json({ error: 'Failed to update report' });
    }
    
    res.json({ 
      message: 'Report updated successfully',
      report: result.data
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get associated files first
    const filesResult = await supabaseService.getFileAttachments(id);
    
    // Delete files if they exist
    if (filesResult.success && filesResult.data.length > 0) {
      for (const file of filesResult.data) {
        try {
          await fs.unlink(file.file_path).catch(() => {}); // Ignore errors
        } catch (error) {
          console.warn('Failed to delete file:', file.file_path);
        }
      }
    }
    
    const result = await supabaseService.deleteReport(id);
    
    if (!result.success) {
      if (result.error.includes('not found')) {
        return res.status(404).json({ error: 'Report not found' });
      }
      return res.status(500).json({ error: 'Failed to delete report' });
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/reports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const result = await supabaseService.updateReport(id, { status });
    
    if (!result.success) {
      if (result.error.includes('not found')) {
        return res.status(404).json({ error: 'Report not found' });
      }
      return res.status(500).json({ error: 'Failed to update report status' });
    }
    
    res.json({ 
      message: 'Report status updated successfully',
      report: result.data
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics API
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const analytics = await supabaseService.getDashboardAnalytics();
    
    if (!analytics.success) {
      // If database tables don't exist, return mock data for demo
      console.log('Database not ready, returning mock data for dashboard');
      return res.json({
        totalReports: 12,
        openReports: 5,
        highSeverityReports: 2,
        recentReports: 8,
        mockData: true
      });
    }
    
    res.json(analytics.data);
  } catch (error) {
    console.error('Analytics error:', error);
    // Return mock data on error to prevent dashboard crash
    res.json({
      totalReports: 12,
      openReports: 5,
      highSeverityReports: 2,
      recentReports: 8,
      mockData: true,
      error: 'Database not available'
    });
  }
});

// File upload endpoint
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { reportId } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      // Save file info to database
      const fileData = {
        report_id: reportId,
        filename: file.filename,
        original_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype
      };

      const result = await supabaseService.createFileAttachment(fileData);
      if (result.success) {
        uploadedFiles.push({
          id: result.data.id,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype
        });
      }
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// AI Analysis endpoint
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { issue_type, description, project_data } = req.body;
    
    if (!issue_type || !description) {
      return res.status(400).json({ error: 'Issue type and description are required' });
    }
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const analysis = generateComprehensiveAIAnalysis(issue_type, description, project_data);
    const confidenceScore = Math.random() * 0.3 + 0.7;
    const completenessScore = Math.random() * 0.4 + 0.6;
    const complianceScore = Math.random() * 0.3 + 0.7;
    const riskScore = Math.random() * 0.6 + 0.2;
    
    const result = {
      analysis,
      confidence_score: confidenceScore,
      completeness_score: completenessScore,
      compliance_score: complianceScore,
      risk_score: riskScore,
      recommendations: generateRecommendations(issue_type),
      risk_factors: generateRiskFactors(issue_type, description)
    };
    
    res.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// AI File Analysis endpoint
app.post('/api/ai/analyze-files', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided for analysis' });
    }

    const { issue_type, description } = req.body;
    const fileAnalyses = [];

    // Simulate file processing
    for (const file of req.files) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const fileAnalysis = simulateFileAnalysis(file);
      fileAnalyses.push({
        filename: file.originalname,
        analysis: fileAnalysis,
        confidence: Math.random() * 0.3 + 0.7,
        extracted_data: `Extracted ${Math.floor(Math.random() * 50 + 10)} data points`
      });
    }

    const comprehensiveAnalysis = generateComprehensiveAIAnalysis(issue_type, description, '', req.files);
    
    res.json({
      overall_analysis: comprehensiveAnalysis,
      file_analyses: fileAnalyses,
      confidence_score: Math.random() * 0.3 + 0.7,
      processing_time: req.files.length * 1500 + Math.random() * 1000
    });
  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({ error: 'File analysis failed' });
  }
});

// Projects API
app.get('/api/projects', async (req, res) => {
  try {
    const result = await supabaseService.getProjects();
    
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    
    res.json(result.data);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, budget, start_date, end_date } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projectData = {
      name,
      description,
      budget,
      start_date,
      end_date,
      status: 'active'
    };
    
    const result = await supabaseService.createProject(projectData);
    
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to create project' });
    }
    
    res.status(201).json({
      message: 'Project created successfully',
      project: result.data
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Comprehensive Analytics API
app.get('/api/analytics/comprehensive', async (req, res) => {
  try {
    const analytics = await supabaseService.getComprehensiveAnalytics();
    
    if (!analytics.success) {
      return res.status(500).json({ error: 'Failed to fetch comprehensive analytics' });
    }
    
    res.json(analytics.data);
  } catch (error) {
    console.error('Comprehensive analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sample data for demo mode
function getSampleReports() {
  return [
    {
      id: 'RPT-2024-0001',
      title: 'Budget Overrun - Infrastructure Project',
      project_name: 'Smart City Infrastructure',
      department: 'Engineering',
      assigned_to: 'John Smith',
      issue_type: 'Budget Mismatch',
      description: 'Project budget has exceeded allocated funds by 15% due to unexpected material cost increases.',
      severity: 'High',
      priority: 'High',
      status: 'Open',
      due_date: '2024-02-15',
      tags: 'urgent,budget,infrastructure',
      ai_analysis: 'AI analysis indicates potential cost overruns due to scope creep and inflation. Recommend immediate budget revision and stakeholder approval for additional funding.',
      confidence_score: 0.85,
      completeness_score: 0.90,
      compliance_score: 0.75,
      risk_score: 0.80,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-2024-0002',
      title: 'Resource Shortage - Development Team',
      project_name: 'Mobile App Development',
      department: 'IT',
      assigned_to: 'Sarah Johnson',
      issue_type: 'Resource Allocation',
      description: 'Development team is understaffed, causing delays in sprint deliverables.',
      severity: 'Medium',
      priority: 'Medium',
      status: 'In Progress',
      due_date: '2024-02-20',
      tags: 'resources,development,staffing',
      ai_analysis: 'AI resource optimization suggests redistributing team members from non-critical tasks. Current allocation efficiency is at 68% - potential 15% improvement available.',
      confidence_score: 0.78,
      completeness_score: 0.85,
      compliance_score: 0.82,
      risk_score: 0.65,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'RPT-2024-0003',
      title: 'Timeline Delay - Marketing Campaign',
      project_name: 'Q1 Marketing Campaign',
      department: 'Marketing',
      assigned_to: 'Mike Davis',
      issue_type: 'Unrealistic Schedule',
      description: 'Campaign launch delayed due to creative review process taking longer than expected.',
      severity: 'Low',
      priority: 'Medium',
      status: 'Open',
      due_date: '2024-02-25',
      tags: 'timeline,marketing,review',
      ai_analysis: 'AI timeline analysis shows 73% probability of delays based on historical project data. Consider extending timeline by 2-3 weeks and reallocating critical path resources.',
      confidence_score: 0.72,
      completeness_score: 0.80,
      compliance_score: 0.88,
      risk_score: 0.45,
      created_at: new Date().toISOString()
    }
  ];
}

// Utility functions for AI analysis
function generateAIAnalysis(issueType, description, additionalContext = '') {
  const analyses = {
    'Budget Mismatch': [
      'AI analysis indicates potential cost overruns due to scope creep and inflation. Recommend immediate budget revision and stakeholder approval for additional funding.',
      'Budget variance analysis shows systematic overspending in procurement. AI suggests implementing stricter vendor management and cost control measures.',
      'Predictive modeling indicates 78% probability of continued budget overruns without intervention. Recommend immediate corrective action.'
    ],
    'Unrealistic Schedule': [
      'AI timeline analysis shows 73% probability of delays based on historical project data. Consider extending timeline by 2-3 weeks and reallocating critical path resources.',
      'Critical path analysis reveals bottlenecks in design phase. AI suggests parallel execution of independent tasks to recover 2 weeks.',
      'Resource allocation modeling indicates insufficient time buffer for risk mitigation. Recommend 15% schedule contingency.'
    ],
    'Resource Allocation': [
      'AI resource optimization suggests redistributing team members from non-critical tasks. Current allocation efficiency is at 68% - potential 15% improvement available.',
      'Workload analysis shows uneven distribution across team members. AI recommends rebalancing tasks to optimize productivity.',
      'Skill-task matching analysis indicates suboptimal assignments. AI suggests reassigning specialized tasks to appropriate team members.'
    ]
  };
  
  const options = analyses[issueType] || ['AI analysis in progress...'];
  return options[Math.floor(Math.random() * options.length)];
}

function generateComprehensiveAIAnalysis(issueType, description, additionalContext = '', files = []) {
  const baseAnalysis = generateAIAnalysis(issueType, description, additionalContext);
  
  let fileContext = '';
  if (files && files.length > 0) {
    fileContext = `\n\nDocument Analysis: AI has processed ${files.length} supporting document(s). `;
    fileContext += files.length > 1 ? 'Cross-referencing reveals ' : 'Document analysis shows ';
    fileContext += 'consistency with reported issues and provides additional evidence for recommended actions.';
  }
  
  const enhancedAnalysis = baseAnalysis + fileContext;
  
  const nlpInsights = [
    'Natural Language Processing detected key sentiment indicators suggesting urgency in stakeholder communications.',
    'Text analysis reveals recurring terminology patterns indicating systematic rather than isolated issues.',
    'Semantic analysis of project documentation shows alignment with industry best practices in 78% of reviewed sections.',
    'Language pattern recognition suggests this issue has been previously identified but not fully addressed.'
  ];
  
  return enhancedAnalysis + '\n\nNLP Insights: ' + nlpInsights[Math.floor(Math.random() * nlpInsights.length)];
}

function simulateFileAnalysis(file) {
  const analysisTypes = {
    'application/pdf': 'PDF content analysis reveals structured data with compliance markers. Document completeness: 87%.',
    'application/msword': 'Word document analysis shows proper formatting and section organization. Content coherence: 92%.',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX analysis indicates comprehensive documentation with embedded references. Quality score: 89%.',
    'image/jpeg': 'Image OCR analysis extracted text with 94% confidence. Visual elements suggest technical diagrams.',
    'image/png': 'PNG image processing identified charts and graphs. Data visualization quality: High.',
    'text/plain': 'Plain text analysis reveals structured information with clear formatting. Readability score: 85%.'
  };
  
  return analysisTypes[file.mimetype] || 'File format analysis completed. Content extracted and processed successfully.';
}

function generateRiskFactors(issueType, description) {
  const riskFactors = {
    'Budget Mismatch': [
      'Scope creep vulnerability',
      'Vendor cost escalation',
      'Currency fluctuation impact',
      'Resource availability constraints'
    ],
    'Unrealistic Schedule': [
      'Critical path dependencies',
      'Resource allocation bottlenecks',
      'External stakeholder delays',
      'Technical complexity underestimation'
    ],
    'Resource Allocation': [
      'Skill gap analysis',
      'Team availability conflicts',
      'Training requirements',
      'Performance variability'
    ]
  };
  
  return riskFactors[issueType] || ['General project risks', 'Stakeholder alignment', 'Communication gaps'];
}

function generateRecommendations(issueType) {
  const recommendations = {
    'Budget Mismatch': [
      'Implement stricter budget controls and approval processes',
      'Negotiate fixed-price contracts with vendors where possible',
      'Establish contingency reserves for unforeseen expenses',
      'Regular budget review meetings with stakeholders'
    ],
    'Unrealistic Schedule': [
      'Break down large tasks into smaller, manageable components',
      'Implement agile methodologies for better flexibility',
      'Add buffer time for critical path activities',
      'Regular progress reviews and timeline adjustments'
    ],
    'Resource Allocation': [
      'Conduct skills assessment and create development plans',
      'Implement resource leveling techniques',
      'Cross-train team members to increase flexibility',
      'Use project management tools for better visibility'
    ]
  };
  
  return recommendations[issueType] || ['Regular project health checks', 'Stakeholder communication improvements', 'Process optimization review'];
}

// Serve React app for all other routes (SPA support)
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'react-frontend/dist/index.html');
  
  // Check if the built React app exists
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback for development
    res.send(`
      <h1>AI DPR System - Server Running</h1>
      <p>Server is running on port ${PORT}</p>
      <p>Please build the React frontend or access the API directly.</p>
      <ul>
        <li><a href="/api/reports">Reports API</a></li>
        <li><a href="/api/analytics/dashboard">Dashboard Analytics</a></li>
      </ul>
    `);
  }
});

// Catch-all handler for React Router (SPA support)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'react-frontend/dist/index.html');
  
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('React app not built. Please run npm run build in the react-frontend directory.');
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI DPR System server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;