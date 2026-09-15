import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const TMDB_API_KEY = "2e8993eccb4fe608177d39af9a14ed4c";

async function getPopular() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  const res = await fetch(url);
  const data = await res.json();
  
  const movies = data.results.slice(0, 15);
  
  let output = "const MOCK_FAVORITES: TMDBMovie[] = [\n";
  for (const m of movies) {
    const title = m.title.replace(/"/g, '\\"');
    const releaseDate = m.release_date ? m.release_date.substring(0, 4) : '';
    output += `  {
    id: ${m.id},
    title: "${title}",
    poster_path: "${m.poster_path}",
    backdrop_path: "${m.backdrop_path}",
    release_date: "${releaseDate}",
    vote_average: ${m.vote_average},
    overview: ""
  },\n`;
  }
  output += "];";
  
  fs.writeFileSync('mock_movies.ts', output);
  console.log("Done");
}

getPopular();
