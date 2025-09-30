# AI DPR System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-dpr-system)

A comprehensive AI-powered Detailed Project Report (DPR) system for project management, risk analysis, and reporting.

## 🚧 Live Demo

- **Frontend**: [https://your-app-name.vercel.app](https://your-app-name.vercel.app)
- **API**: [https://your-app-name.vercel.app/api](https://your-app-name.vercel.app/api)

## 🚀 Features

- **AI-Powered Risk Analysis** - Advanced algorithms analyze project data to predict potential risks
- **Automated Report Generation** - Generate detailed project reports with AI insights
- **Real-time Dashboard** - Interactive dashboard with live metrics and analytics
- **Issue Detection** - Automatically detect budget mismatches, schedule issues, and resource allocation problems
- **Smart Notifications** - Get alerted about critical issues and project milestones
- **Modern Web Interface** - Responsive design with dark/light mode support

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **JWT** - Token-based authentication

### Frontend
- **React** - Frontend framework
- **Modern CSS** - Responsive design
- **Chart.js** - Data visualization

### Deployment
- **Vercel** - Serverless deployment platform

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-dpr-system.git
cd ai-dpr-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📦 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-dpr-system)

### Option 2: Manual Deploy

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables** in Vercel Dashboard:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```

4. **Deploy**: Vercel will automatically build and deploy your app

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `SUPABASE_URL` | Supabase project URL | Yes (for production) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (for production) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes (for production) |
| `JWT_SECRET` | JWT signing secret | Yes |

## 📱 API Documentation

### Health Check
```
GET /health
GET /api/health
```

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/profile
```

### Reports
```
GET /api/reports
POST /api/reports
GET /api/reports/:id
PUT /api/reports/:id
DELETE /api/reports/:id
```

### Analytics
```
GET /api/analytics/dashboard
GET /api/analytics/trends
GET /api/analytics/performance
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ by the AI DPR Team**