import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('VITE_TMDB_API_KEY')

def get_poster(movie_id, title):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}"
    res = requests.get(url).json()
    print(f"{title}: {res.get('poster_path')}")

get_poster(680, "Pulp Fiction")
get_poster(157336, "Interstellar")
