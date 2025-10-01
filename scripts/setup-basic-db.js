// Simple Database Setup for AI DPR System
// This creates tables using Supabase API without exec_sql

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBasicDatabase() {
  console.log('🚀 Starting basic database setup...');

  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .limit(1);

    if (testError && testError.code === 'PGRST116') {
      console.log('📝 Users table does not exist. Please run the SQL script manually.');
      console.log('');
      console.log('🔧 Manual Setup Instructions:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the SQL script from database_setup.sql');
      console.log('');
      console.log('🔗 Supabase Dashboard: https://app.supabase.com/project/' + supabaseUrl.split('//')[1].split('.')[0]);
      return;
    }

    console.log('✅ Database connection successful');

    // Check if users table has data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (userError) {
      console.error('❌ Error checking users:', userError);
      return;
    }

    if (!userData || userData.length === 0) {
      console.log('👤 Creating default admin user...');
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      const { error: adminError } = await supabase
        .from('users')
        .insert([
          {
            email: 'admin@aidpr.com',
            password_hash: adminPassword,
            full_name: 'System Administrator',
            role: 'admin',
            department: 'IT',
            is_active: true
          }
        ]);

      if (adminError) {
        console.error('❌ Error creating admin user:', adminError);
      } else {
        console.log('✅ Default admin user created');
      }
    } else {
      console.log('✅ Users table already has data');
    }

    // Check projects table
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (!projectError && (!projectData || projectData.length === 0)) {
      console.log('📁 Creating sample project...');
      const { error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            name: 'Digital Infrastructure Upgrade',
            description: 'Comprehensive upgrade of digital infrastructure',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            budget: 5000000.00,
            status: 'active',
            department: 'IT',
            location: 'Mumbai'
          }
        ]);

      if (!insertError) {
        console.log('✅ Sample project created');
      }
    }

    console.log('');
    console.log('🎉 Database setup completed!');
    console.log('');
    console.log('🔐 Default Admin Credentials:');
    console.log('Email: admin@aidpr.com');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  Please change the admin password after first login!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupBasicDatabase();