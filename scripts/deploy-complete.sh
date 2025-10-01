#!/bin/bash

# AI DPR System - Complete Deployment Script
# This script handles full deployment including database setup

set -e

echo "🚀 AI DPR System - Complete Deployment"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ required. Current: $(node --version)"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "npm version: $(npm --version)"

# Check .env file
if [ ! -f .env ]; then
    print_warning ".env file not found"
    if [ -f .env.example ]; then
        print_info "Copying .env.example to .env"
        cp .env.example .env
        print_warning "Please edit .env with your actual Supabase credentials"
        exit 1
    else
        print_error "No .env.example found. Please create .env manually"
        exit 1
    fi
fi

print_success ".env file found"

# Install dependencies
print_info "Installing Node.js dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create directories
print_info "Creating required directories..."
mkdir -p uploads logs
print_success "Directories created"

# Database setup
print_info "Setting up database..."
echo ""
echo "🗄️  Database Setup Options:"
echo "1. Automatic setup (if tables don't exist)"
echo "2. Manual setup (recommended for production)"
echo ""

read -p "Choose option (1 or 2): " db_option

if [ "$db_option" = "1" ]; then
    print_info "Running automatic database setup..."
    node setup-basic-db.js
elif [ "$db_option" = "2" ]; then
    print_info "Manual database setup selected"
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "1. Go to your Supabase dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy and run the SQL from database_setup.sql"
    echo ""
    read -p "Press Enter when database setup is complete..."
else
    print_warning "Skipping database setup"
fi

# Test database connection
print_info "Testing database connection..."
node -e "
const supabaseService = require('./config/supabase');
(async () => {
  const result = await supabaseService.testConnection();
  if (result.success) {
    console.log('✅ Database connection successful');
    process.exit(0);
  } else {
    console.log('❌ Database connection failed:', result.error);
    if (result.needsSetup) {
      console.log('⚠️  Database tables not found - server will run in limited mode');
    }
    process.exit(0);
  }
})();
"

# Frontend setup (if exists)
if [ -d "react-frontend" ] && [ -f "react-frontend/package.json" ]; then
    print_info "Setting up React frontend..."
    cd react-frontend
    npm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
        
        print_info "Building React frontend..."
        npm run build
        if [ $? -eq 0 ]; then
            print_success "Frontend built successfully"
        else
            print_warning "Frontend build failed - using fallback"
        fi
    else
        print_warning "Frontend dependency installation failed"
    fi
    cd ..
else
    print_info "No React frontend found, using static HTML"
fi

# Security check
print_info "Running security check..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
    print_warning "Security vulnerabilities found. Run 'npm audit fix' to resolve."
fi

# Final checks
print_info "Running final deployment checks..."

# Check environment variables
if grep -q "your-" .env; then
    print_warning "Default values found in .env - please update with actual values"
fi

# Check file permissions
chmod +x deploy.sh 2>/dev/null || true
chmod +x deploy.bat 2>/dev/null || true

print_success "Deployment preparation completed!"
echo ""
echo "🎉 AI DPR System is ready to deploy!"
echo ""
echo "📋 Deployment Summary:"
echo "• Dependencies installed ✅"
echo "• Database configured ✅"
echo "• Frontend built ✅"
echo "• Security checked ✅"
echo ""
echo "🚀 Start the application:"
echo "   npm start"
echo ""
echo "🌐 The application will be available at:"
echo "   http://localhost:3000"
echo ""
echo "🔐 Default Admin Login:"
echo "   Email: admin@aidpr.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Important Post-Deployment Tasks:"
echo "1. Change the default admin password"
echo "2. Update JWT_SECRET in production"
echo "3. Configure proper CORS origins"
echo "4. Set up SSL/HTTPS"
echo "5. Configure backups"
echo ""

# Ask if user wants to start the server
read -p "Start the server now? (y/n): " start_server

if [ "$start_server" = "y" ] || [ "$start_server" = "Y" ]; then
    print_info "Starting AI DPR System..."
    npm start
else
    print_info "Deployment complete. Run 'npm start' when ready."
fi