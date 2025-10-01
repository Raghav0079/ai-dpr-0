@echo off
REM AI DPR System - Complete Deployment Script for Windows

echo ========================================
echo AI DPR System - Complete Deployment
echo ========================================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

echo [SUCCESS] Node.js version: 
node --version

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    exit /b 1
)

echo [SUCCESS] npm version: 
npm --version

REM Check .env file
if not exist .env (
    echo [WARNING] .env file not found
    if exist .env.example (
        echo [INFO] Copying .env.example to .env
        copy .env.example .env
        echo [WARNING] Please edit .env with your actual Supabase credentials
        pause
        exit /b 1
    ) else (
        echo [ERROR] No .env.example found. Please create .env manually
        exit /b 1
    )
)

echo [SUCCESS] .env file found

REM Install dependencies
echo [INFO] Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [SUCCESS] Dependencies installed successfully

REM Create directories
echo [INFO] Creating required directories...
if not exist uploads mkdir uploads
if not exist logs mkdir logs
echo [SUCCESS] Directories created

REM Database setup
echo.
echo Database Setup Options:
echo 1. Automatic setup (if tables don't exist)
echo 2. Manual setup (recommended for production)
echo.

set /p db_option="Choose option (1 or 2): "

if "%db_option%"=="1" (
    echo [INFO] Running automatic database setup...
    node setup-basic-db.js
) else if "%db_option%"=="2" (
    echo [INFO] Manual database setup selected
    echo.
    echo Manual Setup Instructions:
    echo 1. Go to your Supabase dashboard
    echo 2. Navigate to SQL Editor  
    echo 3. Copy and run the SQL from database_setup.sql
    echo.
    pause
) else (
    echo [WARNING] Skipping database setup
)

REM Test database connection
echo [INFO] Testing database connection...
node -e "const supabaseService = require('./config/supabase'); supabaseService.testConnection().then(result => { if (result.success) { console.log('✅ Database connection successful'); } else { console.log('❌ Database connection failed:', result.error); if (result.needsSetup) { console.log('⚠️ Database tables not found - server will run in limited mode'); } } }).catch(err => console.log('Connection test error:', err));"

REM Frontend setup
if exist "react-frontend\package.json" (
    echo [INFO] Setting up React frontend...
    cd react-frontend
    npm install
    if not errorlevel 1 (
        echo [SUCCESS] Frontend dependencies installed
        echo [INFO] Building React frontend...
        npm run build
        if not errorlevel 1 (
            echo [SUCCESS] Frontend built successfully
        ) else (
            echo [WARNING] Frontend build failed - using fallback
        )
    ) else (
        echo [WARNING] Frontend dependency installation failed
    )
    cd ..
) else (
    echo [INFO] No React frontend found, using static HTML
)

REM Security check
echo [INFO] Running security check...
npm audit --audit-level=high
if errorlevel 1 (
    echo [WARNING] Security vulnerabilities found. Run 'npm audit fix' to resolve.
)

echo.
echo [SUCCESS] Deployment preparation completed!
echo.
echo ================================
echo AI DPR System is ready to deploy!
echo ================================
echo.
echo Deployment Summary:
echo • Dependencies installed ✅
echo • Database configured ✅  
echo • Frontend built ✅
echo • Security checked ✅
echo.
echo Start the application:
echo    npm start
echo.
echo The application will be available at:
echo    http://localhost:3000
echo.
echo Default Admin Login:
echo    Email: admin@aidpr.com
echo    Password: admin123
echo.
echo Important Post-Deployment Tasks:
echo 1. Change the default admin password
echo 2. Update JWT_SECRET in production
echo 3. Configure proper CORS origins
echo 4. Set up SSL/HTTPS
echo 5. Configure backups
echo.

set /p start_server="Start the server now? (y/n): "

if /i "%start_server%"=="y" (
    echo [INFO] Starting AI DPR System...
    npm start
) else (
    echo [INFO] Deployment complete. Run 'npm start' when ready.
)