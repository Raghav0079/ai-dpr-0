# AI DPR System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-dpr-system)

A comprehensive AI-powered Detailed Project Report (DPR) system for project management, risk analysis, and reporting.

## 🚧 Live Demo

--Dashboard -- https://vocal-narwhal-d34048.netlify.app/

## 🚀 Features

### Core Functionality
- **AI-Powered Risk Analysis** - Advanced algorithms analyze project data to predict potential risks
- **Automated Report Generation** - Generate detailed project reports with AI insights
- **Real-time Dashboard** - Interactive dashboard with live metrics and analytics
- **Issue Detection** - Automatically detect budget mismatches, schedule issues, and resource allocation problems
- **Smart Notifications** - Get alerted about critical issues and project milestones

### Technical Features
- **Modern Web Interface** - Responsive design with dark/light mode support

│   ├── models/                  # Data models- **RESTful API** - Full backend API for all system operations

│   ├── routes/                  # API routes- **Real-time Updates** - Live data synchronization across the interface

│   │   ├── analytics.js        # Analytics endpoints- **Data Export** - Export reports in JSON/CSV formats

│   │   ├── auth.js             # Authentication endpoints- **Search & Filtering** - Advanced search and filtering capabilities

│   │   ├── health.js           # Health check endpoints- **User Authentication** - Secure user management and access control

│   │   ├── reports.js          # Reports CRUD endpoints

│   │   └── uploads.js          # File upload endpoints## 🛠️ Technology Stack

│   ├── services/                # Business logic services

│   │   └── database.js         # Database service### Frontend

│   └── utils/                   # Utility functions- **HTML5/CSS3** - Modern semantic markup and styling

│       └── logger.js           # Logging utility- **JavaScript (ES6+)** - Vanilla JavaScript with modern features

├── public/                      # Static frontend files- **Tailwind CSS** - Utility-first CSS framework

│   ├── css/                    # Stylesheets- **Chart.js** - Interactive charts and data visualization

│   ├── js/                     # Client-side JavaScript

│   └── index.html              # Main HTML file### Backend

├── database/                    # Database related files- **Node.js** - JavaScript runtime environment

│   └── schema.sql              # Database schema- **Express.js** - Web application framework

├── scripts/                     # Utility scripts- **SQLite** - Lightweight database for data storage

│   ├── setup-database.js      # Database setup script- **JWT** - JSON Web Tokens for authentication

│   ├── deploy-complete.bat    # Windows deployment script- **bcryptjs** - Password hashing and security

│   └── deploy-complete.sh     # Linux/Mac deployment script

├── docs/                        # Documentation### Development Tools

├── tests/                       # Test files- **Nodemon** - Development server with auto-restart

├── uploads/                     # File uploads directory- **Helmet** - Security middleware

├── logs/                        # Application logs- **CORS** - Cross-origin resource sharing

├── dist/                        # Built files- **Rate Limiting** - API rate limiting and protection

├── docker-compose.yml          # Docker compose configuration

├── Dockerfile                  # Docker configuration## 📦 Installation

├── .env                        # Environment variables

├── .gitignore                  # Git ignore rules### Prerequisites

└── package.json               # Node.js configuration- Node.js (v14 or higher)

```- npm (Node Package Manager)



## 🚀 Quick Start### Setup Instructions



### Prerequisites1. **Clone the repository**

   ```bash

- Node.js 16+ and npm   git clone <repository-url>

- Supabase account and database   cd ai-dpr-system

- Git (for cloning)   ```



### Installation2. **Install dependencies**

   ```bash

1. **Clone the repository**   npm install

   ```bash   ```

   git clone <repository-url>

   cd ai-dpr-system3. **Start the development server**

   ```   ```bash

   npm run dev

2. **Install dependencies**   ```

   ```bash

   npm install4. **Open your browser**

   ```   Navigate to `http://localhost:3000`



3. **Set up environment variables**### Production Setup

   ```bash

   cp .env.example .env1. **Install dependencies**

   # Edit .env with your actual Supabase credentials   ```bash

   ```   npm install --production

   ```

4. **Set up the database**

   ```bash2. **Start the production server**

   npm run setup:db   ```bash

   ```   npm start

   ```

