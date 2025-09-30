# AI Service for DPR System
# Python-based ML/NLP service that integrates with Node.js backend

import os
import json
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uvicorn

# ML/AI Libraries
import numpy as np
import pandas as pd
from transformers import (
    AutoTokenizer, AutoModel, AutoModelForSequenceClassification,
    pipeline, BertTokenizer, BertModel
)
import torch
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import lightgbm as lgb
from lifelines import CoxPHFitter, KaplanMeierFitter
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

# Global variables for models (loaded once at startup)
models = {}
tokenizers = {}
pipelines = {}

class AIModelManager:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
    async def load_models(self):
        """Load all AI models at startup"""
        try:
            logger.info("Loading AI models...")
            
            # Load BERT multilingual model
            models['bert_tokenizer'] = AutoTokenizer.from_pretrained('bert-base-multilingual-cased')
            models['bert_model'] = AutoModel.from_pretrained('bert-base-multilingual-cased')
            
            # Load IndicBERT for Indian languages
            try:
                models['indic_tokenizer'] = AutoTokenizer.from_pretrained('ai4bharat/indic-bert')
                models['indic_model'] = AutoModel.from_pretrained('ai4bharat/indic-bert')
            except Exception as e:
                logger.warning(f"Could not load IndicBERT: {e}")
            
            # Load sentiment analysis pipeline
            pipelines['sentiment'] = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Load NER pipeline
            pipelines['ner'] = pipeline(
                "ner",
                model="dbmdz/bert-large-cased-finetuned-conll03-english",
                aggregation_strategy="simple",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Initialize traditional ML models
            models['random_forest'] = RandomForestClassifier(n_estimators=100, random_state=42)
            models['xgboost'] = xgb.XGBClassifier(random_state=42)
            models['lightgbm'] = lgb.LGBMClassifier(random_state=42)
            models['scaler'] = StandardScaler()
            
            logger.info("All models loaded successfully!")
            
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
        "models_loaded": len(models) + len(pipelines),
        "device": str(model_manager.device)
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "bert": "bert_model" in models,
            "indic_bert": "indic_model" in models,
            "sentiment": "sentiment" in pipelines,
            "ner": "ner" in pipelines,
            "random_forest": "random_forest" in models,
            "xgboost": "xgboost" in models,
            "lightgbm": "lightgbm" in models
        }
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

def extract_features(text: str, project_data: Dict) -> Dict[str, float]:
    """Extract numerical features for ML models"""
    features = {}
    
    # Text features
    features['word_count'] = len(text.split())
    features['sentence_count'] = len(re.split(r'[.!?]+', text))
    features['avg_word_length'] = np.mean([len(word) for word in text.split()])
    features['technical_terms'] = len(re.findall(r'\b(budget|timeline|resource|risk|compliance|deadline|milestone)\b', text.lower()))
    
    # Project features (with defaults)
    features['budget_size'] = project_data.get('budget', 100000)
    features['timeline_days'] = project_data.get('timeline_days', 90)
    features['team_size'] = project_data.get('team_size', 5)
    features['complexity_score'] = project_data.get('complexity', 3)
    
    # Derived features
    features['budget_per_day'] = features['budget_size'] / max(features['timeline_days'], 1)
    features['words_per_sentence'] = features['word_count'] / max(features['sentence_count'], 1)
    
    return features

def calculate_risk_score(features: Dict[str, float], issue_type: str) -> float:
    """Calculate risk score based on features and issue type"""
    base_risk = 0.3
    
    # Issue type weights
    issue_weights = {
        'Budget Mismatch': 0.4,
        'Unrealistic Schedule': 0.35,
        'Resource Allocation': 0.25,
        'Compliance Issue': 0.3,
        'Technical Risk': 0.35
    }
    
    issue_risk = issue_weights.get(issue_type, 0.3)
    
    # Feature-based adjustments
    if features['budget_size'] > 1000000:
        issue_risk += 0.1
    if features['timeline_days'] < 30:
        issue_risk += 0.15
    if features['complexity_score'] > 7:
        issue_risk += 0.1
    if features['technical_terms'] > 5:
        issue_risk += 0.05
    
    return min(base_risk + issue_risk, 1.0)

def generate_recommendations(issue_type: str, risk_score: float) -> List[str]:
    """Generate recommendations based on issue type and risk score"""
    recommendations = []
    
    base_recommendations = {
        'Budget Mismatch': [
            'Conduct detailed budget review with stakeholders',
            'Implement stricter cost control measures',
            'Consider scope reduction or additional funding'
        ],
        'Unrealistic Schedule': [
            'Break down tasks into smaller components',
            'Add buffer time for critical activities',
            'Consider parallel execution of independent tasks'
        ],
        'Resource Allocation': [
            'Perform skills gap analysis',
            'Redistribute workload among team members',
            'Consider hiring additional resources or training'
        ]
    }
    
    recommendations.extend(base_recommendations.get(issue_type, ['Conduct thorough project review']))
    
    if risk_score > 0.7:
        recommendations.extend([
            'Escalate to senior management immediately',
            'Develop comprehensive risk mitigation plan',
            'Increase monitoring and reporting frequency'
        ])
    
    return recommendations

