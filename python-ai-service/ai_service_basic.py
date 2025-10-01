# Simplified AI Service for DPR System
# Basic version for testing without heavy ML dependencies

import os
import json
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uvicorn
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import re
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI DPR Analysis Service",
    description="Python-based AI/ML service for DPR analysis and risk prediction",
    version="1.0.0"
)

# Enable CORS for Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class DPRAnalysisRequest(BaseModel):
    text: str
    project_data: Optional[Dict[str, Any]] = {}
    issue_type: str
    language: str = "en"
    include_risk_assessment: bool = True
    include_delay_prediction: bool = True

class DPRAnalysisResponse(BaseModel):
    analysis: str
    sentiment_score: float
    confidence_score: float
    completeness_score: float
    compliance_score: float
    risk_score: float
    language_detected: str
    entities: List[Dict[str, Any]]
    recommendations: List[str]
    risk_factors: List[str]
    delay_prediction: Optional[Dict[str, Any]] = None
    processing_time: float

class FileAnalysisRequest(BaseModel):
    file_content: str
    file_type: str
    issue_type: str
    language: str = "en"

# Global variables for models
models = {}

class AIModelManager:
    def __init__(self):
        logger.info("Initializing AI Model Manager")
        
    async def load_models(self):
        """Load basic models"""
        try:
            logger.info("Loading basic AI models...")
            
            # Initialize basic ML models
            models['random_forest'] = RandomForestClassifier(n_estimators=50, random_state=42)
            models['scaler'] = StandardScaler()
            
            # Create dummy training data for the models
            X_dummy = np.random.rand(100, 5)  # 5 features
            y_dummy = np.random.randint(0, 2, 100)  # Binary classification
            
            # Fit the models with dummy data
            X_scaled = models['scaler'].fit_transform(X_dummy)
            models['random_forest'].fit(X_scaled, y_dummy)
            
            logger.info("Basic models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise e

model_manager = AIModelManager()

@app.on_event("startup")
async def startup_event():
    """Load models when the service starts"""
    await model_manager.load_models()

@app.get("/")
async def root():
    return {
        "message": "AI DPR Analysis Service",
        "status": "running",
        "models_loaded": len(models),
        "version": "1.0.0-basic"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "random_forest": "random_forest" in models,
            "scaler": "scaler" in models,
            "basic_nlp": True,
            "sentiment_analysis": True
        },
        "service_type": "basic"
    }

def detect_language(text: str) -> str:
    """Simple language detection based on script"""
    # Check for Devanagari script (Hindi)
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    # Check for Telugu script
    elif re.search(r'[\u0C00-\u0C7F]', text):
        return "te"
    # Check for Tamil script
    elif re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    # Check for Bengali script
    elif re.search(r'[\u0980-\u09FF]', text):
        return "bn"
    # Default to English
    else:
        return "en"

def basic_sentiment_analysis(text: str) -> float:
    """Basic sentiment analysis using keyword matching"""
    positive_words = ['good', 'excellent', 'great', 'positive', 'success', 'achieve', 'complete', 'satisfied']
    negative_words = ['bad', 'poor', 'terrible', 'negative', 'fail', 'problem', 'issue', 'delay', 'risk', 'concern']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count + negative_count == 0:
        return 0.0
    
    return (positive_count - negative_count) / (positive_count + negative_count)

def extract_basic_entities(text: str) -> List[Dict[str, Any]]:
    """Basic entity extraction using regex patterns"""
    entities = []
    
    # Extract dates
    date_pattern = r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b'
    dates = re.findall(date_pattern, text)
    for date in dates:
        entities.append({"text": date, "label": "DATE", "confidence": 0.9})
    
    # Extract monetary amounts
    money_pattern = r'\$[\d,]+(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD|INR|rupees?)\b'
    amounts = re.findall(money_pattern, text, re.IGNORECASE)
    for amount in amounts:
        entities.append({"text": amount, "label": "MONEY", "confidence": 0.85})
    
    # Extract percentages
    percent_pattern = r'\b\d+(?:\.\d+)?%'
    percentages = re.findall(percent_pattern, text)
    for percent in percentages:
        entities.append({"text": percent, "label": "PERCENT", "confidence": 0.9})
    
    return entities

