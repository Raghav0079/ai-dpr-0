@echo off
REM AI DPR System Deployment Script for Windows
REM This script handles the complete deployment of the AI DPR system

echo Starting AI DPR System Deployment...

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found! Please create it from .env.example
    exit /b 1
)

echo [SUCCESS] .env file found

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    exit /b 1
)

echo [SUCCESS] Node.js version check passed: 
node --version

REM Install Node.js dependencies
echo [INFO] Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    exit /b 1
)

echo [SUCCESS] Node.js dependencies installed successfully

REM Check if React frontend exists and install dependencies
if exist "react-frontend\package.json" (
    echo [INFO] Installing React frontend dependencies...
    cd react-frontend
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install React dependencies
        exit /b 1
    )
    
    echo [SUCCESS] React dependencies installed successfully
    
    REM Build React frontend
    echo [INFO] Building React frontend...
    npm run build
    if errorlevel 1 (
        echo [ERROR] Failed to build React frontend
        exit /b 1
    )
    
    echo [SUCCESS] React frontend built successfully
    cd ..
) else (
    echo [WARNING] React frontend not found, skipping frontend build
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist uploads mkdir uploads
if not exist logs mkdir logs

REM Test Supabase connection
echo [INFO] Testing Supabase connection...
node -e "const supabaseService = require('./config/supabase'); supabaseService.testConnection().then(result => { if (result.success) { console.log('✅ Supabase connection successful'); process.exit(0); } else { console.error('❌ Supabase connection failed:', result.error); process.exit(1); } }).catch(error => { console.error('❌ Supabase test error:', error.message); process.exit(1); });"

if errorlevel 1 (
    echo [ERROR] Supabase connection test failed
    exit /b 1
)

echo [SUCCESS] Supabase connection test passed

REM Start the application
echo [INFO] Starting the application...
echo [SUCCESS] Deployment completed successfully!
echo [INFO] Starting AI DPR System on port %PORT%...

REM Start the server
npm start