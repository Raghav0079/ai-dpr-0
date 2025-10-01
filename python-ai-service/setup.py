#!/usr/bin/env python3
"""
Setup script for AI DPR Python service
Installs dependencies and downloads required models
"""

import subprocess
import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Run a shell command and handle errors"""
    logger.info(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} failed: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error("❌ Python 3.8 or higher is required")
        return False
    logger.info(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_requirements():
    """Install Python dependencies"""
    commands = [
        ("pip install --upgrade pip", "Upgrading pip"),
        ("pip install -r requirements.txt", "Installing Python dependencies"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    return True

def download_models():
    """Download required ML models"""
    logger.info("📥 Downloading AI models...")
    
    try:
        # Download models using Python
        import torch
        from transformers import AutoTokenizer, AutoModel
        
        models_to_download = [
            ("bert-base-multilingual-cased", "BERT Multilingual"),
            ("cardiffnlp/twitter-roberta-base-sentiment-latest", "Sentiment Analysis"),
            ("dbmdz/bert-large-cased-finetuned-conll03-english", "Named Entity Recognition"),
        ]
        
        for model_name, description in models_to_download:
            logger.info(f"Downloading {description}...")
            try:
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModel.from_pretrained(model_name)
                logger.info(f"✅ {description} downloaded successfully")
            except Exception as e:
                logger.warning(f"⚠️ Could not download {description}: {e}")
        
        # Try to download IndicBERT (optional)
        try:
            logger.info("Downloading IndicBERT...")
            tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indic-bert")
            model = AutoModel.from_pretrained("ai4bharat/indic-bert")
            logger.info("✅ IndicBERT downloaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not download IndicBERT: {e}")
            
    except ImportError as e:
        logger.error(f"❌ Could not download models: {e}")
        return False
    
    return True

def create_service_script():
    """Create service startup script"""
    script_content = '''#!/bin/bash
# AI Service Startup Script

echo "🚀 Starting AI DPR Service..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
fi

# Start the service
echo "🔄 Starting FastAPI service on port 8000..."
python ai_service.py

echo "🛑 AI Service stopped"
'''
    
    with open('start_service.sh', 'w') as f:
        f.write(script_content)
    
    # Make it executable
    os.chmod('start_service.sh', 0o755)
    logger.info("✅ Service startup script created")

def create_windows_batch():
    """Create Windows batch file for service startup"""
    batch_content = '''@echo off
echo 🚀 Starting AI DPR Service...

REM Activate virtual environment if it exists
if exist "venv\\Scripts\\activate.bat" (
    call venv\\Scripts\\activate.bat
    echo ✅ Virtual environment activated
)

REM Start the service
echo 🔄 Starting FastAPI service on port 8000...
python ai_service.py

echo 🛑 AI Service stopped
pause
'''
    
    with open('start_service.bat', 'w') as f:
        f.write(batch_content)
    
    logger.info("✅ Windows batch script created")

def main():
    """Main setup function"""
    logger.info("🚀 Setting up AI DPR Python Service")
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        logger.error("❌ Failed to install requirements")
        sys.exit(1)
    
    # Download models
    if not download_models():
        logger.warning("⚠️ Some models could not be downloaded, but service may still work")
    
    # Create startup scripts
    create_service_script()
    create_windows_batch()
    
    logger.info("✅ Setup completed successfully!")
    logger.info("\n📋 Next steps:")
    logger.info("1. Start the AI service:")
    logger.info("   - Linux/Mac: ./start_service.sh")
    logger.info("   - Windows: start_service.bat")
    logger.info("   - Manual: python ai_service.py")
    logger.info("\n2. The service will run on http://localhost:8000")
    logger.info("3. Check service health: http://localhost:8000/health")
    logger.info("4. Your Node.js backend can now call the AI service!")

if __name__ == "__main__":
    main()