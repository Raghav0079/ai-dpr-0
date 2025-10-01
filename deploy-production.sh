#!/bin/bash

# AI DPR System - Production Deployment Script
# This script handles complete production deployment

set -e

echo "🚀 AI DPR System - Production Deployment"
echo "========================================"

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

# Configuration
DEPLOYMENT_TYPE=${1:-"docker"}
ENVIRONMENT=${2:-"production"}

print_info "Deployment type: $DEPLOYMENT_TYPE"
print_info "Environment: $ENVIRONMENT"

# Check prerequisites
check_prerequisites() {
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
    
    # Check deployment type specific requirements
    if [ "$DEPLOYMENT_TYPE" = "docker" ]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose is not installed"
            exit 1
        fi
        
        print_success "Docker version: $(docker --version)"
        print_success "Docker Compose version: $(docker-compose --version)"
    fi
    
    if [ "$DEPLOYMENT_TYPE" = "pm2" ]; then
        if ! command -v pm2 &> /dev/null; then
            print_warning "PM2 is not installed. Installing..."
            npm install -g pm2
        fi
        
        print_success "PM2 version: $(pm2 --version)"
    fi
}

# Setup environment
setup_environment() {
    print_info "Setting up environment..."
    
    # Check for environment file
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        if [ -f ".env.$ENVIRONMENT.example" ]; then
            print_warning "Environment file not found. Copying from example..."
            cp ".env.$ENVIRONMENT.example" ".env.$ENVIRONMENT"
            print_warning "Please configure .env.$ENVIRONMENT with your settings"
            read -p "Press Enter to continue after configuring environment file..."
        else
            print_error "Environment file .env.$ENVIRONMENT not found"
            exit 1
        fi
    fi
    
    # Create necessary directories
    mkdir -p uploads logs backups
    
    print_success "Environment setup complete"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install Node.js dependencies
    npm ci --only=production
    
    # Build frontend if exists
    if [ -d "react-frontend" ]; then
        print_info "Building React frontend..."
        cd react-frontend
        npm ci
        npm run build
        cd ..
        
        # Copy build files to public directory
        if [ -d "react-frontend/dist" ]; then
            cp -r react-frontend/dist/* public/
        elif [ -d "react-frontend/build" ]; then
            cp -r react-frontend/build/* public/
        fi
    fi
    
    print_success "Dependencies installed"
}

# Docker deployment
deploy_docker() {
    print_info "Deploying with Docker..."
    
    # Build and start containers
    if [ "$ENVIRONMENT" = "development" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
    else
        docker-compose up -d --build
    fi
    
    # Wait for services to be ready
    print_info "Waiting for services to start..."
    sleep 30
    
    # Check health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Application is healthy"
    else
        print_error "Application health check failed"
        docker-compose logs ai-dpr-app
        exit 1
    fi
    
    print_success "Docker deployment complete"
}

# PM2 deployment
deploy_pm2() {
    print_info "Deploying with PM2..."
    
    # Set environment
    export NODE_ENV=$ENVIRONMENT
    
    # Start with PM2
    pm2 start ecosystem.config.js --env $ENVIRONMENT
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup
    
    print_success "PM2 deployment complete"
}

# Native deployment
deploy_native() {
    print_info "Deploying natively..."
    
    # Set environment
    export NODE_ENV=$ENVIRONMENT
    
    # Start application
    if command -v systemctl &> /dev/null; then
        # Create systemd service
        create_systemd_service
        systemctl enable ai-dpr-system
        systemctl start ai-dpr-system
    else
        # Start directly
        npm start &
        echo $! > ai-dpr.pid
    fi
    
    print_success "Native deployment complete"
}

# Create systemd service
create_systemd_service() {
    print_info "Creating systemd service..."
    
    sudo tee /etc/systemd/system/ai-dpr-system.service > /dev/null <<EOF
[Unit]
Description=AI DPR System
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)
Environment=NODE_ENV=$ENVIRONMENT
ExecStart=$(which node) src/app.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    print_success "Systemd service created"
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    if [ -f "scripts/setup-database.js" ]; then
        node scripts/setup-database.js
    else
        print_warning "Database setup script not found"
    fi
    
    print_success "Database setup complete"
}

# Main deployment function
main() {
    print_info "Starting deployment process..."
    
    check_prerequisites
    setup_environment
    install_dependencies
    
    # Optional database setup
    read -p "Do you want to setup the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_database
    fi
    
    # Deploy based on type
    case $DEPLOYMENT_TYPE in
        "docker")
            deploy_docker
            ;;
        "pm2")
            deploy_pm2
            ;;
        "native")
            deploy_native
            ;;
        *)
            print_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            print_info "Available types: docker, pm2, native"
            exit 1
            ;;
    esac
    
    print_success "🎉 Deployment completed successfully!"
    print_info "Application is running on http://localhost:3000"
    print_info "Health check: http://localhost:3000/api/health"
    
    # Show deployment info
    echo
    echo "📊 Deployment Information:"
    echo "========================="
    echo "Type: $DEPLOYMENT_TYPE"
    echo "Environment: $ENVIRONMENT"
    echo "Node.js: $(node --version)"
    echo "NPM: $(npm --version)"
    echo "Directory: $(pwd)"
    echo "PID File: ai-dpr.pid (if native deployment)"
    echo
    echo "🔧 Management Commands:"
    echo "======================"
    
    case $DEPLOYMENT_TYPE in
        "docker")
            echo "View logs: docker-compose logs -f"
            echo "Stop: docker-compose down"
            echo "Restart: docker-compose restart"
            ;;
        "pm2")
            echo "View logs: pm2 logs ai-dpr-system"
            echo "Stop: pm2 stop ai-dpr-system"
            echo "Restart: pm2 restart ai-dpr-system"
            echo "Monitor: pm2 monit"
            ;;
        "native")
            if command -v systemctl &> /dev/null; then
                echo "View logs: journalctl -u ai-dpr-system -f"
                echo "Stop: systemctl stop ai-dpr-system"
                echo "Restart: systemctl restart ai-dpr-system"
                echo "Status: systemctl status ai-dpr-system"
            else
                echo "Stop: kill \$(cat ai-dpr.pid)"
                echo "View logs: tail -f logs/app.log"
            fi
            ;;
    esac
}

# Handle script arguments
case "${1:-help}" in
    "help"|"-h"|"--help")
        echo "AI DPR System Deployment Script"
        echo "Usage: $0 [deployment_type] [environment]"
        echo
        echo "Deployment Types:"
        echo "  docker    - Deploy using Docker containers (recommended)"
        echo "  pm2       - Deploy using PM2 process manager"
        echo "  native    - Deploy natively with systemd or direct process"
        echo
        echo "Environments:"
        echo "  production   - Production environment"
        echo "  staging      - Staging environment"
        echo "  development  - Development environment"
        echo
        echo "Examples:"
        echo "  $0 docker production"
        echo "  $0 pm2 staging"
        echo "  $0 native development"
        exit 0
        ;;
    *)
        main
        ;;
esac