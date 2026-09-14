from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import chromadb
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SentixAI ML Service", version="1.0")

logger.info("Loading SentenceTransformer model...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

logger.info("Loading Sentiment pipeline...")
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

logger.info("Loading Zero-Shot Aspect pipeline...")
aspect_analyzer = pipeline("zero-shot-classification", model="typeform/distilbert-base-uncased-mnli")

logger.info("Initializing ChromaDB...")
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="movies")

class EmbedRequest(BaseModel):
    texts: List[str]

class SentimentRequest(BaseModel):
    texts: List[str]

class AspectRequest(BaseModel):
    texts: List[str]
    labels: List[str]

class MovieInsertRequest(BaseModel):
    id: str
    title: str
    text: str
    metadata: dict

class SearchRequest(BaseModel):
    query: str
    n_results: int = 5

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "ML Service is running"}

@app.post("/embed")
def get_embeddings(req: EmbedRequest):
    try:
        embeddings = embedder.encode(req.texts)
        return {"embeddings": embeddings.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sentiment")
def get_sentiment(req: SentimentRequest):
    try:
        results = sentiment_analyzer(req.texts)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/aspects")
def get_aspects(req: AspectRequest):
    try:
        results = aspect_analyzer(req.texts, req.labels, multi_label=True)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/movies")
def add_movie(req: MovieInsertRequest):
    try:
        embedding = embedder.encode([req.text])[0].tolist()
        collection.add(
            ids=[req.id],
            embeddings=[embedding],
            metadatas=[{**req.metadata, "title": req.title}],
            documents=[req.text]
        )
        return {"status": "success", "id": req.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search_movies(req: SearchRequest):
    try:
        query_embedding = embedder.encode([req.query])[0].tolist()
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=req.n_results
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

