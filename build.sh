#!/bin/bash

# Vercel build script
echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install frontend dependencies if they exist
if [ -d "react-frontend" ]; then
    echo "📦 Installing frontend dependencies..."
    cd react-frontend
    npm install
    cd ..
fi

# Build frontend if it exists
if [ -d "react-frontend" ]; then
    echo "🏗️ Building frontend..."
    npm run build:frontend
fi

# Create public directory if it doesn't exist
mkdir -p public

# Copy static files
echo "📁 Copying static files..."
if [ -f "index.html" ]; then
    cp index.html public/
fi

echo "✅ Build completed successfully!"