const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

// Fallback data if API key is missing
const FALLBACK_MOVIES: TMDBMovie[] = [
  {
    id: 155,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker."
  },
  {
    id: 27205,
    title: "Inception",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious."
  },
  {
    id: 19995,
    title: "Avatar",
    poster_path: "/kyeqWdyKINLSywicfVjKpXkmCne.jpg",
    backdrop_path: "/vL5LR6WdxWPjIgRVYGiZpGgoOK.jpg",
    release_date: "2009-12-15",
    vote_average: 7.6,
    overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization."
  },
  {
    id: 1858,
    title: "Transformers",
    poster_path: "/432BowXw7a4bMAKJcBAEevsiA8k.jpg",
    backdrop_path: "/zvG5J7s5zXjPZc0v2Q1Icb0VlUv.jpg",
    release_date: "2007-06-27",
    vote_average: 6.8,
    overview: "Young teenager, Sam Witwicky becomes involved in the ancient struggle between two extraterrestrial factions of transforming robots – the heroic Autobots and the evil Decepticons. Sam holds the clue to unimaginable power and the Decepticons will stop at nothing to retrieve it."
  },
  {
    id: 419430,
    title: "Get Out",
    poster_path: "/tFXcEccSQAmRoIdcgGOSNptm10e.jpg",
    backdrop_path: "/2qO9bImrLgAiywS4uUARwEwK0Tj.jpg",
    release_date: "2017-02-24",
    vote_average: 7.6,
    overview: "Chris and his girlfriend Rose go upstate to visit her parents for the weekend. At first, Chris reads the family's overly accommodating behavior as nervous attempts to deal with their daughter's interracial relationship, but as the weekend progresses, a series of increasingly disturbing discoveries lead him to a truth that he never could have imagined."
  }
];

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export const tmdb = {
  getPopularMovies: async (): Promise<TMDBMovie[]> => {
    if (!TMDB_API_KEY) return FALLBACK_MOVIES;
    
    try {
      const res = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      if (!res.ok) throw new Error('TMDB fetch failed');
      const data = await res.json();
      return data.results;
    } catch (e) {
      console.warn("TMDB API Error, using fallback data.");
      return FALLBACK_MOVIES;
    }
  },

  getMovieDetails: async (id: number): Promise<TMDBMovie | null> => {
    if (!TMDB_API_KEY) {
      return FALLBACK_MOVIES.find(m => m.id === id) || null;
    }

    try {
      const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`);
      if (!res.ok) throw new Error('TMDB fetch failed');
      return await res.json();
    } catch (e) {
      return FALLBACK_MOVIES.find(m => m.id === id) || null;
    }
  }
};
