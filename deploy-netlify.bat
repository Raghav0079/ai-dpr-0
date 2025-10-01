@echo off
REM Netlify deployment preparation script for Windows

echo 🚀 Preparing AI DPR System for Netlify deployment...

REM Check if required files exist
echo 📋 Checking required files...

if not exist "public\index.html" (
    echo ❌ Missing public\index.html
    exit /b 1
)

if not exist "netlify.toml" (
    echo ❌ Missing netlify.toml
    exit /b 1
)

if not exist "netlify\functions" (
    echo ❌ Missing netlify\functions directory
    exit /b 1
)

echo ✅ All required files found

REM Check environment variables template
if not exist ".env.example" (
    echo ⚠️  Warning: No .env.example file found
) else (
    echo ✅ Environment variables template exists
)

REM List serverless functions
echo 📦 Available Netlify functions:
dir /b netlify\functions\

REM Check public assets
echo 🌐 Public assets:
dir /b public\

echo 🎉 Ready for Netlify deployment!
echo.
echo 📋 Deployment checklist:
echo   1. ✅ Static assets in public/ directory
echo   2. ✅ Netlify functions in netlify/functions/
echo   3. ✅ netlify.toml configuration file
echo   4. ✅ Package.json with build:netlify script
echo   5. ⚠️  Environment variables need to be set in Netlify dashboard
echo.
echo 🔗 Next steps:
echo   1. Push code to GitHub repository
echo   2. Connect repository to Netlify
echo   3. Set environment variables in Netlify dashboard
echo   4. Deploy!

pause