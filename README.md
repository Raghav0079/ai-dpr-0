# AI Document Processing and Retrieval System

A comprehensive AI-powered document processing and retrieval system built with Node.js and Express.

## Features

- Document upload and processing
- AI-powered content analysis
- RESTful API endpoints
- SQLite database integration
- Rate limiting and security
- Comprehensive logging
- Health monitoring
- Analytics and reporting

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AI-DPR
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start the application:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /upload` - Upload documents
- `GET /analytics` - Get analytics data
- `GET /reports` - Generate reports

## Environment Variables

See `env.example` for required environment variables.

## License

MIT