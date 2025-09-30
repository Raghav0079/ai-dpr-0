# AI DPR System - Production Ready Dockerfile
FROM node:18-alpine AS builder

# Install system dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy React frontend package files if it exists
COPY react-frontend/package*.json ./react-frontend/ 2>/dev/null || true

# Install React dependencies if package.json exists
RUN if [ -f react-frontend/package.json ]; then cd react-frontend && npm ci; fi

# Copy source code
COPY . .

# Build React frontend if it exists
RUN if [ -f react-frontend/package.json ]; then cd react-frontend && npm run build; fi

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/src ./src/
COPY --from=builder /app/database ./database/
COPY --from=builder /app/scripts ./scripts/
COPY --from=builder /app/public ./public/
COPY --from=builder /app/docs ./docs/

# Create necessary directories
RUN mkdir -p uploads logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]