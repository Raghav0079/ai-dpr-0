# AI DPR System - Deployment Guide

A comprehensive AI-powered Detailed Project Report (DPR) system for project management, risk analysis, and reporting.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account and database
- Git (for cloning)

### One-Command Deployment

**Windows:**
```cmd
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Manual Setup

### 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=your_postgres_connection_string
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Frontend (if React frontend exists)

```bash
cd react-frontend
npm install
npm run build
cd ..
```

### 4. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t ai-dpr-system .

# Run the container
docker run -p 3000:3000 --env-file .env ai-dpr-system
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### Heroku

1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_ANON_KEY=your_key
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_key
   heroku config:set JWT_SECRET=your_jwt_secret
   ```
5. Deploy: `git push heroku main`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Set environment variables in Vercel dashboard

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

## 🗄️ Database Setup

### Supabase Tables

The application requires the following tables in your Supabase database:

1. **users** - User authentication and profiles
2. **reports** - DPR reports and data
3. **projects** - Project information
4. **files** - File upload metadata

### Database Migration

The application will automatically create sample data on first run if tables are empty.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `MAX_FILE_SIZE_MB` | Max upload size in MB (default: 10) | No |

### Security Configuration

- JWT tokens expire in 24 hours
- Rate limiting: 100 requests per 15 minutes per IP
- CORS enabled for local development
- Helmet security headers enabled
- File upload restrictions in place

## 🔍 Health Checks

The application includes health check endpoints:

- `GET /api/health` - Basic health check
- Returns database connection status
- Used by Docker health checks

## 📊 Monitoring

### Application Logs

Logs are written to:
- Console (development)
- `./logs/` directory (production)

### Performance Monitoring

Monitor these endpoints for performance:
- `/api/health` - Health status
- `/api/reports` - Report queries
- `/api/users` - User operations

## 🛠️ Maintenance

### Database Backup

```bash
# Backup Supabase database
supabase db dump > backup.sql

# Restore backup
supabase db reset --file backup.sql
```

### Log Rotation

Set up log rotation for production:
```bash
# Add to crontab
0 0 * * * /usr/sbin/logrotate /path/to/logrotate.conf
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate keys regularly

2. **Database Security**
   - Use RLS (Row Level Security) in Supabase
   - Regularly review access permissions
   - Monitor database logs

3. **Application Security**
   - Keep dependencies updated
   - Run security audits: `npm audit`
   - Use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase credentials
   - Verify network connectivity
   - Check IP allowlist in Supabase

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process: `pkill -f "node server.js"`

3. **Build Failures**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

### Debug Mode

Run with debug logging:
```bash
DEBUG=* npm start
```

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review application logs
3. Check Supabase dashboard
4. Create an issue in the repository

## 🚀 Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Health checks working
- [ ] Logs configured
- [ ] Backups scheduled
- [ ] Monitoring set up
- [ ] Security headers enabled
- [ ] Rate limiting configured

## 📈 Scaling

For high-traffic deployments:

1. **Horizontal Scaling**
   - Use load balancer
   - Deploy multiple instances
   - Session stickiness not required

2. **Database Scaling**
   - Use Supabase connection pooling
   - Implement read replicas
   - Optimize queries

3. **Caching**
   - Implement Redis for sessions
   - Cache frequent queries
   - Use CDN for static files

## 🔄 Updates

To update the application:

1. Pull latest changes
2. Run `npm install`
3. Rebuild frontend if needed
4. Restart application
5. Check health endpoints

---

**Happy Deploying! 🎉**