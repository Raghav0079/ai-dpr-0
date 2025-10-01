# Supabase Setup Instructions for AI DPR System

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., https://your-project-ref.supabase.co)
   - **anon/public key** (starts with "eyJ...")
   - **service_role key** (starts with "eyJ...")

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and replace the placeholder values:
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-strong-jwt-secret-key
   ```

## Step 3: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `database/supabase-schema.sql`
4. Paste and run the SQL script in the Supabase SQL Editor

This will create:
- All necessary tables (users, projects, reports, file_attachments, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Audit logging functions
- Full-text search capabilities

## Step 4: Configure Storage (Optional)

1. Navigate to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `report-attachments` (for file uploads)
   - `project-documents` (for project files)
   - `user-avatars` (for profile pictures)

3. Set up storage policies for each bucket as needed

## Step 5: Test the Connection

1. Start the server:
   ```bash
   npm start
   ```

2. Check the console for:
   ```
   ✅ Connected to Supabase database successfully
   📊 Sample data inserted successfully
   ✅ Database initialization completed
   🚀 AI DPR System server running on port 3000
   ```

## Step 6: Update Frontend Configuration (Optional)

If you want to use Supabase client features in the frontend:

1. Install Supabase in the React frontend:
   ```bash
   cd react-frontend
   npm install @supabase/supabase-js
   ```

2. Create `react-frontend/src/config/supabase.js`:
   ```javascript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = 'https://your-project-ref.supabase.co'
   const supabaseAnonKey = 'your-anon-key'

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

## Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Server starts without errors
- [ ] Sample data appears in Supabase dashboard
- [ ] API endpoints respond correctly

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your IP is not blocked by Supabase
- Ensure your project is not paused

### Schema Issues
- Make sure all SQL commands executed successfully
- Check for any error messages in the SQL Editor
- Verify tables were created in the Supabase dashboard

### API Issues
- Check server logs for detailed error messages
- Verify environment variables are loaded correctly
- Test individual API endpoints using Postman or similar

## Benefits of Supabase Integration

✅ **Scalable PostgreSQL Database** - Production-ready cloud database
✅ **Real-time Subscriptions** - Live updates for collaborative features
✅ **Built-in Authentication** - User management and auth flows
✅ **Row Level Security** - Fine-grained access control
✅ **File Storage** - Secure file upload and management
✅ **Auto-generated APIs** - REST and GraphQL endpoints
✅ **Dashboard & Analytics** - Built-in admin interface
✅ **Backup & Recovery** - Automated database backups

## Next Steps

After successful setup:
1. Deploy your application to a cloud platform
2. Configure production environment variables
3. Set up custom domains for your Supabase project
4. Enable additional Supabase features (Auth, Realtime, etc.)
5. Monitor usage and optimize performance

## Support

For issues specific to this setup:
- Check the server logs for detailed error messages
- Verify your Supabase project is properly configured
- Test API endpoints individually

For Supabase-specific issues:
- Visit the Supabase documentation: https://supabase.com/docs
- Check the Supabase community: https://github.com/supabase/supabase/discussions