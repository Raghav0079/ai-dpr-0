# AI-Powered DPR Quality Assessment and Risk Prediction System

An intelligent platform for analyzing Detailed Project Reports (DPRs) using AI/ML technologies to assess completeness, compliance, and predict risks for the Ministry of Development of North Eastern Region (MDoNER).

<img width="1122" height="704" alt="image" src="https://github.com/user-attachments/assets/cd4eb876-084f-41ba-91ea-7250029299b5" />


## Features

- **Multi-format Document Ingestion**: PDF, Word, and scanned image support
- **AI-Powered Analysis**: NLP and ML for completeness and compliance assessment
- **Risk Prediction**: Cost overrun, delay, and environmental risk predictions
- **Interactive Dashboard**: User-friendly interface with visualization
- **Multi-language Support**: English, Hindi, Assamese
- **Offline Functionality**: Works without internet connectivity
- **Real-time Processing**: Fast document analysis and feedback

## Architecture

```
├── backend/           # FastAPI backend server
├── frontend/          # React.js dashboard
├── ml_models/         # Machine learning models and training
├── data/             # Sample data and datasets
├── src/              # Shared utilities and common code
└── docs/             # Documentation and reports
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker (optional)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### ML Models Setup
```bash
cd ml_models
pip install -r requirements.txt
python train_models.py
```

## Technology Stack

- **Backend**: FastAPI, Python
- **Frontend**: React.js, TypeScript, Material-UI
- **ML/AI**: scikit-learn, transformers, spaCy, PyTorch
- **Database**: PostgreSQL, Redis
- **Document Processing**: PyPDF2, python-docx, Tesseract OCR
- **Deployment**: Docker, Kubernetes

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
