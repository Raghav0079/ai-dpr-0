# Database Implementation - Revised

This document describes the revised and cleaned up database implementation for the AI DPR System.

## 🔄 What Changed

### Removed Files (Redundant/Outdated)
- ❌ `database/schema.sql` - Old schema with inconsistencies
- ❌ `database/supabase-schema.sql` - Overly complex schema 
- ❌ `scripts/setup-database.js` - Used deprecated `exec_sql` RPC
- ❌ `scripts/setup-basic-db.js` - Basic version, not comprehensive
- ❌ `scripts/setup-supabase.js` - Just configuration helper
- ❌ `src/services/database.js` - Basic service implementation

### New Files (Unified & Optimized)
- ✅ `database/schema-unified.sql` - Single source of truth for database schema
- ✅ `scripts/setup-db.js` - Unified setup script with better error handling
- ✅ `src/services/database-unified.js` - Clean, comprehensive database service
- ✅ `scripts/cleanup-db-files.js` - Cleanup script for old files

## 📊 Database Schema Overview

### Core Tables

1. **users** - User profiles (extends Supabase auth)
   - Links to Supabase auth.users via `auth_id`
   - Roles: admin, manager, user
   - Department, avatar, preferences

2. **projects** - Project management
   - Budget, timeline, status tracking
   - Project manager and creator references
   - Department and location fields

3. **reports** - Core reporting with AI analysis
   - Issue types (Budget, Schedule, Technical, etc.)
   - Severity levels (Low, Medium, High, Critical)
   - AI analysis fields (confidence, risk, sentiment scores)
   - Status workflow (Open → In Review → In Progress → Resolved → Closed)

4. **file_attachments** - File uploads
   - Linked to reports
   - File metadata and storage info
   - Uploader tracking

5. **audit_logs** - System audit trail
   - Tracks all changes to critical tables
   - User attribution and timestamps

### Key Features

- **Row Level Security (RLS)** - Proper access control
- **Audit Triggers** - Automatic change logging
- **Performance Indexes** - Optimized for common queries
- **Data Validation** - Check constraints for data integrity
- **Analytics Views** - Pre-built dashboard queries

## 🚀 Setup Instructions

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Database Setup
```bash
# Run the unified setup script
npm run setup:db

# OR manually:
node scripts/setup-db.js
```

### 3. Manual Setup (Alternative)
If the script fails, you can manually run the SQL:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema-unified.sql`
4. Execute the SQL

## 🛠️ Database Service Usage

```javascript
const db = require('./src/services/database-unified');

// Initialize (call once at app startup)
await db.initialize();

// Check if ready
if (db.isReady()) {
  // Get dashboard stats
  const { data: stats } = await db.getDashboardStats();
  
  // Get reports with filters
  const { data: reports } = await db.getReports({ status: 'Open' });
  
  // Create new report
  const { data: newReport } = await db.createReport({
    title: 'Budget Issue',
    issue_type: 'Budget Mismatch',
    description: 'Budget allocation mismatch found',
    severity: 'High',
    project_id: 'uuid-here'
  });
}
```

## 📈 Performance Optimizations

### Indexes Created
- **Users**: email, auth_id, role
- **Projects**: status, manager, department  
- **Reports**: project_id, status, severity, issue_type, assigned_to, created_at
- **Files**: report_id
- **Audit**: table_name + record_id

### Views for Analytics
- `dashboard_stats` - Real-time dashboard metrics
- `report_summary` - Detailed report view with joins

## 🔒 Security Features

### Row Level Security Policies
- **Users**: Can view all, update own profile only
- **Projects**: View all, manage by managers/admins
- **Reports**: View all, update assigned/created by user or managers
- **Files**: View all, upload authenticated users

### Audit Logging
- Automatic tracking of all INSERT/UPDATE/DELETE operations
- User attribution via Supabase auth
- Complete old/new value capture

## 🧪 Testing Database Setup

After running setup, verify with:
```javascript
// Test connection
const result = await db.testConnection();
console.log(result.success); // should be true

// Check tables exist
const { data: stats } = await db.getDashboardStats();
console.log(stats); // should return dashboard metrics
```

## 🔧 Troubleshooting

### Common Issues

1. **"Tables not found"**
   - Run the setup script: `npm run setup:db`
   - Check Supabase credentials in `.env`

2. **"Connection failed"**
   - Verify Supabase project is active
   - Check environment variables
   - Confirm service role key has proper permissions

3. **"RLS policy violation"**
   - Ensure user is authenticated
   - Check user role and permissions
   - Verify RLS policies are correctly applied

### Environment Variables Required
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📝 Migration Notes

If upgrading from the old database implementation:

1. **Backup existing data** if any exists
2. **Run the new setup script** - it will create tables if they don't exist
3. **Update import paths** in your code:
   ```javascript
   // Old
   const db = require('./src/services/database');
   
   // New
   const db = require('./src/services/database-unified');
   ```
4. **Test all functionality** to ensure compatibility

## 🎯 Next Steps

With the revised database implementation, you can now:

1. **Run the setup**: `npm run setup:db`
2. **Start the application**: `npm start`
3. **Begin using the system** with a clean, optimized database structure

The new implementation provides better performance, security, and maintainability compared to the previous scattered approach.