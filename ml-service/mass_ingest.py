import os
import requests
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

TMDB_API_KEY = "2e8993eccb4fe608177d39af9a14ed4c"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
NODE_SYNC_URL = "http://127.0.0.1:3001/api/movies/sync"

def sync_movie_to_backend(movie):
    if not movie.get('overview'):
        return False
        
    payload = {
        "id": str(movie['id']),
        "title": movie.get('title') or movie.get('original_title', ''),
        "release_date": movie.get('release_date', ''),
        "poster_path": movie.get('poster_path', ''),
        "overview": movie.get('overview', '')
    }
    
    try:
        res = requests.post(NODE_SYNC_URL, json=payload, timeout=5)
        if res.status_code == 200:
            return True
        else:
            logger.error(f"Failed to sync {payload['title']}: {res.text}")
            return False
    except Exception as e:
        logger.error(f"Error syncing {payload['title']}: {e}")
        return False

def ingest_category(category, max_pages=10):
    logger.info(f"--- Ingesting {category} movies (up to {max_pages} pages) ---")
    url = f"{TMDB_BASE_URL}/movie/{category}?api_key={TMDB_API_KEY}&language=en-US"
    
    total_synced = 0
    for page in range(1, max_pages + 1):
        try:
            res = requests.get(f"{url}&page={page}", timeout=10)
            if res.status_code != 200:
                logger.error(f"TMDB API error on page {page}: {res.text}")
                break
                
            data = res.json()
            results = data.get('results', [])
            
            if not results:
                break
                
            for movie in results:
                success = sync_movie_to_backend(movie)
                if success:
                    total_synced += 1
                    
            logger.info(f"Category '{category}': Synced page {page}/{max_pages}. Total so far: {total_synced}")
            
            # Respect rate limits (TMDB allows ~40 req/sec, but our local ML service doing embeddings might take a bit of CPU)
            # We sleep a bit between pages to not fry the user's CPU since embeddings are generated in real-time.
            time.sleep(2)
            
        except Exception as e:
            logger.error(f"Error on page {page}: {e}")
            break
            
    logger.info(f"Finished {category}. Total Synced: {total_synced}")

if __name__ == "__main__":
    logger.info("Starting Mass Ingestion Script...")
    
    # 1. Ingest all upcoming and now playing movies (usually 1-3 pages each)
    ingest_category("upcoming", max_pages=5)
    ingest_category("now_playing", max_pages=5)
    
    # 2. Ingest popular and top rated movies (Top 100 pages = 2000 movies each)
    # We will do 50 pages for popular (1000 movies) as a solid base. The user can run this script with more pages if they want.
    ingest_category("popular", max_pages=50)
    ingest_category("top_rated", max_pages=50)
    
    logger.info("Mass Ingestion Complete!")
