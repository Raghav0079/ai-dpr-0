# AI DPR - React Frontend Deployment Guide

## 🚀 Quick Start

### Development Mode

1. **Install Dependencies**
   ```bash
   cd react-frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Production Build

1. **Build React App**
   ```bash
   cd react-frontend
   npm run build
   ```

2. **Preview Production Build**
   ```bash
   npm run preview
   ```

3. **Deploy with Backend**
   - The built React app will be served by the Express server
   - Access: http://localhost:3000

## 📁 Project Structure

```
AI-DPR/
├── react-frontend/          # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   ├── public/             # Static assets
│   ├── dist/              # Built files (after npm run build)
│   ├── package.json
│   └── vite.config.js     # Vite configuration
├── server.js              # Express backend server
├── database.db           # SQLite database
└── public/               # Static files (legacy)
```

## 🛠️ Available Scripts

### Frontend (react-frontend/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (root directory)
- `node server.js` - Start Express server

## 🌐 Deployment Options

### 1. Local Development
```bash
# Terminal 1: Start backend
node server.js

# Terminal 2: Start frontend
cd react-frontend
npm run dev
```

### 2. Production Build
```bash
# Build React app
cd react-frontend
npm run build

# Start backend (serves React build)
cd ..
node server.js
```

### 3. Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
WORKDIR /app/react-frontend
RUN npm install && npm run build
WORKDIR /app
EXPOSE 3000
CMD ["node", "server.js"]
```

### 4. Cloud Deployment (Heroku, Railway, etc.)
```json
// package.json scripts
{
  "scripts": {
    "start": "node server.js",
    "build": "cd react-frontend && npm install && npm run build",
    "heroku-postbuild": "npm run build"
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# .env file
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
```

### Vite Configuration (vite.config.js)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows frontend origin
   - Check server.js CORS configuration

2. **API Calls Failing**
   - Verify backend is running on port 3000
   - Check proxy configuration in vite.config.js

3. **Build Errors**
   - Run `npm install` in react-frontend directory
   - Check for missing dependencies

4. **Routing Issues**
   - Ensure catch-all route is configured in server.js
   - Check React Router configuration

### Performance Tips

1. **Code Splitting**
   - Vite automatically handles code splitting
   - Use React.lazy() for component-level splitting

2. **Optimization**
   - Run `npm run build` for optimized production build
   - Enable compression in Express server

3. **Caching**
   - Configure proper cache headers
   - Use service workers for offline functionality

## 📊 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Charts**: Recharts
- **UI Components**: Headless UI, Heroicons
- **Backend**: Node.js, Express.js, SQLite

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Input validation
- JWT authentication (backend)

## 📈 Monitoring & Analytics

- Built-in error boundaries
- Console logging for development
- Performance monitoring hooks
- API response time tracking

---

## 💡 Next Steps

1. **Add Authentication**
   - Implement login/register pages
   - JWT token management
   - Protected routes

2. **Enhanced Features**
   - Real-time notifications (WebSockets)
   - File upload/export capabilities
   - Advanced charts and visualizations
   - Email notifications

3. **Testing**
   - Unit tests with Vitest
   - Integration tests
   - E2E tests with Playwright

4. **DevOps**
   - CI/CD pipeline
   - Automated testing
   - Docker containerization
   - Cloud deployment