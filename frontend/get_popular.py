import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('VITE_TMDB_API_KEY')

url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&language=en-US&page=1"
res = requests.get(url).json()

movies = res.get('results', [])[:15]

output = "const MOCK_FAVORITES: TMDBMovie[] = [\n"
for m in movies:
    output += f"""  {{
    id: {m['id']},
    title: "{m['title'].replace('"', '\\"')}",
    poster_path: "{m['poster_path']}",
    backdrop_path: "{m['backdrop_path']}",
    release_date: "{m.get('release_date', '')[:4]}",
    vote_average: {m['vote_average']},
    overview: ""
  }},
"""
output += "];"

with open('mock_movies.ts', 'w') as f:
    f.write(output)
print("Done")
