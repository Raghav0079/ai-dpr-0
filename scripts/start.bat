@echo off
REM AI DPR System Start Script for Windows
REM This script starts the production server

echo 🚀 Starting AI DPR System...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from example...
    if exist env.example (
        copy env.example .env
        echo 📝 Please edit .env file with your configuration before starting the server.
        exit /b 1
    ) else (
        echo ❌ env.example file not found. Please create .env file manually.
        exit /b 1
    )
)

REM Check if React build exists
if not exist react-frontend\dist (
    echo ⚠️  React frontend not built. Building now...
    call scripts\build.bat
    if %errorlevel% neq 0 (
        echo ❌ Build failed. Please check the build script.
        exit /b 1
    )
)

REM Create necessary directories
if not exist uploads mkdir uploads
if not exist logs mkdir logs

REM Start the server
echo 🌐 Starting server...
set NODE_ENV=production
npm start

