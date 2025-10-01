#!/bin/bash

# AI DPR System Start Script
# This script starts the production server

echo "🚀 Starting AI DPR System..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "📝 Please edit .env file with your configuration before starting the server."
        exit 1
    else
        echo "❌ env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if React build exists
if [ ! -d "react-frontend/dist" ]; then
    echo "⚠️  React frontend not built. Building now..."
    ./scripts/build.sh
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please check the build script."
        exit 1
    fi
fi

# Create necessary directories
mkdir -p uploads
mkdir -p logs

# Set proper permissions
chmod 755 uploads
chmod 755 logs

# Start the server
echo "🌐 Starting server..."
NODE_ENV=production npm start

