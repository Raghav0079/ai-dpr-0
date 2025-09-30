#!/bin/bash

echo "========================================"
echo "GitHub Repository Setup Script"
echo "========================================"
echo

echo "🔧 Initializing Git repository..."
git init

echo
echo "📁 Adding all files to Git..."
git add .

echo
echo "💾 Creating initial commit..."
git commit -m "Initial commit: AI DPR System ready for deployment"

echo
echo "========================================"
echo "NEXT STEPS:"
echo "========================================"
echo "1. Create a repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: ai-dpr-system"
echo "   - Set to PUBLIC (required for free Vercel)"
echo "   - Don't initialize with README"
echo
echo "2. After creating the repository, run these commands:"
echo "   (Replace YOUR_USERNAME with your GitHub username)"
echo
echo "   git remote add origin https://github.com/YOUR_USERNAME/ai-dpr-system.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo
echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click \"New Project\""
echo "   - Import your GitHub repository"
echo "   - Add environment variables (see .env.vercel file)"
echo "   - Deploy!"
echo
echo "========================================"
echo "🎉 Your project is ready for GitHub!"
echo "========================================"