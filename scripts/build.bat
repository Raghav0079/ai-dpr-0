@echo off
REM AI DPR System Build Script for Windows
REM This script builds the React frontend and prepares for deployment

echo 🚀 Building AI DPR System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

REM Install dependencies for main server
echo 📦 Installing server dependencies...
npm install

REM Install dependencies for React frontend
echo 📦 Installing React frontend dependencies...
cd react-frontend
npm install

REM Build React frontend
echo 🔨 Building React frontend...
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ React frontend built successfully!
    cd ..
) else (
    echo ❌ React frontend build failed!
    cd ..
    exit /b 1
)

REM Create uploads directory if it doesn't exist
if not exist uploads mkdir uploads
if not exist logs mkdir logs

echo ✅ Build completed successfully!
echo 📁 React build files are in: react-frontend\dist
echo 🚀 You can now start the server with: npm start
