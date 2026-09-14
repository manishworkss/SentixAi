from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import uvicorn
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SentixAI ML Service", version="1.0")

# Load models locally on startup
logger.info("Loading SentenceTransformer model...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

logger.info("Loading Sentiment pipeline...")
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

class EmbedRequest(BaseModel):
    texts: List[str]

class SentimentRequest(BaseModel):
    texts: List[str]

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "ML Service is running"}

@app.post("/embed")
def get_embeddings(req: EmbedRequest):
    try:
        embeddings = embedder.encode(req.texts)
        return {"embeddings": embeddings.tolist()}
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sentiment")
def get_sentiment(req: SentimentRequest):
    try:
        results = sentiment_analyzer(req.texts)
        # Results format: [{'label': 'POSITIVE', 'score': 0.99}, ...]
        return {"results": results}
    except Exception as e:
        logger.error(f"Error generating sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