def extract_features(text: str, project_data: Dict) -> np.ndarray:
    """Extract numerical features for ML models"""
    features = []
    
    # Text features
    features.append(len(text.split()))  # word count
    features.append(len(re.split(r'[.!?]+', text)))  # sentence count
    features.append(len(re.findall(r'\b(budget|timeline|resource|risk|compliance)\b', text.lower())))  # technical terms
    
    # Project features (with defaults)
    features.append(project_data.get('budget', 100000) / 100000)  # normalized budget
    features.append(project_data.get('timeline_days', 90) / 365)  # normalized timeline
    
    return np.array(features).reshape(1, -1)

def calculate_risk_score(features: np.ndarray, issue_type: str) -> float:
    """Calculate risk score using ML model"""
    try:
        # Scale features
        features_scaled = models['scaler'].transform(features)
        
        # Get prediction probability
        risk_prob = models['random_forest'].predict_proba(features_scaled)[0][1]
        
        # Adjust based on issue type
        issue_multipliers = {
            'Budget Mismatch': 1.2,
            'Unrealistic Schedule': 1.1,
            'Resource Allocation': 0.9,
            'Compliance Issue': 1.0,
            'Technical Risk': 1.15
        }
        
        multiplier = issue_multipliers.get(issue_type, 1.0)
        adjusted_risk = min(risk_prob * multiplier, 1.0)
        
        return adjusted_risk
        
    except Exception as e:
        logger.warning(f"ML risk calculation failed: {e}, using fallback")
        # Fallback risk calculation
        base_risk = {'Budget Mismatch': 0.7, 'Unrealistic Schedule': 0.6, 'Resource Allocation': 0.5}.get(issue_type, 0.5)
        return base_risk

def generate_recommendations(issue_type: str, risk_score: float) -> List[str]:
    """Generate recommendations based on issue type and risk score"""
    base_recommendations = {
        'Budget Mismatch': [
            'Conduct detailed budget review with stakeholders',
            'Implement stricter cost control measures',
            'Consider scope reduction or additional funding approval'
        ],
        'Unrealistic Schedule': [
            'Break down complex tasks into smaller components',
            'Add buffer time for critical path activities',
            'Consider parallel execution of independent tasks'
        ],
        'Resource Allocation': [
            'Perform comprehensive skills gap analysis',
            'Redistribute workload among available team members',
            'Consider hiring additional resources or upskilling'
        ],
        'Compliance Issue': [
            'Review current compliance framework',
            'Engage compliance experts for guidance',
            'Implement regular compliance monitoring'
        ],
        'Technical Risk': [
            'Conduct technical feasibility assessment',
            'Engage senior technical experts',
            'Develop comprehensive risk mitigation plan'
        ]
    }
    
    recommendations = base_recommendations.get(issue_type, [
        'Conduct thorough project review',
        'Engage relevant stakeholders',
        'Develop comprehensive action plan'
    ])
    
    if risk_score > 0.7:
        recommendations.extend([
            'Escalate to senior management immediately',
            'Increase monitoring and reporting frequency',
            'Consider external expert consultation'
        ])
    
    return recommendations

def predict_delay(features: np.ndarray, issue_type: str, project_data: Dict) -> Dict[str, Any]:
    """Predict project delay using basic analysis"""
    
    timeline_days = project_data.get('timeline_days', 90)
    budget = project_data.get('budget', 100000)
    
    # Base delay calculation
    base_delay = 0
    
    if timeline_days < 30:
        base_delay += 15
    elif timeline_days < 60:
        base_delay += 8
    
    if budget > 1000000:
        base_delay += 10
    elif budget > 500000:
        base_delay += 5
    
    # Issue-specific delays
    issue_delays = {
        'Budget Mismatch': 20,
        'Unrealistic Schedule': 25,
        'Resource Allocation': 15,
        'Compliance Issue': 12,
        'Technical Risk': 18
    }
    
    total_delay = base_delay + issue_delays.get(issue_type, 10)
    probability = min(0.1 + (total_delay / 150), 0.95)
    
    return {
        'expected_delay_days': total_delay,
        'delay_probability': probability,
        'confidence': 0.75,
        'risk_factors': [
            f"Timeline constraint: {timeline_days} days",
            f"Budget scale: ${budget:,.0f}",
            f"Issue severity: {issue_type}"
        ]
    }

