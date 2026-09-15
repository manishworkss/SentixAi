import { TMDB_API_KEY, TMDB_BASE_URL } from './src/lib/tmdb.ts';

const fetchPoster = async (id, title) => {
  const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`${title} (${id}): ${data.poster_path}`);
};

fetchPoster(680, "Pulp Fiction");
fetchPoster(157336, "Interstellar");
