# Netlify Environment Variables Setup

## Required Environment Variables for AI DPR System

When deploying to Netlify, you need to set these environment variables in your Netlify dashboard:

### 🔑 Essential Variables

```bash
NODE_ENV=production
PORT=8888
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

### 🗄️ Database Configuration (Supabase)

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

### 📁 File Upload Configuration

```bash
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=/tmp/uploads
```

### 🌐 CORS Configuration

```bash
CORS_ORIGIN=https://your-netlify-app-name.netlify.app
```

## 🚀 How to Set Environment Variables in Netlify

### Method 1: Netlify Dashboard (Recommended)

1. **Go to your Netlify dashboard**
   - Navigate to https://app.netlify.com
   - Select your AI DPR project

2. **Access Site Settings**
   - Click on "Site settings" 
   - Go to "Environment variables" in the left sidebar

3. **Add Variables**
   - Click "Add variable"
   - Enter the key and value from the list above
   - Click "Save"

4. **Redeploy**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

### Method 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables
netlify env:set NODE_ENV production
netlify env:set JWT_SECRET your-jwt-secret-here
netlify env:set SUPABASE_URL https://your-project-ref.supabase.co
# ... add other variables
```

### Method 3: Environment File Upload

1. Create a `.env.production` file:
```bash
NODE_ENV=production
JWT_SECRET=your-jwt-secret
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
```

2. In Netlify dashboard:
   - Go to Site settings → Environment variables
   - Click "Import from .env"
   - Upload your `.env.production` file

## 🔍 Testing Environment Variables

After deployment, test if environment variables are working:

1. **Check Health Endpoint**
   ```
   GET https://your-app.netlify.app/.netlify/functions/health
   ```

2. **Expected Response**
   ```json
   {
     "status": "OK",
     "message": "AI DPR System is running on Netlify",
     "timestamp": "2025-10-01T05:30:00.000Z",
     "environment": "production",
     "platform": "Netlify"
   }
   ```

## 🛠️ Troubleshooting

### Issue: "Environment variable not found"
- **Solution**: Double-check variable names (case-sensitive)
- **Check**: Go to Site settings → Environment variables
- **Fix**: Redeploy after adding missing variables

### Issue: "Database connection failed"
- **Solution**: Verify DATABASE_URL format
- **Check**: Supabase connection settings
- **Fix**: Update Supabase credentials

### Issue: "CORS errors"
- **Solution**: Add your Netlify domain to CORS_ORIGIN
- **Format**: `https://your-app-name.netlify.app`

## 📋 Deployment Checklist

- [ ] All environment variables set in Netlify dashboard
- [ ] Supabase database configured and accessible
- [ ] JWT_SECRET is a strong, random string
- [ ] CORS_ORIGIN matches your Netlify domain
- [ ] Test deployment with health endpoint
- [ ] Verify dashboard loads correctly
- [ ] Test API endpoints functionality

## 🎉 Success!

Your AI DPR System should now be running successfully on Netlify with all environment variables configured!

**Next Steps:**
1. Test all features in production
2. Monitor logs in Netlify dashboard
3. Set up custom domain (optional)
4. Enable Netlify Analytics (optional)