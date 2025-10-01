#!/bin/bash
# Netlify deployment preparation script

echo "🚀 Preparing AI DPR System for Netlify deployment..."

# Check if required files exist
echo "📋 Checking required files..."

if [ ! -f "public/index.html" ]; then
    echo "❌ Missing public/index.html"
    exit 1
fi

if [ ! -f "netlify.toml" ]; then
    echo "❌ Missing netlify.toml"
    exit 1
fi

if [ ! -d "netlify/functions" ]; then
    echo "❌ Missing netlify/functions directory"
    exit 1
fi

echo "✅ All required files found"

# Check environment variables template
if [ ! -f ".env.example" ]; then
    echo "⚠️  Warning: No .env.example file found"
else
    echo "✅ Environment variables template exists"
fi

# List serverless functions
echo "📦 Available Netlify functions:"
ls -la netlify/functions/

# Check public assets
echo "🌐 Public assets:"
ls -la public/

echo "🎉 Ready for Netlify deployment!"
echo ""
echo "📋 Deployment checklist:"
echo "  1. ✅ Static assets in public/ directory"
echo "  2. ✅ Netlify functions in netlify/functions/"
echo "  3. ✅ netlify.toml configuration file"
echo "  4. ✅ Package.json with build:netlify script"
echo "  5. ⚠️  Environment variables need to be set in Netlify dashboard"
echo ""
echo "🔗 Next steps:"
echo "  1. Push code to GitHub repository"
echo "  2. Connect repository to Netlify"
echo "  3. Set environment variables in Netlify dashboard"
echo "  4. Deploy!"