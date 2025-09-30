import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout for file uploads and AI processing
})

// Mock data for when API is not available
const mockData = {
  reports: [
    {
      id: 'RPT-2023-001',
      project: 'Project Alpha',
      issueType: 'Budget Mismatch',
      description: 'Budget exceeds allocated funds by 15%',
      severity: 'High',
      date: '2023-08-15',
      status: 'Open'
    },
    {
      id: 'RPT-2023-002',
      project: 'Project Beta',
      issueType: 'Unrealistic Schedule',
      description: 'Project timeline is too short for the scope of work',
      severity: 'Medium',
      date: '2023-08-16',
      status: 'In Review'
    },
    {
      id: 'RPT-2023-003',
      project: 'Project Gamma',
      issueType: 'Resource Allocation',
      description: 'Insufficient resources allocated to critical tasks',
      severity: 'Low',
      date: '2023-08-17',
      status: 'Resolved'
    }
  ]
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const apiService = {
  // Reports endpoints
  async getReports(params = {}) {
    try {
      const response = await api.get('/reports', { params })
      return response.data
    } catch (error) {
      console.log('API not available, returning mock data')
      return { reports: mockData.reports, pagination: { totalReports: mockData.reports.length } }
    }
  },

  async getReport(id) {
    try {
      const response = await api.get(`/reports/${id}`)
      return response.data
    } catch (error) {
      const mockReport = mockData.reports.find(r => r.id === id)
      return mockReport || null
    }
  },

  async createReport(reportData) {
    try {
      const response = await api.post('/reports', reportData)
      return response.data
    } catch (error) {
      console.log('API not available, simulating report creation')
      const newReport = {
        id: `RPT-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        ...reportData,
        status: 'Open',
        created_at: new Date().toISOString(),
        ai_analysis: 'Simulated AI analysis for offline mode',
        confidence_score: 0.85
      }
      return { report: newReport, message: 'Report created successfully (offline mode)' }
    }
  },

  async updateReport(id, updates) {
    try {
      const response = await api.put(`/reports/${id}`, updates)
      return response.data
    } catch (error) {
      console.log('API not available, simulating report update')
      return { message: 'Report updated successfully (offline mode)' }
    }
  },

  async deleteReport(id) {
    try {
      const response = await api.delete(`/reports/${id}`)
      return response.data
    } catch (error) {
      console.log('API not available, simulating report deletion')
      return { message: 'Report deleted successfully (offline mode)' }
    }
  },

  async updateReportStatus(id, status) {
    try {
      const response = await api.put(`/reports/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.log('API not available, simulating status update')
      return { message: 'Status updated successfully (offline mode)' }
    }
  },

  // File Upload
  async uploadFiles(files) {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.log('API not available, simulating file upload')
      const mockFiles = files.map((file, index) => ({
        id: `file-${Date.now()}-${index}`,
        filename: `uploaded-${file.name}`,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        uploadDate: new Date().toISOString()
      }))
      return { message: 'Files uploaded successfully (offline mode)', files: mockFiles }
    }
  },

  // AI Analysis
  async analyzeProject(data) {
    try {
      const response = await api.post('/ai/analyze', data)
      return response.data
    } catch (error) {
      console.log('API not available, returning mock AI analysis')
      return {
        overview: {
          completeness_score: 0.87,
          compliance_score: 0.82,
          risk_score: 0.65,
          confidence_score: 0.91
        },
        analysis: 'Simulated AI analysis indicates potential areas for improvement. This is mock data for offline development.',
        recommendations: [
          'Review project documentation',
          'Update compliance measures',
          'Monitor risk factors',
          'Schedule team review'
        ],
        risk_factors: [
          { factor: 'Timeline Risk', probability: 0.67, impact: 'Medium' },
          { factor: 'Budget Risk', probability: 0.45, impact: 'High' }
        ],
        inconsistencies: [
          { type: 'Data Mismatch', severity: 'Low', description: 'Minor discrepancies in documentation' }
        ],
        processing_time: 1500,
        timestamp: new Date().toISOString()
      }
    }
  },

  async analyzeFiles(files, context = {}) {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      
      Object.keys(context).forEach(key => {
        formData.append(key, context[key])
      })
      
      const response = await api.post('/ai/analyze-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      })
      return response.data
    } catch (error) {
      console.log('API not available, returning mock file analysis')
      return {
        message: 'Files analyzed successfully (offline mode)',
        summary: {
          total_files: files.length,
          total_issues: Math.floor(Math.random() * 5) + 1,
          average_compliance: 0.83,
          processing_time: 2500
        },
        file_analyses: files.map(file => ({
          filename: file.name,
          size: file.size,
          type: file.type,
          analysis: `Simulated analysis for ${file.name}`,
          issues_detected: Math.floor(Math.random() * 3) + 1,
          compliance_score: Math.random() * 0.3 + 0.7
        })),
        overall_recommendations: [
          'Review analyzed documents',
          'Address identified issues',
          'Update documentation standards'
        ]
      }
    }
  },

  // Projects
  async getProjects() {
    try {
      const response = await api.get('/projects')
      return response.data
    } catch (error) {
      console.log('API not available, returning mock projects')
      return [
        { id: 1, name: 'Project Alpha', status: 'active', budget: 100000 },
        { id: 2, name: 'Project Beta', status: 'active', budget: 150000 },
        { id: 3, name: 'Project Gamma', status: 'completed', budget: 80000 }
      ]
    }
  },

  // Analytics endpoints
  async getDashboardStats() {
    try {
      const response = await api.get('/analytics/dashboard')
      return response.data
    } catch (error) {
      console.log('API not available, returning mock stats')
      return {
        totalReports: [{ count: 127 }],
        openReports: [{ count: 23 }],
        highSeverity: [{ count: 7 }],
        recentReports: [{ count: 15 }]
      }
    }
  },

  async getComprehensiveAnalytics() {
    try {
      const response = await api.get('/analytics/comprehensive')
      return response.data
    } catch (error) {
      console.log('API not available, returning mock comprehensive analytics')
      return {
        summary: {
          total_reports: 127,
          open_reports: 23,
          critical_reports: 7,
          recent_reports: 15,
          avg_processing_time: 1500,
          avg_confidence: 87,
          system_health: 'Operational',
          last_updated: new Date().toISOString()
        },
        issueTypeDistribution: [
          { issue_type: 'Budget Mismatch', count: 45 },
          { issue_type: 'Unrealistic Schedule', count: 38 },
          { issue_type: 'Resource Allocation', count: 32 },
          { issue_type: 'Technical Risk', count: 12 }
        ],
        severityDistribution: [
          { severity: 'High', count: 28 },
          { severity: 'Medium', count: 67 },
          { severity: 'Low', count: 32 }
        ],
        trendsData: []
      }
    }
  },

  // Utility functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export default api