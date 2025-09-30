#!/bin/bash

# AI DPR System Deployment Script
# This script handles the complete deployment of the AI DPR system

set -e  # Exit on any error

echo "🚀 Starting AI DPR System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found! Please create it from .env.example"
    exit 1
fi

print_success ".env file found"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed successfully"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Check if React frontend exists and install dependencies
if [ -d "react-frontend" ] && [ -f "react-frontend/package.json" ]; then
    print_status "Installing React frontend dependencies..."
    cd react-frontend
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "React dependencies installed successfully"
        
        # Build React frontend
        print_status "Building React frontend..."
        npm run build
        
        if [ $? -eq 0 ]; then
            print_success "React frontend built successfully"
        else
            print_error "Failed to build React frontend"
            exit 1
        fi
    else
        print_error "Failed to install React dependencies"
        exit 1
    fi
    cd ..
else
    print_warning "React frontend not found, skipping frontend build"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs

# Test Supabase connection
print_status "Testing Supabase connection..."
node -e "
const supabaseService = require('./config/supabase');
supabaseService.testConnection().then(result => {
    if (result.success) {
        console.log('✅ Supabase connection successful');
        process.exit(0);
    } else {
        console.error('❌ Supabase connection failed:', result.error);
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Supabase test error:', error.message);
    process.exit(1);
});
"

if [ $? -eq 0 ]; then
    print_success "Supabase connection test passed"
else
    print_error "Supabase connection test failed"
    exit 1
fi

# Start the application
print_status "Starting the application..."
print_success "🎉 Deployment completed successfully!"
print_status "Starting AI DPR System on port ${PORT:-3000}..."

# Start the server
npm start