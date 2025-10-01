// AI Models Configuration for DPR System
// Comprehensive AI/ML stack for multilingual NLP and risk analysis

const aiModelsConfig = {
  // Natural Language Processing Models
  nlpModels: {
    // Multilingual BERT for general text understanding
    bert: {
      name: 'BERT Multilingual',
      model: 'bert-base-multilingual-cased',
      provider: 'huggingface',
      url: 'https://huggingface.co/bert-base-multilingual-cased',
      capabilities: ['text_classification', 'sentiment_analysis', 'entity_extraction'],
      languages: ['en', 'hi', 'te', 'ta', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'as'],
      maxTokens: 512,
      description: 'General multilingual embeddings for cross-language understanding'
    },

    // IndicBERT for Indian languages
    indicBert: {
      name: 'IndicBERT',
      model: 'ai4bharat/indic-bert',
      provider: 'huggingface',
      url: 'https://huggingface.co/ai4bharat/indic-bert',
      capabilities: ['indian_language_nlp', 'text_classification', 'named_entity_recognition'],
      languages: ['hi', 'te', 'ta', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'as', 'ur'],
      maxTokens: 512,
      description: 'Specialized model for Indian language NLP tasks'
    },

    // LLaMA-2 for advanced semantic understanding
    llama2: {
      name: 'LLaMA-2',
      model: 'meta-llama/Llama-2-7b-chat-hf',
      provider: 'huggingface',
      url: 'https://huggingface.co/meta-llama/Llama-2-7b-chat-hf',
      capabilities: ['text_generation', 'semantic_understanding', 'question_answering', 'summarization'],
      languages: ['en', 'multilingual_limited'],
      maxTokens: 4096,
      description: 'Large language model for advanced semantic understanding and reasoning'
    }
  },

  // Classification and Risk Assessment Models
  riskModels: {
    // Random Forest for structured data
    randomForest: {
      name: 'Random Forest Classifier',
      library: 'scikit-learn',
      url: 'https://scikit-learn.org/',
      capabilities: ['classification', 'feature_importance', 'risk_scoring'],
      features: ['budget_variance', 'timeline_deviation', 'resource_utilization', 'stakeholder_satisfaction'],
      description: 'Ensemble method for DPR scoring and risk prediction'
    },

    // XGBoost for gradient boosting
    xgboost: {
      name: 'XGBoost',
      library: 'xgboost',
      url: 'https://xgboost.readthedocs.io/',
      capabilities: ['classification', 'regression', 'ranking', 'risk_prediction'],
      features: ['project_complexity', 'historical_performance', 'market_conditions', 'team_experience'],
      description: 'Gradient boosting framework for high-performance risk prediction'
    },

    // LightGBM for efficient gradient boosting
    lightgbm: {
      name: 'LightGBM',
      library: 'lightgbm',
      url: 'https://lightgbm.readthedocs.io/',
      capabilities: ['fast_training', 'memory_efficient', 'categorical_features'],
      features: ['real_time_scoring', 'large_datasets', 'feature_engineering'],
      description: 'Fast gradient boosting for real-time DPR analysis'
    }
  },

  // Survival and Delay Prediction Models
  survivalModels: {
    lifelines: {
      name: 'Lifelines Survival Analysis',
      library: 'lifelines',
      url: 'https://lifelines.readthedocs.io/',
      capabilities: ['survival_analysis', 'delay_prediction', 'hazard_modeling'],
      models: ['cox_proportional_hazards', 'kaplan_meier', 'accelerated_failure_time'],
      description: 'Statistical models for project delay prediction and survival analysis'
    }
  },

  // Model Hosting and Deployment
  modelHosting: {
    huggingface: {
      name: 'Hugging Face Inference API',
      url: 'https://huggingface.co/',
      capabilities: ['model_serving', 'auto_scaling', 'gpu_acceleration'],
      apiEndpoint: 'https://api-inference.huggingface.co/models/',
      description: 'Cloud-based model serving with automatic scaling'
    },

    mlflow: {
      name: 'MLflow',
      url: 'https://mlflow.org/',
      capabilities: ['model_versioning', 'experiment_tracking', 'model_registry'],
      components: ['tracking', 'projects', 'models', 'registry'],
      description: 'End-to-end ML lifecycle management'
    },

    onnx: {
      name: 'ONNX Runtime',
      url: 'https://onnxruntime.ai/',
      capabilities: ['cross_platform', 'optimized_inference', 'model_interoperability'],
      formats: ['onnx', 'pytorch', 'tensorflow', 'scikit-learn'],
      description: 'High-performance inference engine for cross-platform deployment'
    }
  }
};

