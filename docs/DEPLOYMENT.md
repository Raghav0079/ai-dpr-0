# AI DPR System - Deployment Guide

This guide will help you deploy the AI DPR System to production.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Supabase account and project
- Domain name (for production)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-dpr-system

# Install dependencies
npm run setup
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**

```env
# Server Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Database Setup

```bash
# Run the Supabase schema
# Copy the contents of database/supabase-schema.sql
# Execute in your Supabase SQL editor
```

### 4. Build and Deploy

```bash
# Build the application
npm run build:prod

# Start the production server
npm start
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY react-frontend/package*.json ./react-frontend/

# Install dependencies
RUN npm ci --only=production
RUN cd react-frontend && npm ci --only=production

# Copy source code
COPY . .

# Build React frontend
RUN cd react-frontend && npm run build

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  ai-dpr:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## ☁️ Cloud Deployment

### Heroku

1. **Prepare for Heroku:**
```bash
# Create Procfile
echo "web: npm start" > Procfile

# Create .gitignore
echo "node_modules/" > .gitignore
echo "uploads/" >> .gitignore
echo ".env" >> .gitignore
```

2. **Deploy to Heroku:**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-ai-dpr-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set SUPABASE_URL=your-supabase-url
heroku config:set SUPABASE_ANON_KEY=your-anon-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Deploy
git push heroku main
```

### Railway

1. **Connect to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### DigitalOcean App Platform

1. **Create app.yaml:**
```yaml
name: ai-dpr-system
services:
- name: api
  source_dir: /
  github:
    repo: your-username/ai-dpr-system
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-jwt-secret
  - key: SUPABASE_URL
    value: your-supabase-url
  - key: SUPABASE_ANON_KEY
    value: your-anon-key
  - key: SUPABASE_SERVICE_ROLE_KEY
    value: your-service-key
```

## 🔧 Production Configuration

### Security Checklist

- [ ] Change default JWT secret
- [ ] Set strong database passwords
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Helmet security headers
- [ ] Set up file upload limits
- [ ] Configure logging

### Performance Optimization

- [ ] Enable compression
- [ ] Set up CDN for static files
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Enable gzip compression
- [ ] Set up monitoring

### Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name ai-dpr

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📊 Health Checks

The application includes health check endpoints:

- `GET /api/health` - Basic health check
- `GET /api/analytics/dashboard` - System analytics

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   - Check Supabase credentials
   - Verify database schema is applied
   - Check network connectivity

2. **Build Failures:**
   - Ensure Node.js 18+ is installed
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

3. **File Upload Issues:**
   - Check uploads directory permissions
   - Verify file size limits
   - Check multer configuration

### Logs

```bash
# View application logs
tail -f logs/app.log

# View PM2 logs
pm2 logs ai-dpr

# View Docker logs
docker logs <container-id>
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Rebuild frontend
npm run build:frontend

# Restart application
pm2 restart ai-dpr
```

### Database Migrations

1. Backup current database
2. Apply new schema changes
3. Test in staging environment
4. Deploy to production

## 📞 Support

For deployment issues:

1. Check the logs first
2. Verify environment configuration
3. Test database connectivity
4. Check server resources

## 🎯 Performance Benchmarks

- **Cold Start:** < 2 seconds
- **API Response:** < 200ms average
- **Frontend Load:** < 1 second
- **File Upload:** 10MB limit
- **Concurrent Users:** 100+ supported

---

**Ready to deploy?** Follow the Quick Start guide above, and you'll have your AI DPR System running in production in minutes!