5. **Start the application**

   ```bash## 🔧 Configuration

   npm start

   ```### Environment Variables

Create a `.env` file in the root directory:

The application will be available at `http://localhost:3000`

```env

## 🛠️ DevelopmentPORT=3000

JWT_SECRET=your-super-secret-jwt-key-change-in-production

### Available ScriptsNODE_ENV=development

DATABASE_PATH=./database.db

- `npm start` - Start the production server```

- `npm run dev` - Start development server with auto-reload

- `npm run setup:db` - Set up database tables### Database Setup

- `npm test` - Run testsThe system automatically creates and initializes the SQLite database on first run. No manual setup required.

- `npm run lint` - Run ESLint

- `npm run build` - Build the application## 📚 API Documentation



### Development Workflow### Authentication Endpoints

- `POST /api/auth/register` - Register new user

1. Start development server: `npm run dev`- `POST /api/auth/login` - User login

2. Make your changes in the `src/` directory

3. The server will automatically restart on file changes### Reports Endpoints

4. Run tests: `npm test`- `GET /api/reports` - Get all reports (with pagination and filtering)

5. Check code quality: `npm run lint`- `GET /api/reports/:id` - Get specific report

- `POST /api/reports` - Create new report

## 📊 Features- `PUT /api/reports/:id/status` - Update report status



- **Dashboard Analytics** - Real-time project metrics and insights### Analytics Endpoints

- **Report Management** - Create, edit, and manage DPR reports- `GET /api/analytics/dashboard` - Get dashboard analytics data

- **File Uploads** - Upload and manage project documents

- **User Authentication** - Secure login and user management### AI Analysis Endpoints

- **API Endpoints** - RESTful API for all operations- `POST /api/ai/analyze` - Perform AI analysis on project data

- **Health Monitoring** - Built-in health checks and logging

- **Error Handling** - Comprehensive error handling and logging## 🎯 Usage Guide

- **Rate Limiting** - API protection against abuse

### Dashboard

## 🗄️ Database- View key metrics and trends

- Monitor recent activity

The system uses Supabase (PostgreSQL) for data storage. Key tables:- Access quick actions and reports



- `users` - User accounts and profiles### Reports Management

- `projects` - Project information- Create new analysis reports

- `reports` - DPR reports and data- Search and filter existing reports

- `files` - File upload metadata- Update report statuses

- Export reports in various formats

### Database Setup

### AI Analysis

Run the database setup script to create tables:- Submit project data for AI analysis

```bash- Get intelligent insights and recommendations

npm run setup:db- Save analysis results as reports

```- Export analysis data



Or manually run the SQL from `database/schema.sql` in your Supabase dashboard.### Navigation

- Use the top navigation to switch between sections

## 🔧 Configuration- Global search functionality (Ctrl/Cmd + K)

- Quick actions available throughout the interface

### Environment Variables

## 🔐 Security Features

Create a `.env` file with the following variables:

- **Authentication** - JWT-based user authentication

```env- **Password Hashing** - bcrypt password encryption

# Supabase Configuration- **Rate Limiting** - API endpoint protection

SUPABASE_URL=your_supabase_url- **CORS Protection** - Cross-origin request security

SUPABASE_ANON_KEY=your_anon_key- **Input Validation** - Server-side input validation

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key- **Security Headers** - Helmet.js security middleware



# Database## 📊 Data Models

DATABASE_URL=your_postgres_connection_string

### Reports

# JWT- Report ID (unique identifier)

JWT_SECRET=your_jwt_secret- Project information

- Issue type and severity

# Server- AI analysis results

PORT=3000- Status tracking

NODE_ENV=development- Timestamps



# Rate Limiting### Users

RATE_LIMIT_WINDOW_MS=900000- User credentials and profiles

RATE_LIMIT_MAX_REQUESTS=100- Role-based access control

- Authentication tokens

# File Uploads

MAX_FILE_SIZE_MB=10### Analytics

- Dashboard metrics

# Logging- Trend analysis data

LOG_LEVEL=info- Performance indicators

LOG_TO_FILE=false

```## 🚀 Deployment



