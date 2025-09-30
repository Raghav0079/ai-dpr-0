# AI DPR System

A comprehensive AI-powered Detailed Project Report system for intelligent project risk analysis and automated reporting.

## 🚀 Features

### Core Functionality
- **AI-Powered Risk Analysis** - Advanced algorithms analyze project data to predict potential risks
- **Automated Report Generation** - Generate detailed project reports with AI insights
- **Real-time Dashboard** - Interactive dashboard with live metrics and analytics
- **Issue Detection** - Automatically detect budget mismatches, schedule issues, and resource allocation problems
- **Smart Notifications** - Get alerted about critical issues and project milestones

### Technical Features
- **Modern Web Interface** - Responsive design with dark/light mode support
- **RESTful API** - Full backend API for all system operations
- **Real-time Updates** - Live data synchronization across the interface
- **Data Export** - Export reports in JSON/CSV formats
- **Search & Filtering** - Advanced search and filtering capabilities
- **User Authentication** - Secure user management and access control

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3** - Modern semantic markup and styling
- **JavaScript (ES6+)** - Vanilla JavaScript with modern features
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and data visualization

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite** - Lightweight database for data storage
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and security

### Development Tools
- **Nodemon** - Development server with auto-restart
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting and protection

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-dpr-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Setup

1. **Install dependencies**
   ```bash
   npm install --production
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
DATABASE_PATH=./database.db
```

### Database Setup
The system automatically creates and initializes the SQLite database on first run. No manual setup required.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Reports Endpoints
- `GET /api/reports` - Get all reports (with pagination and filtering)
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id/status` - Update report status

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard analytics data

### AI Analysis Endpoints
- `POST /api/ai/analyze` - Perform AI analysis on project data

## 🎯 Usage Guide

### Dashboard
- View key metrics and trends
- Monitor recent activity
- Access quick actions and reports

### Reports Management
- Create new analysis reports
- Search and filter existing reports
- Update report statuses
- Export reports in various formats

### AI Analysis
- Submit project data for AI analysis
- Get intelligent insights and recommendations
- Save analysis results as reports
- Export analysis data

### Navigation
- Use the top navigation to switch between sections
- Global search functionality (Ctrl/Cmd + K)
- Quick actions available throughout the interface

## 🔐 Security Features

- **Authentication** - JWT-based user authentication
- **Password Hashing** - bcrypt password encryption
- **Rate Limiting** - API endpoint protection
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side input validation
- **Security Headers** - Helmet.js security middleware

## 📊 Data Models

### Reports
- Report ID (unique identifier)
- Project information
- Issue type and severity
- AI analysis results
- Status tracking
- Timestamps

### Users
- User credentials and profiles
- Role-based access control
- Authentication tokens

### Analytics
- Dashboard metrics
- Trend analysis data
- Performance indicators

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm run build
npm start
```

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

Run the development server and test the following:

1. **Dashboard Functionality**
   - Metrics display correctly
   - Charts render properly
   - Real-time updates work

2. **Reports System**
   - Create, read, update operations
   - Search and filtering
   - Status management

3. **AI Analysis**
   - Form submission
   - Results display
   - Save and export features

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in package.json or environment
   PORT=3001 npm start
   ```

2. **Database Connection Issues**
   ```bash
   # Check database file permissions
   chmod 644 database.db
   ```

3. **Dependencies Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📈 Performance Optimization

- **Lazy Loading** - Components load on demand
- **Data Pagination** - Large datasets are paginated
- **Caching** - Static assets and API responses cached
- **Compression** - Gzip compression enabled
- **Database Indexing** - Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🎉 Acknowledgments

- Built with modern web technologies
- Inspired by best practices in project management
- Designed for scalability and maintainability

---

**AI DPR System** - Intelligent Project Risk Analysis Made Simple