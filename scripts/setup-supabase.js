#!/usr/bin/env node

/**
 * Supabase Connection Setup Script
 * This script helps you complete the Supabase setup for the AI DPR System
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 AI DPR System - Supabase Setup Helper');
console.log('=========================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('Please create a .env file based on .env.example\n');
    process.exit(1);
}

// Read current .env file
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('📄 Current .env configuration:');
console.log('-----------------------------');

// Parse and display current values
const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
    }
});

// Check required Supabase variables
const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('\n🔍 Checking required Supabase variables:');
console.log('---------------------------------------');

let missingVars = [];
requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('placeholder') || value.includes('your-')) {
        console.log(`❌ ${varName}: Missing or placeholder value`);
        missingVars.push(varName);
    } else {
        console.log(`✅ ${varName}: Configured`);
    }
});

if (missingVars.length > 0) {
    console.log('\n📋 Next Steps:');
    console.log('-------------');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project: csakacykllmrnecovpep');
    console.log('3. Go to Settings → API');
    console.log('4. Copy the following values to your .env file:\n');
    
    if (missingVars.includes('SUPABASE_URL')) {
        console.log('   SUPABASE_URL=https://csakacykllmrnecovpep.supabase.co');
    }
    if (missingVars.includes('SUPABASE_ANON_KEY')) {
        console.log('   SUPABASE_ANON_KEY=<paste your anon public key here>');
    }
    if (missingVars.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        console.log('   SUPABASE_SERVICE_ROLE_KEY=<paste your service role key here>');
    }
    
    console.log('\n🗄️  Database Schema Setup:');
    console.log('1. Go to SQL Editor in your Supabase dashboard');
    console.log('2. Run the SQL in database/supabase-schema.sql');
    console.log('3. This will create all necessary tables and security policies\n');
    
} else {
    console.log('\n✅ All Supabase variables are configured!');
    console.log('\n🧪 Testing connection...');
    
    // Test the connection
    testConnection();
}

async function testConnection() {
    try {
        const supabaseService = require('./config/supabase');
        const result = await supabaseService.testConnection();
        
        if (result.success) {
            console.log('✅ Supabase connection successful!');
            console.log('\n🚀 Your AI DPR System is ready to use!');
            console.log('Run: npm start');
        } else {
            console.log('❌ Connection failed:', result.error);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Verify your keys are correct');
            console.log('2. Check that your Supabase project is active');
            console.log('3. Ensure RLS policies are set up (run the schema SQL)');
        }
    } catch (error) {
        console.log('❌ Connection test failed:', error.message);
        console.log('\nPlease check your configuration and try again.');
    }
}

console.log('\n💡 For detailed setup instructions, see: SUPABASE_SETUP.md');
console.log('🐛 If you need help, check the server logs when running npm start\n');