// AI Processing Pipeline Configuration
const aiPipeline = {
  // Text preprocessing pipeline
  preprocessing: {
    steps: [
      'text_cleaning',
      'language_detection',
      'tokenization',
      'normalization',
      'entity_extraction'
    ],
    languages: {
      supported: ['en', 'hi', 'te', 'ta', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'as'],
      default: 'en',
      autoDetect: true
    }
  },

  // Analysis workflow
  analysisWorkflow: {
    stages: [
      {
        name: 'text_analysis',
        models: ['bert', 'indicBert'],
        outputs: ['sentiment', 'entities', 'topics', 'completeness_score']
      },
      {
        name: 'risk_assessment',
        models: ['randomForest', 'xgboost', 'lightgbm'],
        outputs: ['risk_score', 'probability_distribution', 'feature_importance']
      },
      {
        name: 'delay_prediction',
        models: ['lifelines'],
        outputs: ['survival_curve', 'hazard_ratio', 'expected_delay']
      },
      {
        name: 'semantic_understanding',
        models: ['llama2'],
        outputs: ['summary', 'recommendations', 'insights']
      }
    ]
  },

  // Model ensemble configuration
  ensemble: {
    method: 'weighted_voting',
    weights: {
      bert: 0.25,
      indicBert: 0.25,
      randomForest: 0.20,
      xgboost: 0.20,
      lightgbm: 0.10
    },
    threshold: 0.7,
    confidence_calculation: 'weighted_average'
  }
};

// Feature Engineering Configuration
const featureEngineering = {
  textFeatures: [
    'word_count',
    'sentence_count',
    'avg_sentence_length',
    'sentiment_polarity',
    'sentiment_subjectivity',
    'named_entities_count',
    'technical_terms_ratio',
    'readability_score'
  ],

  projectFeatures: [
    'budget_size',
    'timeline_duration',
    'team_size',
    'complexity_score',
    'stakeholder_count',
    'risk_factors_count',
    'historical_performance',
    'market_volatility'
  ],

  derivedFeatures: [
    'budget_per_day',
    'team_experience_avg',
    'complexity_per_member',
    'risk_density',
    'stakeholder_complexity',
    'timeline_buffer',
    'resource_utilization_rate',
    'change_request_frequency'
  ]
};

// Model Performance Metrics
const performanceMetrics = {
  classification: [
    'accuracy',
    'precision',
    'recall',
    'f1_score',
    'auc_roc',
    'confusion_matrix'
  ],
  
  regression: [
    'mse',
    'rmse',
    'mae',
    'r2_score',
    'mape'
  ],
  
  nlp: [
    'bleu_score',
    'rouge_score',
    'semantic_similarity',
    'coherence_score'
  ],

  business: [
    'prediction_accuracy',
    'false_positive_rate',
    'false_negative_rate',
    'cost_savings',
    'time_savings',
    'user_satisfaction'
  ]
};

// API Integration Configuration
const apiConfig = {
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co/models/',
    headers: {
      'Authorization': 'Bearer ${HUGGINGFACE_API_KEY}',
      'Content-Type': 'application/json'
    },
    rateLimit: {
      requests: 1000,
      period: 'hour'
    }
  },

  endpoints: {
    textClassification: '/pipeline/text-classification',
    sentimentAnalysis: '/pipeline/sentiment-analysis',
    namedEntityRecognition: '/pipeline/ner',
    textGeneration: '/pipeline/text-generation',
    questionAnswering: '/pipeline/question-answering'
  }
};

module.exports = {
  aiModelsConfig,
  aiPipeline,
  featureEngineering,
  performanceMetrics,
  apiConfig
};