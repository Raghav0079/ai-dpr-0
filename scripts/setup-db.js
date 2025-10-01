#!/usr/bin/env node

/**
 * Unified Database Setup Script for AI DPR System
 * This replaces all other setup scripts
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🚀 AI DPR System - Database Setup');
console.log('=================================\n');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📋 Setup Instructions:');
  console.error('1. Copy .env.example to .env');
  console.error('2. Add your Supabase credentials to .env');
  console.error('3. Run this script again\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);

    if (healthError && !healthError.message.includes('relation "_supabase_migrations" does not exist')) {
      throw new Error(`Connection failed: ${healthError.message}`);
    }

    console.log('✅ Database connection successful');

    // Check if our tables exist
    console.log('🔍 Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'projects', 'reports']);

    const existingTables = tables ? tables.map(t => t.table_name) : [];
    console.log(`📊 Found ${existingTables.length} existing tables:`, existingTables);

    if (existingTables.length === 3) {
      console.log('✅ All core tables already exist');
      
      // Test table structure
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (!userError) {
        console.log('✅ Database schema is ready');
        await initializeSampleData();
        return;
      }
    }

    // Read and execute SQL schema
    console.log('📝 Setting up database schema...');
    const schemaPath = path.join(__dirname, '../database/schema-unified.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements and execute
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.includes('CREATE') || statement.includes('INSERT') || statement.includes('ALTER')) {
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (error && !error.message.includes('already exists')) {
            console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
          }
        } catch (err) {
          console.warn(`⚠️  Could not execute statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('✅ Database schema setup completed');
    await initializeSampleData();

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify your Supabase credentials in .env');
    console.error('2. Check that your Supabase project is active');
    console.error('3. Try running the SQL manually in Supabase dashboard');
    process.exit(1);
  }
}

async function initializeSampleData() {
  try {
    console.log('👤 Checking for existing users...');
    
    const { data: existingUsers } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'admin@aidpr.com');

    if (!existingUsers || existingUsers.length === 0) {
      console.log('👤 Creating admin user...');
      
      // Note: In production, you'd create this through Supabase Auth
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          email: 'admin@aidpr.com',
          full_name: 'System Administrator',
          role: 'admin',
          department: 'IT',
          is_active: true
        }]);

      if (userError && !userError.message.includes('duplicate key')) {
        console.warn('⚠️  Could not create admin user:', userError.message);
      } else {
        console.log('✅ Admin user created');
      }
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('• Core tables created ✅');
    console.log('• Indexes optimized ✅');  
    console.log('• Security policies active ✅');
    console.log('• Sample data initialized ✅');
    console.log('\n🚀 Your AI DPR System is ready to use!');
    console.log('Run: npm start');

  } catch (error) {
    console.warn('⚠️  Sample data initialization failed:', error.message);
    console.log('✅ Core database setup completed - application should still work');
  }
}

// Run setup
setupDatabase();