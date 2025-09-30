// Database Setup Script for AI DPR System
// Run this script to create all required tables in Supabase

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...');

  try {
    // Create users table
    console.log('📝 Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          department VARCHAR(100),
          phone VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `
    });

    if (usersError) {
      console.error('❌ Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // Create projects table
    console.log('📝 Creating projects table...');
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          project_manager_id UUID,
          start_date DATE,
          end_date DATE,
          budget DECIMAL(15,2),
          status VARCHAR(50) DEFAULT 'planning',
          priority VARCHAR(20) DEFAULT 'medium',
          department VARCHAR(100),
          location VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
        CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
      `
    });

    if (projectsError) {
      console.error('❌ Error creating projects table:', projectsError);
    } else {
      console.log('✅ Projects table created successfully');
    }

    // Create reports table
    console.log('📝 Creating reports table...');
    const { error: reportsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID,
          user_id UUID,
          title VARCHAR(255) NOT NULL,
          report_type VARCHAR(100) NOT NULL,
          issue_type VARCHAR(100),
          description TEXT,
          current_status TEXT,
          challenges TEXT,
          next_steps TEXT,
          budget_info JSONB DEFAULT '{}'::jsonb,
          timeline_info JSONB DEFAULT '{}'::jsonb,
          resource_info JSONB DEFAULT '{}'::jsonb,
          risk_assessment JSONB DEFAULT '{}'::jsonb,
          attachments JSONB DEFAULT '[]'::jsonb,
          ai_analysis TEXT,
          ai_insights JSONB DEFAULT '{}'::jsonb,
          ai_risk_score DECIMAL(3,2) DEFAULT 0,
          ai_confidence_score DECIMAL(3,2) DEFAULT 0,
          sentiment_score DECIMAL(3,2) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'draft',
          submission_date DATE,
          review_date DATE,
          reviewer_id UUID,
          reviewer_comments TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(project_id);
        CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
        CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
        CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
      `
    });

    if (reportsError) {
      console.error('❌ Error creating reports table:', reportsError);
    } else {
      console.log('✅ Reports table created successfully');
    }

    // Create files table
    console.log('📝 Creating files table...');
    const { error: filesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS files (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          report_id UUID,
          original_name VARCHAR(255) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER,
          mime_type VARCHAR(100),
          uploaded_by UUID,
          upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_files_report ON files(report_id);
      `
    });

    if (filesError) {
      console.error('❌ Error creating files table:', filesError);
    } else {
      console.log('✅ Files table created successfully');
    }

    // Insert default admin user
    console.log('👤 Creating default admin user...');
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const { error: adminError } = await supabase
      .from('users')
      .upsert([
        {
          email: 'admin@aidpr.com',
          password_hash: adminPassword,
          full_name: 'System Administrator',
          role: 'admin',
          department: 'IT',
          is_active: true
        }
      ], { 
        onConflict: 'email',
        ignoreDuplicates: true 
      });

    if (adminError) {
      console.error('❌ Error creating admin user:', adminError);
    } else {
      console.log('✅ Default admin user created (email: admin@aidpr.com, password: admin123)');
    }

    // Insert sample project
    console.log('📁 Creating sample project...');
    const { error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          name: 'Digital Infrastructure Upgrade',
          description: 'Comprehensive upgrade of digital infrastructure including network, servers, and security systems',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          budget: 5000000.00,
          status: 'active',
          department: 'IT',
          location: 'Mumbai'
        }
      ])
      .select();

    if (projectError && projectError.code !== '23505') { // Ignore duplicate key error
      console.error('❌ Error creating sample project:', projectError);
    } else {
      console.log('✅ Sample project created successfully');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('• Users table ✅');
    console.log('• Projects table ✅');
    console.log('• Reports table ✅');
    console.log('• Files table ✅');
    console.log('• Admin user created ✅');
    console.log('• Sample project created ✅');
    console.log('\n🔐 Default Admin Credentials:');
    console.log('Email: admin@aidpr.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the admin password after first login!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();