## 🐳 Docker Deployment### Local Development

```bash

### Using Docker Composenpm run dev

```

```bash

docker-compose up -d### Production Deployment

``````bash

npm run build

### Building Docker Imagenpm start

```

```bash

docker build -t ai-dpr-system .### Docker Deployment (Optional)

docker run -p 3000:3000 --env-file .env ai-dpr-system```dockerfile

```FROM node:16-alpine

WORKDIR /app

## ☁️ Cloud DeploymentCOPY package*.json ./

RUN npm ci --only=production

### HerokuCOPY . .

EXPOSE 3000

1. Install Heroku CLICMD ["npm", "start"]

2. Login: `heroku login````

3. Create app: `heroku create your-app-name`

4. Set environment variables: `heroku config:set VARIABLE=value`## 🧪 Testing

5. Deploy: `git push heroku main`

Run the development server and test the following:

### Other Platforms

1. **Dashboard Functionality**

- **Vercel**: Connect GitHub repository   - Metrics display correctly

- **Railway**: Connect GitHub repository   - Charts render properly

- **DigitalOcean**: Use Docker deployment   - Real-time updates work



## 🧪 Testing2. **Reports System**

   - Create, read, update operations

```bash   - Search and filtering

# Run all tests   - Status management

npm test

3. **AI Analysis**

# Run tests in watch mode   - Form submission

npm run test:watch   - Results display

   - Save and export features

# Run specific test file

npm test -- reports.test.js## 🔍 Troubleshooting

```

### Common Issues

## 📈 Monitoring

1. **Port Already in Use**

### Health Checks   ```bash

   # Change port in package.json or environment

- Basic: `GET /api/health`   PORT=3001 npm start

- Detailed: `GET /api/health/detailed`   ```



### Logging2. **Database Connection Issues**

   ```bash

Logs are written to:   # Check database file permissions

- Console (development)   chmod 644 database.db

- `logs/` directory (production)   ```



Log levels: `error`, `warn`, `info`, `debug`3. **Dependencies Issues**

   ```bash

## 🔒 Security   # Clear node_modules and reinstall

   rm -rf node_modules package-lock.json

- JWT-based authentication   npm install

- Rate limiting on API endpoints   ```

- Input validation and sanitization

- Helmet security headers## 📈 Performance Optimization

- CORS protection

- File upload restrictions- **Lazy Loading** - Components load on demand

- **Data Pagination** - Large datasets are paginated

## 🤝 Contributing- **Caching** - Static assets and API responses cached

- **Compression** - Gzip compression enabled

1. Fork the repository- **Database Indexing** - Optimized database queries

2. Create a feature branch: `git checkout -b feature-name`

3. Make your changes and add tests## 🤝 Contributing

4. Run tests: `npm test`

5. Run linting: `npm run lint`1. Fork the repository

6. Commit changes: `git commit -am 'Add feature'`2. Create a feature branch (`git checkout -b feature/amazing-feature`)

7. Push to branch: `git push origin feature-name`3. Commit your changes (`git commit -m 'Add amazing feature'`)

8. Create a Pull Request4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request

## 📝 License

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

## 🆘 Support

For support and questions:

For support and questions:

1. Check the documentation in `docs/`- Create an issue in the repository

2. Review the logs in `logs/`- Check the troubleshooting section

3. Check the health endpoint: `/api/health`- Review the API documentation

4. Create an issue in the repository

## 🎉 Acknowledgments

## 🏆 Status

- Built with modern web technologies

- ✅ **Core API**: Fully functional- Inspired by best practices in project management

- ✅ **Database Integration**: Working with fallbacks- Designed for scalability and maintainability

- ✅ **File Uploads**: Implemented

- ✅ **Error Handling**: Comprehensive---

- ✅ **Logging**: Complete

- ✅ **Health Checks**: Working**AI DPR System** - Intelligent Project Risk Analysis Made Simple
- 🚧 **Authentication**: Basic implementation
- 🚧 **Frontend**: Using static HTML/JS
- 🚧 **Testing**: In progress

---

**Built with ❤️ using Node.js, Express, Supabase, and modern web technologies.**