@app.post("/analyze", response_model=DPRAnalysisResponse)
async def analyze_dpr(request: DPRAnalysisRequest):
    """Main DPR analysis endpoint"""
    start_time = datetime.now()
    
    try:
        # Detect language
        detected_language = detect_language(request.text)
        
        # Basic sentiment analysis
        sentiment_score = basic_sentiment_analysis(request.text)
        
        # Extract entities
        entities = extract_basic_entities(request.text)
        
        # Extract features for ML
        features = extract_features(request.text, request.project_data)
        
        # Calculate scores
        risk_score = calculate_risk_score(features, request.issue_type)
        confidence_score = 0.8 + abs(sentiment_score) * 0.15  # Higher confidence for clear sentiment
        completeness_score = min(0.5 + (len(request.text.split()) / 200), 1.0)
        compliance_score = max(0.9 - risk_score * 0.3, 0.4)
        
        # Generate analysis text
        sentiment_label = "positive" if sentiment_score > 0.1 else "negative" if sentiment_score < -0.1 else "neutral"
        risk_level = "high" if risk_score > 0.7 else "moderate" if risk_score > 0.4 else "low"
        
        analysis_parts = [
            f"AI analysis of {request.issue_type} reveals {sentiment_label} sentiment (score: {sentiment_score:.2f}).",
            f"Text completeness is {'good' if completeness_score > 0.7 else 'moderate' if completeness_score > 0.5 else 'limited'}.",
            f"Risk assessment indicates {risk_level} risk level (score: {risk_score:.2f}).",
            f"Extracted {len(entities)} key entities from the text."
        ]
        
        if detected_language != 'en':
            analysis_parts.append(f"Content detected in {detected_language} language.")
        
        analysis = " ".join(analysis_parts)
        
        # Generate recommendations
        recommendations = generate_recommendations(request.issue_type, risk_score)
        
        # Risk factors
        risk_factors = [
            f"Issue type: {request.issue_type}",
            f"Risk level: {risk_level}",
            f"Sentiment: {sentiment_label}",
            f"Text completeness: {completeness_score:.1%}"
        ]
        
        # Delay prediction
        delay_prediction = None
        if request.include_delay_prediction:
            delay_prediction = predict_delay(features, request.issue_type, request.project_data)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return DPRAnalysisResponse(
            analysis=analysis,
            sentiment_score=sentiment_score,
            confidence_score=confidence_score,
            completeness_score=completeness_score,
            compliance_score=compliance_score,
            risk_score=risk_score,
            language_detected=detected_language,
            entities=entities,
            recommendations=recommendations,
            risk_factors=risk_factors,
            delay_prediction=delay_prediction,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error in DPR analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-files")
async def analyze_files(request: FileAnalysisRequest):
    """Analyze uploaded files"""
    try:
        # Simple file content analysis
        analysis_result = await analyze_dpr(DPRAnalysisRequest(
            text=request.file_content,
            issue_type=request.issue_type,
            language=request.language,
            include_delay_prediction=False
        ))
        
        return {
            "file_analysis": f"Processed {request.file_type} file with {len(request.file_content)} characters",
            "extracted_insights": analysis_result.analysis,
            "confidence": analysis_result.confidence_score,
            "recommendations": analysis_result.recommendations[:3],
            "entities": analysis_result.entities,
            "sentiment_score": analysis_result.sentiment_score
        }
        
    except Exception as e:
        logger.error(f"Error in file analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/status")
async def get_models_status():
    """Get status of all loaded models"""
    return {
        "basic_models": {
            "random_forest": "random_forest" in models,
            "scaler": "scaler" in models,
            "sentiment_analyzer": True,
            "entity_extractor": True,
            "language_detector": True
        },
        "advanced_models": {
            "bert_multilingual": False,
            "indic_bert": False,
            "transformers_pipeline": False,
            "note": "Advanced models can be enabled by installing transformers library"
        },
        "total_models": len(models),
        "service_type": "basic"
    }

if __name__ == "__main__":
    print("🚀 Starting AI DPR Service (Basic Version)")
    print("📊 Models: Random Forest, Basic NLP, Sentiment Analysis")
    print("🔗 To upgrade: pip install transformers torch")
    
    uvicorn.run(
        "ai_service_basic:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )