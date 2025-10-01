# 🚀 Hybrid Architecture Setup: Node.js + Python AI Integration

## Architecture Overview

Your AI DPR System now uses a **hybrid architecture**:

- **Node.js Backend** (Port 3000): API server, database operations, authentication
- **Python AI Service** (Port 8000): ML/NLP models, advanced analytics
- **React Frontend** (Port 5173): User interface
- **Supabase Database**: Cloud PostgreSQL database

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │───▶│   Node.js API   │───▶│ Supabase DB     │
│   (Frontend)    │    │   (Backend)     │    │ (Database)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Python AI      │
                       │  Service        │
                       │  (ML/NLP)       │
                       └─────────────────┘
```

## 🛠️ Setup Instructions

### Step 1: Install Node.js Dependencies

```bash
cd "c:\Users\Raghav\OneDrive\Desktop\AI DPR"
npm install axios
```

### Step 2: Set Up Python AI Service

```bash
# Navigate to Python service directory
cd python-ai-service

# Install Python dependencies
pip install -r requirements.txt

# Run setup script (downloads AI models)
python setup.py
```

### Step 3: Configure Environment Variables

Your `.env` file should already have Supabase credentials. Add AI service configuration:

```env
# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000
AI_FALLBACK_MODE=true
```

### Step 4: Deploy Supabase Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/csakacykllmrnecovpep
2. Navigate to **SQL Editor**
3. Run the SQL schema from `database/supabase-schema.sql`

## 🚀 Starting the Services

### Option 1: Start All Services Individually

**Terminal 1 - Python AI Service:**
```bash
cd python-ai-service
python ai_service.py
```

**Terminal 2 - Node.js Backend:**
```bash
npm start
```

**Terminal 3 - React Frontend:**
```bash
cd react-frontend
npm run dev
```

### Option 2: Use the Setup Scripts

**Windows:**
```bash
# Start Python AI service
cd python-ai-service
start_service.bat

# Start Node.js backend (in new terminal)
npm start
```

**Linux/Mac:**
```bash
# Start Python AI service
cd python-ai-service
./start_service.sh

# Start Node.js backend (in new terminal)
npm start
```

## 🔧 How It Works

### 1. **Node.js Backend Handles:**
- API routing and authentication
- Database operations (Supabase)
- File uploads and management
- Session management
- Basic business logic

### 2. **Python AI Service Provides:**
- **BERT Multilingual**: General text analysis
- **IndicBERT**: Indian language processing
- **Sentiment Analysis**: Emotion detection
- **Named Entity Recognition**: Extract entities
- **Risk Assessment**: ML-based scoring
- **Delay Prediction**: Timeline forecasting

### 3. **Integration Flow:**

```javascript
// Node.js calls Python AI service
const aiResult = await enhancedAIAnalysis(
  issue_type, 
  description, 
  project_data
);

// Receives comprehensive analysis:
{
  analysis: "AI analysis with NLP insights...",
  sentiment_score: 0.85,
  confidence_score: 0.92,
  risk_score: 0.67,
  entities: [...],
  recommendations: [...],
  delay_prediction: {...}
}
```

## 🧠 AI Models Available

### NLP Models:
- ✅ **BERT Multilingual** - Text understanding
- ✅ **IndicBERT** - Indian languages
- ✅ **RoBERTa Sentiment** - Emotion analysis
- ✅ **BERT NER** - Entity extraction

### ML Models:
- ✅ **Random Forest** - Risk classification
- ✅ **XGBoost** - Gradient boosting
- ✅ **LightGBM** - Fast training
- ✅ **Lifelines** - Survival analysis

## 🔄 Fallback Mechanism

If the Python AI service is unavailable, the system automatically:

1. **Detects service unavailability**
2. **Switches to fallback mode**
3. **Provides basic analysis**
4. **Logs warnings for monitoring**
5. **Continues serving users**

Example fallback response:
```json
{
  "source": "fallback",
  "analysis": "Fallback analysis: Manual review recommended",
  "confidence_score": 0.6,
  "fallback_mode": true
}
```

## 📊 API Endpoints

### Node.js Backend (Port 3000):
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report (uses AI analysis)
- `POST /api/ai/analyze` - Enhanced AI analysis
- `POST /api/upload` - File upload with AI processing

### Python AI Service (Port 8000):
- `GET /health` - Service health check
- `POST /analyze` - Main DPR analysis
- `POST /analyze-files` - File content analysis
- `GET /models/status` - Available models

## 🏃‍♂️ Quick Start Test

1. **Start Python AI service:**
   ```bash
   cd python-ai-service
   python ai_service.py
   ```

2. **Test AI service:**
   Open http://localhost:8000/health

3. **Start Node.js backend:**
   ```bash
   npm start
   ```

4. **Test integration:**
   The console should show:
   ```
   🤖 AI Service connected successfully
   🧠 Available AI models: bert_multilingual, sentiment_pipeline, ner_pipeline
   ```

## 🚨 Troubleshooting

### Python AI Service Issues:
```bash
# Check if service is running
curl http://localhost:8000/health

# View Python service logs
python ai_service.py

# Install missing dependencies
pip install -r requirements.txt
```

### Node.js Integration Issues:
```bash
# Test AI service connection
node -e "
const { AIServiceClient } = require('./config/ai-service-client');
const client = new AIServiceClient();
client.testConnection().then(console.log);
"
```

### Model Loading Issues:
- **GPU Memory**: Models default to CPU if GPU unavailable
- **Download Errors**: Check internet connection for model downloads
- **Version Conflicts**: Ensure compatible library versions

## 🎯 Benefits of This Architecture

✅ **Best of Both Worlds**: Fast Node.js + Powerful Python AI
✅ **Scalable**: Each service can scale independently  
✅ **Reliable**: Fallback mechanism ensures uptime
✅ **Flexible**: Easy to add new AI models
✅ **Maintainable**: Clear separation of concerns
✅ **Production Ready**: Robust error handling

## 🔮 Next Steps

1. **Test the complete flow** with sample data
2. **Deploy Python service** to cloud (Heroku, AWS, etc.)
3. **Configure load balancing** for high traffic
4. **Add monitoring** for AI service performance
5. **Implement caching** for frequently used analyses

Your AI DPR System is now powered by state-of-the-art AI models! 🎉