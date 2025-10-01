// Unified Database Service for AI DPR System
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class DatabaseService {
  constructor() {
    this.supabase = null;
    this.supabaseAdmin = null;
    this.isConnected = false;
  }

  // Initialize database connection
  async initialize() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        throw new Error('Missing required Supabase environment variables');
      }

      // Create Supabase clients
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      // Test connection
      const connectionTest = await this.testConnection();
      
      if (connectionTest.success) {
        this.isConnected = true;
        logger.info('✅ Connected to Supabase database successfully');
      } else {
        logger.error('❌ Database connection failed:', connectionTest.error);
        
        if (connectionTest.needsSetup) {
          logger.info('\n🔧 Database Setup Required:');
          logger.info('Run: npm run setup:db');
          logger.info('Or manually run: node scripts/setup-db.js\n');
        }
      }
      
    } catch (error) {
      logger.error('❌ Database initialization failed:', error.message);
      logger.info('⚠️  Server will continue running in limited mode');
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await this.supabase
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
  }

  // Get database client (public or admin)
  getClient(useAdmin = false) {
    return useAdmin ? this.supabaseAdmin : this.supabase;
  }

  // Check if database is ready
  isReady() {
    return this.isConnected;
  }

  // Common database operations
  async getUsers(filters = {}) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .match(filters);
    return { data, error };
  }

  async getProjects(filters = {}) {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        project_manager:project_manager_id(full_name),
        created_by_user:created_by(full_name)
      `)
      .match(filters);
    return { data, error };
  }

  async getReports(filters = {}, limit = 50) {
    const { data, error } = await this.supabase
      .from('report_summary')
      .select('*')
      .match(filters)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async getDashboardStats() {
    const { data, error } = await this.supabase
      .from('dashboard_stats')
      .select('*')
      .single();
    return { data, error };
  }

  async createReport(reportData) {
    const { data, error } = await this.supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();
    return { data, error };
  }

  async updateReport(id, updates) {
    const { data, error } = await this.supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async uploadFile(fileData) {
    const { data, error } = await this.supabase
      .from('file_attachments')
      .insert([fileData])
      .select()
      .single();
    return { data, error };
  }
}

// Export singleton instance
module.exports = new DatabaseService();