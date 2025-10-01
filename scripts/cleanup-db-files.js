#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Removes old, redundant database files
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up old database files...\n');

// Files to remove
const filesToRemove = [
  'database/schema.sql',
  'database/supabase-schema.sql', 
  'scripts/setup-database.js',
  'scripts/setup-basic-db.js',
  'scripts/setup-supabase.js',
  'src/services/database.js'
];

// Files to keep (new unified versions):
// - database/schema-unified.sql
// - scripts/setup-db.js
// - src/services/database-unified.js

let removedCount = 0;

filesToRemove.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath}`);
      removedCount++;
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Failed to remove ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Cleanup completed! Removed ${removedCount} files.`);
console.log('\n📋 New unified database structure:');
console.log('• database/schema-unified.sql - Single source of truth for DB schema');
console.log('• scripts/setup-db.js - Unified setup script');  
console.log('• src/services/database-unified.js - Clean database service');
console.log('\n🚀 Run: node scripts/setup-db.js to initialize your database');