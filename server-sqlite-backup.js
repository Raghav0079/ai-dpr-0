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
      throw new Error('Supabase connection failed');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
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
      return res.status(500).json({ error: 'Database error' });
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

app.get('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM reports WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(row);
  });
});

app.post('/api/reports', (req, res) => {
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
  
  const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';

  db.run(`INSERT INTO reports (
    id, title, project_name, department, assigned_to, issue_type, description, 
    severity, priority, status, due_date, tags, ai_analysis, confidence_score, 
    completeness_score, compliance_score, risk_score
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reportId, title || `${issue_type} - ${project_name}`, project_name, department, 
      assigned_to, issue_type, description, severity, priority || 'Medium', 
      'Open', due_date, tagsString, aiAnalysis, confidenceScore, 
      completenessScore, complianceScore, riskScore
    ],
    function(err) {
      if (err) {
        console.error('Error creating report:', err);
        return res.status(500).json({ error: 'Failed to create report' });
      }
      
      // Log AI analysis
      db.run(`INSERT INTO ai_analysis_logs (report_id, analysis_type, input_data, output_analysis, confidence_score, processing_time) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        [reportId, issue_type, JSON.stringify(req.body), aiAnalysis, confidenceScore, Math.random() * 2000 + 500]
      );

      res.status(201).json({ 
        message: 'Report created successfully',
        report: {
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
          tags: tagsString.split(',').filter(t => t.trim()),
          ai_analysis: aiAnalysis,
          confidence_score: confidenceScore,
          completeness_score: completenessScore,
          compliance_score: complianceScore,
          risk_score: riskScore,
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// Update report endpoint
app.put('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Build dynamic update query
  const allowedFields = [
    'title', 'project_name', 'department', 'assigned_to', 'issue_type', 
    'description', 'severity', 'priority', 'status', 'due_date', 'tags'
  ];
  
  const updateFields = [];
  const updateValues = [];
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      updateValues.push(updates[key]);
    }
  });
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);
  
  const query = `UPDATE reports SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(query, updateValues, function(err) {
    if (err) {
      console.error('Error updating report:', err);
      return res.status(500).json({ error: 'Failed to update report' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ message: 'Report updated successfully' });
  });
});

// Delete report endpoint
app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  
  // First, delete associated files
  db.all('SELECT file_path FROM file_attachments WHERE report_id = ?', [id], async (err, files) => {
    if (!err && files.length > 0) {
      // Delete physical files
      for (const file of files) {
        try {
          await fs.unlink(file.file_path);
        } catch (error) {
          console.warn(`Could not delete file: ${file.file_path}`);
        }
      }
      
      // Delete file records
      db.run('DELETE FROM file_attachments WHERE report_id = ?', [id]);
    }
    
    // Delete AI analysis logs
    db.run('DELETE FROM ai_analysis_logs WHERE report_id = ?', [id]);
    
    // Delete the report
    db.run('DELETE FROM reports WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting report:', err);
        return res.status(500).json({ error: 'Failed to delete report' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      res.json({ message: 'Report deleted successfully' });
    });
  });
});

app.put('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  db.run('UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({ message: 'Status updated successfully' });
    }
  );
});

// Analytics API
app.get('/api/analytics/dashboard', (req, res) => {
  const queries = {
    totalReports: 'SELECT COUNT(*) as count FROM reports',
    openReports: 'SELECT COUNT(*) as count FROM reports WHERE status = "Open"',
    highSeverity: 'SELECT COUNT(*) as count FROM reports WHERE severity = "High"',
    recentReports: 'SELECT COUNT(*) as count FROM reports WHERE created_at >= date("now", "-7 days")',
    issueTypeDistribution: 'SELECT issue_type, COUNT(*) as count FROM reports GROUP BY issue_type',
    severityDistribution: 'SELECT severity, COUNT(*) as count FROM reports GROUP BY severity',
    statusDistribution: 'SELECT status, COUNT(*) as count FROM reports GROUP BY status',
    trendsData: `SELECT 
      DATE(created_at) as date, 
      COUNT(*) as count, 
      issue_type 
      FROM reports 
      WHERE created_at >= date('now', '-30 days') 
      GROUP BY DATE(created_at), issue_type 
      ORDER BY date`
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = [];
      } else {
        results[key] = rows;
      }
      
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// File upload endpoint
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      size: file.size,
      mimeType: file.mimetype,
      uploadDate: new Date().toISOString()
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// AI Analysis endpoint
app.post('/api/ai/analyze', (req, res) => {
  const { project_name, issue_type, description, additional_context, files } = req.body;
  
  if (!project_name || !issue_type || !description) {
    return res.status(400).json({ error: 'Project name, issue type, and description are required' });
  }

  // Simulate AI processing time
  setTimeout(() => {
    const analysis = generateComprehensiveAIAnalysis(issue_type, description, additional_context, files);
    const confidenceScore = Math.random() * 0.3 + 0.7;
    const recommendations = generateRecommendations(issue_type);
    const riskFactors = generateRiskFactors(issue_type, description);
    const complianceCheck = generateComplianceCheck(issue_type);
    
    res.json({
      overview: {
        completeness_score: Math.random() * 0.4 + 0.6,
        compliance_score: Math.random() * 0.3 + 0.7,
        risk_score: Math.random() * 0.5 + 0.3,
        confidence_score: confidenceScore
      },
      analysis,
      recommendations,
      risk_factors: riskFactors,
      compliance_check: complianceCheck,
      inconsistencies: generateInconsistencies(description),
      processing_time: Math.random() * 2000 + 500,
      timestamp: new Date().toISOString(),
      multilingual_support: {
        detected_language: 'English',
        available_translations: ['Hindi', 'Telugu', 'Tamil', 'Bengali', 'Gujarati']
      }
    });
  }, 1000 + Math.random() * 2000); // Simulate 1-3 second processing time
});

// Comprehensive AI analysis for files
app.post('/api/ai/analyze-files', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided for analysis' });
    }

    const { project_name, context } = req.body;
    
    // Simulate processing each file
    const fileAnalyses = req.files.map(file => {
      const analysis = simulateFileAnalysis(file);
      return {
        filename: file.originalname,
        size: file.size,
        type: file.mimetype,
        analysis: analysis,
        extracted_text: `Simulated extracted content from ${file.originalname}`,
        ocr_confidence: file.mimetype.startsWith('image/') ? Math.random() * 0.3 + 0.7 : null,
        issues_detected: Math.floor(Math.random() * 5) + 1,
        compliance_score: Math.random() * 0.4 + 0.6
      };
    });

    setTimeout(() => {
      res.json({
        message: 'Files analyzed successfully',
        summary: {
          total_files: req.files.length,
          total_issues: fileAnalyses.reduce((sum, f) => sum + f.issues_detected, 0),
          average_compliance: fileAnalyses.reduce((sum, f) => sum + f.compliance_score, 0) / fileAnalyses.length,
          processing_time: Math.random() * 3000 + 2000
        },
        file_analyses: fileAnalyses,
        overall_recommendations: generateRecommendations('comprehensive'),
        next_steps: [
          'Review identified inconsistencies',
          'Update compliance documentation',
          'Schedule stakeholder meeting',
          'Implement recommended changes'
        ]
      });
    }, 2000 + Math.random() * 3000);
    
  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({ error: 'File analysis failed' });
  }
});

// Projects API
app.get('/api/projects', (req, res) => {
  const query = 'SELECT * FROM projects ORDER BY created_at DESC';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/projects', (req, res) => {
  const { name, description, budget, start_date, end_date } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  db.run(`INSERT INTO projects (name, description, budget, start_date, end_date) 
          VALUES (?, ?, ?, ?, ?)`,
    [name, description, budget, start_date, end_date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create project' });
      }
      
      res.status(201).json({ 
        message: 'Project created successfully',
        project: {
          id: this.lastID,
          name,
          description,
          budget,
          start_date,
          end_date,
          status: 'active',
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// Enhanced Analytics API
app.get('/api/analytics/comprehensive', (req, res) => {
  const queries = {
    // Basic stats
    totalReports: 'SELECT COUNT(*) as count FROM reports',
    openReports: 'SELECT COUNT(*) as count FROM reports WHERE status = "Open"',
    highSeverity: 'SELECT COUNT(*) as count FROM reports WHERE severity = "High" OR severity = "Critical"',
    recentReports: 'SELECT COUNT(*) as count FROM reports WHERE created_at >= date("now", "-7 days")',
    
    // Distribution analytics
    issueTypeDistribution: 'SELECT issue_type, COUNT(*) as count FROM reports GROUP BY issue_type ORDER BY count DESC',
    severityDistribution: 'SELECT severity, COUNT(*) as count FROM reports GROUP BY severity ORDER BY count DESC',
    statusDistribution: 'SELECT status, COUNT(*) as count FROM reports GROUP BY status ORDER BY count DESC',
    departmentDistribution: 'SELECT department, COUNT(*) as count FROM reports WHERE department IS NOT NULL GROUP BY department ORDER BY count DESC',
    
    // Trend analytics
    trendsData: `SELECT 
      DATE(created_at) as date, 
      COUNT(*) as count, 
      issue_type 
      FROM reports 
      WHERE created_at >= date('now', '-30 days') 
      GROUP BY DATE(created_at), issue_type 
      ORDER BY date`,
      
    // Performance metrics
    avgProcessingTime: 'SELECT AVG(processing_time) as avg_time FROM ai_analysis_logs',
    avgConfidenceScore: 'SELECT AVG(confidence_score) as avg_confidence FROM reports WHERE confidence_score IS NOT NULL',
    
    // Recent activity
    recentAnalyses: `SELECT 
      r.id, r.project_name, r.issue_type, r.severity, r.created_at,
      a.confidence_score, a.processing_time
      FROM reports r 
      LEFT JOIN ai_analysis_logs a ON r.id = a.report_id 
      ORDER BY r.created_at DESC 
      LIMIT 10`
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = [];
      } else {
        results[key] = rows;
      }
      
      completed++;
      if (completed === total) {
        // Calculate additional metrics
        results.summary = {
          total_reports: results.totalReports[0]?.count || 0,
          open_reports: results.openReports[0]?.count || 0,
          critical_reports: results.highSeverity[0]?.count || 0,
          recent_reports: results.recentReports[0]?.count || 0,
          avg_processing_time: Math.round(results.avgProcessingTime[0]?.avg_time || 1500),
          avg_confidence: Math.round((results.avgConfidenceScore[0]?.avg_confidence || 0.85) * 100),
          system_health: 'Operational',
          last_updated: new Date().toISOString()
        };
        
        res.json(results);
      }
    });
  });
});

// Enhanced Utility functions
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
      { factor: 'Cost Escalation', probability: 0.78, impact: 'High' },
      { factor: 'Scope Creep', probability: 0.65, impact: 'Medium' },
      { factor: 'Vendor Issues', probability: 0.45, impact: 'Medium' },
      { factor: 'Currency Fluctuation', probability: 0.32, impact: 'Low' }
    ],
    'Unrealistic Schedule': [
      { factor: 'Resource Constraints', probability: 0.82, impact: 'High' },
      { factor: 'Technical Complexity', probability: 0.67, impact: 'High' },
      { factor: 'Weather Dependencies', probability: 0.43, impact: 'Medium' },
      { factor: 'Approval Delays', probability: 0.58, impact: 'Medium' }
    ],
    'Resource Allocation': [
      { factor: 'Skill Mismatch', probability: 0.71, impact: 'High' },
      { factor: 'Team Availability', probability: 0.89, impact: 'High' },
      { factor: 'Equipment Shortage', probability: 0.34, impact: 'Medium' },
      { factor: 'Training Requirements', probability: 0.56, impact: 'Low' }
    ]
  };
  
  return riskFactors[issueType] || [
    { factor: 'Unknown Risk', probability: 0.5, impact: 'Medium' }
  ];
}

function generateComplianceCheck(issueType) {
  return {
    overall_compliance: Math.random() * 0.3 + 0.7,
    frameworks_checked: ['ISO 9001', 'PMI Standards', 'Local Regulations', 'Environmental Guidelines'],
    compliance_issues: Math.floor(Math.random() * 3) + 1,
    recommendations: [
      'Update documentation to meet current standards',
      'Schedule compliance audit',
      'Implement corrective measures',
      'Train team on compliance requirements'
    ]
  };
}

function generateInconsistencies(description) {
  const inconsistencies = [
    { type: 'Data Mismatch', severity: 'Medium', description: 'Budget figures don\'t match across documents' },
    { type: 'Timeline Conflict', severity: 'High', description: 'Milestone dates inconsistent with project schedule' },
    { type: 'Resource Conflict', severity: 'Low', description: 'Team assignments overlap with other projects' },
    { type: 'Specification Gap', severity: 'Medium', description: 'Technical requirements missing key details' }
  ];
  
  const count = Math.floor(Math.random() * 3) + 1;
  return inconsistencies.slice(0, count);
}

function generateRecommendations(issueType) {
  const recommendations = {
    'Budget Mismatch': [
      'Implement weekly budget reviews with stakeholder approval',
      'Establish vendor cost controls and procurement guidelines',
      'Create contingency fund (10-15% of total budget)',
      'Deploy real-time expense tracking system',
      'Conduct vendor performance analysis',
      'Review and renegotiate contracts if necessary'
    ],
    'Unrealistic Schedule': [
      'Add 15-20% buffer to critical path tasks',
      'Implement parallel task execution where possible',
      'Increase resource allocation for bottleneck activities',
      'Establish milestone checkpoints for early warning',
      'Consider fast-tracking critical activities',
      'Implement advanced project scheduling techniques'
    ],
    'Resource Allocation': [
      'Conduct comprehensive skills assessment and task matching',
      'Implement resource leveling across projects',
      'Cross-train team members for flexibility',
      'Use advanced resource management tools for optimization',
      'Establish resource sharing agreements',
      'Create resource utilization dashboards'
    ],
    'Technical Risk': [
      'Conduct thorough technical feasibility study',
      'Implement prototype development and testing',
      'Establish technical review committees',
      'Create technical risk mitigation strategies',
      'Invest in technical training and development',
      'Consider alternative technical approaches'
    ],
    'Compliance Issue': [
      'Conduct immediate compliance audit',
      'Update documentation to meet regulatory standards',
      'Implement compliance monitoring systems',
      'Train team on regulatory requirements',
      'Establish regular compliance review cycles',
      'Engage with regulatory authorities proactively'
    ],
    'comprehensive': [
      'Implement integrated project management system',
      'Establish cross-functional review processes',
      'Create automated monitoring and alerting',
      'Develop comprehensive risk management framework',
      'Implement continuous improvement processes',
      'Establish stakeholder communication protocols'
    ]
  };
  
  return recommendations[issueType] || [
    'Contact project manager for detailed analysis',
    'Schedule comprehensive project review',
    'Implement monitoring and control measures'
  ];
}

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

//  Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Check if React build exists
  const reactBuildPath = path.join(__dirname, 'react-frontend/dist/index.html');
  const publicPath = path.join(__dirname, 'public/index.html');
  
  if (require('fs').existsSync(reactBuildPath)) {
    res.sendFile(reactBuildPath);
  } else if (require('fs').existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else {
    res.status(404).send('Application not found. Please build the frontend first.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI DPR System running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`⚛️  React Frontend (dev): http://localhost:5173`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('📂 Database connection closed.');
    process.exit(0);
  });
});