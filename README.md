# SentixAI - Movie Review Intelligence Platform

SentixAI is an enterprise-grade movie review intelligence platform featuring a modern, AI-powered analytics dashboard a nd real-time audience sentiment tracking. It collects reviews from multiple sources, analyzes sentiment using advanced NLP models, and provides actionable insights through interactive visualizations.

## Features

### Audience Intelligence Platform
- **Multi-Source Review Aggregation**: Collects reviews from YouTube, Twitter, and other platforms.
- **Real-Time Sentiment Analysis**: Tracks audience sentiment as it evolves.
- **Topic Extraction**: Identifies key topics and themes in discussions.
- **Trend Monitoring**: Visualizes sentiment trends over time.

### Analytics & Data Processing
- **Automated Workflows**: End-to-end pipeline for review collection, processing, and analysis.
- **Data Transformation**: Cleans, normalizes, and enriches review data.
- **Sentiment Scoring**: Assigns sentiment scores to individual reviews.
- **Data Export**: Export processed data to CSV and JSON formats.

### Modern Web Dashboard
- **SaaS-Ready UI**: Professional, responsive web interface for enterprise users.
- **Interactive Visualizations**: Charts and graphs for data exploration.
- **User Authentication**: Secure login and user management.
- **Role-Based Access Control**: Differentiated access for different user roles.

### Developer Experience
- **TypeScript Support**: Type-safe codebase with TypeScript.
- **Modern Tech Stack**: React, Next.js, Tailwind CSS, FastAPI.
- **Dockerized**: Easy deployment with Docker and Docker Compose.
- **Modular Architecture**: Clean separation of concerns between frontend, backend, and processing layers.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **NLP**: spaCy, Hugging Face Transformers
- **Data Processing**: Pandas, NumPy
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: passlib

### Infrastructure
- **Database**: PostgreSQL (or MySQL)
- **Message Queue**: Redis
- **Containerization**: Docker, Docker Compose
- **Deployment**: Docker-based deployment

## Project Structure

```
SentixAI/
├── backend/               # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration and utilities
│   │   ├── models/         # Pydantic models and SQLAlchemy models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── data/               # Raw data and datasets
│   ├── processing/         # Data processing scripts
│   ├── tests/              # Unit tests
│   └── requirements.txt    # Python dependencies
├── frontend/              # Next.js frontend application
│   ├── app/                # Next.js app router
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utility functions and API clients
│   └── public/             # Static assets
├── docker/                # Docker configurations
├── scripts/               # Utility scripts
├── README.md              # Project documentation
└── .gitignore             # Git ignore file
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker and Docker Compose

### Installation

#### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SentixAI
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - Adminer (Database UI): [http://localhost:8080](http://localhost:8080)

#### Option 2: Local Installation

1. **Backend Setup**
   ```bash
   cd backend
   python3.10 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Run Backend**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

4. **Run Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

### User Authentication

**Default Credentials**:
- Email: [EMAIL_ADDRESS]`
- Password: `admin123`

### Processing Pipeline

The processing pipeline can be triggered manually or automatically (if configured with cron or schedulers).

**Manual Processing**:
```bash
cd backend
python processing/process_reviews.py --input data/raw_reviews.csv --output data/processed_reviews.csv
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Sentiment Analysis
- `POST /api/sentiment/analyze` - Analyze text for sentiment
- `POST /api/sentiment/bulk` - Batch sentiment analysis

### Data Processing
- `POST /api/processing/upload` - Upload and process review data
- `GET /api/processing/status` - Check processing status

### Dashboards
- `GET /api/dashboards/overall` - Get overall sentiment dashboard
- `GET /api/dashboards/trends` - Get sentiment trends over time
- `GET /api/dashboards/topics` - Get key topics and themes

## Docker Configuration

The `docker/` directory contains:
- `docker-compose.yml` - Orchestrates all services (backend, frontend, database, redis, adminer)
- `Dockerfile.backend` - Backend Docker image
- `Dockerfile.frontend` - Frontend Docker image
- `nginx.conf` - Nginx reverse proxy configuration

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or issues, please contact:
- Email: [EMAIL_ADDRESS]`

## Acknowledgments

- **spaCy** - Industrial-strength NLP library
- **Hugging Face Transformers** - State-of-the-art NLP models
- **FastAPI** - Modern Python web framework
- **Next.js** - React framework for production
- **Tailwind CSS** - Utility-first CSS framework
