@echo off
REM AI DPR System - Windows Production Deployment Script

setlocal enabledelayedexpansion

echo 🚀 AI DPR System - Windows Production Deployment
echo ================================================

set DEPLOYMENT_TYPE=%1
set ENVIRONMENT=%2

if "%DEPLOYMENT_TYPE%"=="" set DEPLOYMENT_TYPE=docker
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo [INFO] Deployment type: %DEPLOYMENT_TYPE%
echo [INFO] Environment: %ENVIRONMENT%

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js version: %NODE_VERSION%

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    exit /b 1
)

for /f %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm version: %NPM_VERSION%

REM Check deployment type specific requirements
if "%DEPLOYMENT_TYPE%"=="docker" (
    docker --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker is not installed
        exit /b 1
    )
    
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not installed
        exit /b 1
    )
    
    for /f "tokens=3" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo [SUCCESS] Docker version: %DOCKER_VERSION%
)

if "%DEPLOYMENT_TYPE%"=="pm2" (
    pm2 --version >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] PM2 is not installed. Installing...
        npm install -g pm2
    )
    
    for /f %%i in ('pm2 --version') do set PM2_VERSION=%%i
    echo [SUCCESS] PM2 version: %PM2_VERSION%
)

REM Setup environment
echo [INFO] Setting up environment...

if not exist ".env.%ENVIRONMENT%" (
    if exist ".env.%ENVIRONMENT%.example" (
        echo [WARNING] Environment file not found. Copying from example...
        copy ".env.%ENVIRONMENT%.example" ".env.%ENVIRONMENT%"
        echo [WARNING] Please configure .env.%ENVIRONMENT% with your settings
        pause
    ) else (
        echo [ERROR] Environment file .env.%ENVIRONMENT% not found
        exit /b 1
    )
)

REM Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups

echo [SUCCESS] Environment setup complete

REM Install dependencies
echo [INFO] Installing dependencies...

npm ci --only=production
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    exit /b 1
)

REM Build frontend if exists
if exist "react-frontend" (
    echo [INFO] Building React frontend...
    cd react-frontend
    npm ci
    if errorlevel 1 (
        echo [ERROR] Failed to install React dependencies
        exit /b 1
    )
    
    npm run build
    if errorlevel 1 (
        echo [ERROR] Failed to build React frontend
        exit /b 1
    )
    
    cd ..
    
    REM Copy build files to public directory
    if exist "react-frontend\dist" (
        xcopy /E /Y "react-frontend\dist\*" "public\"
    ) else if exist "react-frontend\build" (
        xcopy /E /Y "react-frontend\build\*" "public\"
    )
)

echo [SUCCESS] Dependencies installed

REM Deploy based on type
if "%DEPLOYMENT_TYPE%"=="docker" goto deploy_docker
if "%DEPLOYMENT_TYPE%"=="pm2" goto deploy_pm2
if "%DEPLOYMENT_TYPE%"=="native" goto deploy_native

echo [ERROR] Unknown deployment type: %DEPLOYMENT_TYPE%
echo [INFO] Available types: docker, pm2, native
exit /b 1

:deploy_docker
echo [INFO] Deploying with Docker...

if "%ENVIRONMENT%"=="development" (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
) else (
    docker-compose up -d --build
)

if errorlevel 1 (
    echo [ERROR] Docker deployment failed
    exit /b 1
)

echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check health
curl -f http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Application health check failed
    docker-compose logs ai-dpr-app
    exit /b 1
)

echo [SUCCESS] Docker deployment complete
goto deployment_complete

:deploy_pm2
echo [INFO] Deploying with PM2...

set NODE_ENV=%ENVIRONMENT%
pm2 start ecosystem.config.js --env %ENVIRONMENT%

if errorlevel 1 (
    echo [ERROR] PM2 deployment failed
    exit /b 1
)

pm2 save
pm2 startup

echo [SUCCESS] PM2 deployment complete
goto deployment_complete

:deploy_native
echo [INFO] Deploying natively...

set NODE_ENV=%ENVIRONMENT%
start /b npm start
echo [SUCCESS] Native deployment complete
goto deployment_complete

:deployment_complete
echo [SUCCESS] 🎉 Deployment completed successfully!
echo [INFO] Application is running on http://localhost:3000
echo [INFO] Health check: http://localhost:3000/api/health

echo.
echo 📊 Deployment Information:
echo =========================
echo Type: %DEPLOYMENT_TYPE%
echo Environment: %ENVIRONMENT%
echo Node.js: %NODE_VERSION%
echo NPM: %NPM_VERSION%
echo Directory: %CD%

echo.
echo 🔧 Management Commands:
echo ======================

if "%DEPLOYMENT_TYPE%"=="docker" (
    echo View logs: docker-compose logs -f
    echo Stop: docker-compose down
    echo Restart: docker-compose restart
) else if "%DEPLOYMENT_TYPE%"=="pm2" (
    echo View logs: pm2 logs ai-dpr-system
    echo Stop: pm2 stop ai-dpr-system
    echo Restart: pm2 restart ai-dpr-system
    echo Monitor: pm2 monit
) else if "%DEPLOYMENT_TYPE%"=="native" (
    echo Stop: Use Task Manager or Ctrl+C in the console
    echo View logs: type logs\app.log
)

echo.
echo Deployment script completed!
pause