#!/bin/bash

# AI DPR System Development Script
# This script starts both the backend server and React development server

echo "🚀 Starting AI DPR System in Development Mode..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "📝 Please edit .env file with your configuration."
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

if [ ! -d "react-frontend/node_modules" ]; then
    echo "📦 Installing React frontend dependencies..."
    cd react-frontend
    npm install
    cd ..
fi

# Create necessary directories
mkdir -p uploads
mkdir -p logs

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start React development server
echo "⚛️  Starting React development server..."
cd react-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Development servers started!"
echo "🌐 Backend API: http://localhost:3000"
echo "⚛️  React Frontend: http://localhost:5173"
echo "📊 Dashboard: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

