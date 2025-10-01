# GitHub Repository & Vercel Deployment Guide

This guide will help you set up a GitHub repository and deploy your AI DPR System to Vercel.

## 📋 Prerequisites

1. **GitHub Account**: [Create one here](https://github.com/join) if you don't have one
2. **Vercel Account**: [Sign up here](https://vercel.com/signup) (can use GitHub to sign in)
3. **Supabase Account**: [Create account](https://supabase.com) for database (optional - app works with mock data)

## 🚀 Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right, select "New repository"
3. Repository name: `ai-dpr-system` (or your preferred name)
4. Description: `AI-powered Detailed Project Report system`
5. Set to **Public** (required for free Vercel deployment)
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### Option B: Using GitHub CLI (if you have it installed)

```bash
gh repo create ai-dpr-system --public --description "AI-powered Detailed Project Report system"
```

## 📁 Step 2: Push Your Code to GitHub

Open terminal/command prompt in your project directory and run:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: AI DPR System"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-dpr-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deploy to Vercel

### Option A: One-Click Deploy (Easiest)

1. **Fork the repository** on GitHub (if you haven't created your own)
2. Click this button: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-dpr-system)
3. Follow the Vercel setup wizard

### Option B: Manual Deploy

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your `ai-dpr-system` repository
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `ai-dpr-system` (or your preferred name)
   - **Framework Preset**: `Other` (Vercel will auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-fill)
   - **Output Directory**: `public` (should auto-fill)
   - **Install Command**: `npm install` (should auto-fill)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add these variables:

   ```
   NODE_ENV = production
   JWT_SECRET = your_secure_jwt_secret_here
   SUPABASE_URL = your_supabase_url (optional)
   SUPABASE_ANON_KEY = your_supabase_anon_key (optional)
   SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_key (optional)
   ```

   > **Note**: The app will work with mock data even without Supabase credentials

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-3 minutes)
   - Your app will be available at `https://your-project-name.vercel.app`

## 🔧 Step 4: Configure Environment Variables

### Required Variables:
- `JWT_SECRET`: A secure random string for JWT tokens
  ```
  JWT_SECRET=your_super_secure_random_string_here_123456789
  ```

### Optional Variables (for Supabase):
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### How to Add in Vercel:
1. Go to your project dashboard on Vercel
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add each variable with its value
5. Redeploy the project

## 🔄 Step 5: Set Up Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main
```

Your site will automatically redeploy in 1-2 minutes!

## 📊 Step 6: Test Your Deployment

### Check These URLs:
- **Main App**: `https://your-app-name.vercel.app`
- **Health Check**: `https://your-app-name.vercel.app/health`
- **API Status**: `https://your-app-name.vercel.app/api/health`

### Expected Responses:
- Main app should show the dashboard interface
- Health endpoints should return JSON with status "OK"

## ⚡ Step 7: Performance Optimization

### In Vercel Dashboard:
1. **Analytics**: Enable to monitor performance
2. **Speed Insights**: Track Core Web Vitals
3. **Custom Domain**: Add your own domain (optional)
4. **Edge Functions**: Available if needed for advanced features

## 🛠️ Troubleshooting

### Common Issues:

**Build Fails:**
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

**API Not Working:**
- Check `/api/health` endpoint
- Verify environment variables
- Check function logs in Vercel dashboard

**Frontend Not Loading:**
- Ensure `public/index.html` exists
- Check routing configuration in `vercel.json`
- Verify static files are in `/public` directory

### Getting Help:
- Check Vercel deployment logs
- Review GitHub Actions (if using)
- Test locally with `npm start`

## 🎉 Success!

Your AI DPR System should now be:
- ✅ Hosted on GitHub
- ✅ Deployed on Vercel  
- ✅ Automatically updating on code changes
- ✅ Accessible via HTTPS
- ✅ Ready for production use

### Your URLs:
- **GitHub**: `https://github.com/YOUR_USERNAME/ai-dpr-system`
- **Live App**: `https://your-app-name.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

## 📝 Next Steps

1. **Customize** the app for your specific needs
2. **Add features** and push to GitHub for automatic deployment
3. **Set up monitoring** in Vercel dashboard
4. **Configure custom domain** if desired
5. **Add team members** in Vercel project settings

---

**🎊 Congratulations! Your AI DPR System is now live!**