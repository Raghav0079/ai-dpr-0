#!/bin/bash

# AI DPR System Build Script
# This script builds the React frontend and prepares for deployment

echo "🚀 Building AI DPR System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies for main server
echo "📦 Installing server dependencies..."
npm install

# Install dependencies for React frontend
echo "📦 Installing React frontend dependencies..."
cd react-frontend
npm install

# Build React frontend
echo "🔨 Building React frontend..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ React frontend built successfully!"
    cd ..
else
    echo "❌ React frontend build failed!"
    cd ..
    exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads
mkdir -p logs

# Set proper permissions
chmod 755 uploads
chmod 755 logs

echo "✅ Build completed successfully!"
echo "📁 React build files are in: react-frontend/dist"
echo "🚀 You can now start the server with: npm start"
