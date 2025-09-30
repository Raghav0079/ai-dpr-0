@echo off
REM AI DPR System Development Script for Windows
REM This script starts both the backend server and React development server

echo 🚀 Starting AI DPR System in Development Mode...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from example...
    if exist env.example (
        copy env.example .env
        echo 📝 Please edit .env file with your configuration.
    )
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing server dependencies...
    npm install
)

if not exist react-frontend\node_modules (
    echo 📦 Installing React frontend dependencies...
    cd react-frontend
    npm install
    cd ..
)

REM Create necessary directories
if not exist uploads mkdir uploads
if not exist logs mkdir logs

echo 🔧 Starting backend server...
start "Backend Server" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo ⚛️  Starting React development server...
cd react-frontend
start "React Dev Server" cmd /k "npm run dev"
cd ..

echo ✅ Development servers started!
echo 🌐 Backend API: http://localhost:3000
echo ⚛️  React Frontend: http://localhost:5173
echo 📊 Dashboard: http://localhost:5173
echo.
echo Close the command windows to stop the servers
pause
