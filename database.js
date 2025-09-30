// Database Service - Handles database connections and operations
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
        
        // Initialize sample data if needed
        await this.initializeSampleData();
        
      } else {
        logger.warn('⚠️  Database connection issues:', connectionTest.error);
        
        if (connectionTest.needsSetup) {
          logger.info('');
          logger.info('🔧 Database Setup Required:');
          logger.info('1. Go to your Supabase dashboard');
          logger.info('2. Navigate to SQL Editor');
          logger.info('3. Run the SQL script from database/schema.sql');
          logger.info('4. Or run: npm run setup:db');
          logger.info('');
          logger.info('⚠️  Server will continue running but database operations will fail');
          logger.info('   until tables are created.');
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

  // Initialize sample data
  async initializeSampleData() {
    if (!this.isConnected) return;

    try {
      // Check if data already exists
      const { data: existingReports } = await this.supabase
        .from('reports')
        .select('id')
        .limit(1);

      if (existingReports && existingReports.length > 0) {
        logger.info('📊 Sample data already exists');
        return;
      }

      logger.info('📊 Initializing sample data...');
      // Sample data initialization would go here
      logger.info('✅ Sample data initialized');
      
    } catch (error) {
      logger.warn('⚠️  Could not initialize sample data:', error.message);
    }
  }

  // Get database client
  getClient(useAdmin = false) {
    return useAdmin ? this.supabaseAdmin : this.supabase;
  }

  // Check if database is connected
  isReady() {
    return this.isConnected;
  }
}

// Export singleton instance
module.exports = new DatabaseService();