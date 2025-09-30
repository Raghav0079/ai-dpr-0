// AI Service Integration for Node.js Backend
// Connects to Python-based AI service

const axios = require('axios');

class AIServiceClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.timeout = 30000; // 30 seconds timeout
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Check if AI service is running
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data,
        status: 'healthy'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'unhealthy'
      };
    }
  }

  // Get models status
  async getModelsStatus() {
    try {
      const response = await this.client.get('/models/status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Main DPR analysis
  async analyzeDPR(data) {
    try {
      const {
        text,
        project_data = {},
        issue_type,
        language = 'en',
        include_risk_assessment = true,
        include_delay_prediction = true
      } = data;

      const requestPayload = {
        text,
        project_data,
        issue_type,
        language,
        include_risk_assessment,
        include_delay_prediction
      };

      const response = await this.client.post('/analyze', requestPayload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Service analysis error:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackAnalysis(data)
      };
    }
  }

  // File analysis
  async analyzeFiles(data) {
    try {
      const {
        file_content,
        file_type,
        issue_type,
        language = 'en'
      } = data;

      const requestPayload = {
        file_content,
        file_type,
        issue_type,
        language
      };

      const response = await this.client.post('/analyze-files', requestPayload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Service file analysis error:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackFileAnalysis(data)
      };
    }
  }

  // Fallback analysis when AI service is unavailable
  generateFallbackAnalysis(data) {
    const { issue_type, text } = data;
    
    const fallbackAnalyses = {
      'Budget Mismatch': 'Fallback analysis: Budget variance detected. Manual review recommended for cost control measures.',
      'Unrealistic Schedule': 'Fallback analysis: Schedule constraints identified. Consider timeline revision and resource reallocation.',
      'Resource Allocation': 'Fallback analysis: Resource distribution issues noted. Team capacity assessment needed.',
      'Compliance Issue': 'Fallback analysis: Compliance gap identified. Regulatory review and corrective action required.',
      'Technical Risk': 'Fallback analysis: Technical complexity concerns. Expert consultation and risk mitigation planning advised.'
    };

    const wordCount = text.split(' ').length;
    const baseConfidence = 0.6;
    const lengthBonus = Math.min(wordCount / 200, 0.2);

    return {
      analysis: fallbackAnalyses[issue_type] || 'Fallback analysis: Issue requires detailed review and stakeholder consultation.',
      sentiment_score: 0.0,
      confidence_score: baseConfidence + lengthBonus,
      completeness_score: Math.min(0.5 + (wordCount / 100), 1.0),
      compliance_score: 0.7,
      risk_score: issue_type.includes('High') ? 0.8 : 0.5,
      language_detected: 'en',
      entities: [],
      recommendations: [
        'Conduct detailed manual review',
        'Engage relevant stakeholders',
        'Develop mitigation strategy'
      ],
      risk_factors: [
        'AI service unavailable',
        'Limited automated analysis',
        'Manual intervention required'
      ],
      processing_time: 0.1,
      fallback_mode: true
    };
  }

  generateFallbackFileAnalysis(data) {
    return {
      file_analysis: `Fallback analysis: ${data.file_type} file processed with basic extraction`,
      extracted_insights: 'Manual file review recommended - AI service unavailable',
      confidence: 0.5,
      recommendations: [
        'Manual file review required',
        'Check AI service availability',
        'Consider alternative analysis methods'
      ],
      fallback_mode: true
    };
  }

  // Test connection to AI service
  async testConnection() {
    try {
      const response = await this.client.get('/', { timeout: 5000 });
      return {
        success: true,
        message: 'AI service connection successful',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: `AI service unavailable: ${error.message}`,
        suggestion: 'Start the Python AI service with: python ai_service.py'
      };
    }
  }
}

// Enhanced AI analysis function that uses the Python service
async function enhancedAIAnalysis(issue_type, description, project_data = {}, language = 'en') {
  const aiService = new AIServiceClient();
  
  // First, try to use the Python AI service
  const result = await aiService.analyzeDPR({
    text: description,
    project_data,
    issue_type,
    language,
    include_risk_assessment: true,
    include_delay_prediction: true
  });

  if (result.success) {
    return {
      source: 'ai_service',
      ...result.data
    };
  } else {
    // Fallback to basic analysis if AI service is unavailable
    console.warn('AI service unavailable, using fallback analysis');
    return {
      source: 'fallback',
      ...result.fallback
    };
  }
}

// Enhanced file analysis function
async function enhancedFileAnalysis(files, issue_type) {
  const aiService = new AIServiceClient();
  const analyses = [];

  for (const file of files) {
    // Read file content (simplified - in practice you'd handle different file types)
    let fileContent = '';
    try {
      if (file.mimetype.startsWith('text/')) {
        const fs = require('fs').promises;
        fileContent = await fs.readFile(file.path, 'utf8');
      } else {
        fileContent = `Binary file: ${file.originalname} (${file.size} bytes)`;
      }
    } catch (error) {
      fileContent = `Error reading file: ${error.message}`;
    }

    const result = await aiService.analyzeFiles({
      file_content: fileContent.substring(0, 2000), // Limit content length
      file_type: file.mimetype,
      issue_type,
      language: 'en'
    });

    analyses.push({
      filename: file.originalname,
      size: file.size,
      type: file.mimetype,
      analysis: result.success ? result.data : result.fallback,
      source: result.success ? 'ai_service' : 'fallback'
    });
  }

  return analyses;
}

// Initialize AI service and check availability
async function initializeAIService() {
  const aiService = new AIServiceClient();
  const health = await aiService.healthCheck();
  
  if (health.success) {
    console.log('🤖 AI Service connected successfully');
    console.log(`📊 Models status: ${JSON.stringify(health.data.models, null, 2)}`);
    
    // Get detailed models status
    const modelsStatus = await aiService.getModelsStatus();
    if (modelsStatus.success) {
      console.log('🧠 Available AI models:');
      console.log(`   - NLP Models: ${Object.keys(modelsStatus.data.nlp_models).filter(k => modelsStatus.data.nlp_models[k]).join(', ')}`);
      console.log(`   - ML Models: ${Object.keys(modelsStatus.data.ml_models).filter(k => modelsStatus.data.ml_models[k]).join(', ')}`);
      console.log(`   - Device: ${modelsStatus.data.device}`);
    }
    
    return { success: true, service: aiService };
  } else {
    console.warn('⚠️ AI Service not available:', health.error);
    console.log('💡 To enable AI features, start the Python service:');
    console.log('   cd python-ai-service');
    console.log('   python ai_service.py');
    
    return { success: false, error: health.error };
  }
}

module.exports = {
  AIServiceClient,
  enhancedAIAnalysis,
  enhancedFileAnalysis,
  initializeAIService
};