const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://csakacykllmrnecovpep.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYWthY3lrbGxtcm5lY292cGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjYwMjYsImV4cCI6MjA3NDcwMjAyNn0._tMumOubOTiCBpjjuEvoGsYvAVcVq1qKzLWiK1xBx_E';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYWthY3lrbGxtcm5lY292cGVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyNjAyNiwiZXhwIjoyMDc0NzAyMDI2fQ.6TlaVWQzC1yUiE7DVp08GpHN9nvv1L64BeR8JpJdPsA';

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database service functions
const supabaseService = {
  // Test connection
  async testConnection() {
    try {
      // Try to select from users table
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'Database tables not found. Please run database setup first.',
            needsSetup: true 
          };
        }
        return { success: false, error: error.message };
      }
      
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  // Users
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();
      
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Projects
  async getProjects(userId = null) {
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('created_by', userId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  // Reports
  async getReports(filters = {}) {
    try {
      let query = supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.filter && filters.filter !== 'all') {
        if (filters.filter.includes(':')) {
          const [field, value] = filters.filter.split(':')
          query = query.eq(field, value)
        } else {
          // Default to status filter
          query = query.eq('status', filters.filter)
        }
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,project_name.ilike.%${filters.search}%`)
      }

      // Pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        data: data || [], 
        pagination: {
          total: count || 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: Math.ceil((count || 0) / (filters.limit || 10))
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getReportById(id) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async createReport(reportData) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateReport(id, updates) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async deleteReport(id) {
    try {
      // Delete related records first
      await supabase.from('file_attachments').delete().eq('report_id', id)
      await supabase.from('ai_analysis_logs').delete().eq('report_id', id)
      
      // Delete the report
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // File attachments
  async createFileAttachment(attachmentData) {
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .insert([attachmentData])
        .select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getFileAttachments(reportId) {
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('report_id', reportId)
        .order('upload_date', { ascending: false })
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async deleteFileAttachment(id) {
    try {
      const { error } = await supabase
        .from('file_attachments')
        .delete()
        .eq('id', id)
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // AI Analysis logs
  async createAIAnalysisLog(logData) {
    try {
      const { data, error } = await supabase
        .from('ai_analysis_logs')
        .insert([logData])
        .select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getAIAnalysisHistory(reportId) {
    try {
      const { data, error } = await supabase
        .from('ai_analysis_logs')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false })
      
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Analytics
  async getDashboardAnalytics() {
    try {
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
      ])

      return { 
        success: true, 
        data: {
          totalReports: totalReports.count || 0,
          openReports: openReports.count || 0,
          highSeverityReports: highSeverityReports.count || 0,
          recentReports: recentReports.count || 0
        }
      }
    } catch (error) {
      console.log('Dashboard analytics error (likely missing tables):', error.message);
      return { success: false, error: error.message, needsSetup: true }
    }
  },

  async getComprehensiveAnalytics() {
    try {
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
      ])

      return { 
        success: true, 
        data: {
          totalReports: totalReports.count || 0,
          openReports: openReports.count || 0,
          highSeverityReports: highSeverityReports.count || 0,
          recentReports: recentReports.count || 0
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getIssueTypeDistribution() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('issue_type')
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const distribution = (data || []).reduce((acc, report) => {
        acc[report.issue_type] = (acc[report.issue_type] || 0) + 1
        return acc
      }, {})
      
      const result = Object.entries(distribution).map(([issue_type, count]) => ({
        issue_type,
        count
      }))

      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getSeverityDistribution() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('severity')
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const distribution = (data || []).reduce((acc, report) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1
        return acc
      }, {})
      
      const result = Object.entries(distribution).map(([severity, count]) => ({
        severity,
        count
      }))

      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getTrendsData(days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('reports')
        .select('created_at, issue_type')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Projects functions
  async getProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async createProject(projectData) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // File storage (using Supabase Storage)
  async uploadFile(bucket, fileName, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    
    if (error) throw error
    return data
  },

  async downloadFile(bucket, fileName) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(fileName)
    
    if (error) throw error
    return data
  },

  async deleteFile(bucket, fileName) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])
    
    if (error) throw error
    return { success: true }
  },

  async getPublicURL(bucket, fileName) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return data.publicUrl
  }
};

module.exports = supabaseService;