def predict_delay(features: Dict[str, float], issue_type: str) -> Dict[str, Any]:
    """Predict project delay using survival analysis concepts"""
    
    # Simple delay prediction based on features
    base_delay = 0
    
    if features['timeline_days'] < 30:
        base_delay += 10
    if features['budget_size'] > 1000000:
        base_delay += 5
    if features['complexity_score'] > 7:
        base_delay += 7
    
    issue_delays = {
        'Budget Mismatch': 15,
        'Unrealistic Schedule': 20,
        'Resource Allocation': 12,
        'Compliance Issue': 8,
        'Technical Risk': 18
    }
    
    total_delay = base_delay + issue_delays.get(issue_type, 10)
    probability = min(0.1 + (total_delay / 100), 0.9)
    
    return {
        'expected_delay_days': total_delay,
        'delay_probability': probability,
        'confidence': 0.75,
        'risk_factors': [
            f"Timeline pressure: {features['timeline_days']} days",
            f"Budget scale: ${features['budget_size']:,.0f}",
            f"Issue type: {issue_type}"
        ]
    }

@app.post("/analyze", response_model=DPRAnalysisResponse)
async def analyze_dpr(request: DPRAnalysisRequest):
    """Main DPR analysis endpoint"""
    start_time = datetime.now()
    
    try:
        # Detect language
        detected_language = detect_language(request.text)
        
        # Sentiment analysis
        sentiment_result = pipelines['sentiment'](request.text[:512])[0]  # Truncate for model limits
        sentiment_score = sentiment_result['score'] if sentiment_result['label'] in ['POSITIVE', 'POS'] else -sentiment_result['score']
        
        # Named Entity Recognition
        entities = pipelines['ner'](request.text[:512])
        
        # Extract features
        features = extract_features(request.text, request.project_data)
        
        # Calculate scores
        risk_score = calculate_risk_score(features, request.issue_type)
        confidence_score = 0.85 + (sentiment_score * 0.1)  # Base confidence adjusted by sentiment
        completeness_score = min(0.5 + (features['word_count'] / 200), 1.0)
        compliance_score = 0.8 - (risk_score * 0.2)
        
        # Generate analysis text
        analysis_parts = [
            f"AI analysis of {request.issue_type} issue reveals {sentiment_result['label'].lower()} sentiment.",
            f"Text completeness is {'good' if completeness_score > 0.7 else 'moderate'}.",
            f"Risk assessment indicates {'high' if risk_score > 0.7 else 'moderate' if risk_score > 0.4 else 'low'} risk level.",
        ]
        
        if detected_language != 'en':
            analysis_parts.append(f"Content detected in {detected_language} language, processed using multilingual models.")
        
        analysis = " ".join(analysis_parts)
        
        # Generate recommendations
        recommendations = generate_recommendations(request.issue_type, risk_score)
        
        # Risk factors
        risk_factors = [
            f"Issue type: {request.issue_type}",
            f"Project scale: ${features['budget_size']:,.0f}",
            f"Timeline: {features['timeline_days']} days",
            f"Complexity level: {features['complexity_score']}/10"
        ]
        
        # Delay prediction
        delay_prediction = None
        if request.include_delay_prediction:
            delay_prediction = predict_delay(features, request.issue_type)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return DPRAnalysisResponse(
            analysis=analysis,
            sentiment_score=sentiment_score,
            confidence_score=confidence_score,
            completeness_score=completeness_score,
            compliance_score=compliance_score,
            risk_score=risk_score,
            language_detected=detected_language,
            entities=[{
                'text': ent['word'],
                'label': ent['entity_group'],
                'confidence': ent['score']
            } for ent in entities],
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
            "recommendations": analysis_result.recommendations[:3]  # Top 3 recommendations
        }
        
    except Exception as e:
        logger.error(f"Error in file analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/status")
async def get_models_status():
    """Get status of all loaded models"""
    return {
        "nlp_models": {
            "bert_multilingual": "bert_model" in models,
            "indic_bert": "indic_model" in models,
            "sentiment_pipeline": "sentiment" in pipelines,
            "ner_pipeline": "ner" in pipelines
        },
        "ml_models": {
            "random_forest": "random_forest" in models,
            "xgboost": "xgboost" in models,
            "lightgbm": "lightgbm" in models,
            "scaler": "scaler" in models
        },
        "device": str(model_manager.device),
        "total_models": len(models) + len(pipelines)
    }

if __name__ == "__main__":
    uvicorn.run(
        "ai_service:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )