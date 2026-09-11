import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { tmdb, type TMDBMovie } from '../lib/tmdb';
import { motion } from 'framer-motion';
import { MovieCard } from './MovieCard';
import { MovieAPI } from '../api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function MoviesExplorer({ onSelectMovie }: { onSelectMovie?: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = async (searchQuery: string, pageNum: number) => {
    setLoading(true);
    if (pageNum === 1) setError('');
    try {
      let results: TMDBMovie[] = [];
      let demoResults: TMDBMovie[] = [];

      // Fetch demo movies from our backend on page 1
      if (pageNum === 1 && searchQuery.trim() === '') {
        try {
          const localPop = await MovieAPI.searchMovies('');
          if (localPop && Array.isArray(localPop)) {
            const demoLocal = localPop.filter((m: any) => m.imdbId?.startsWith('demo-tt'));
            demoResults = demoLocal.map((m: any) => ({
              id: m.tmdbId || Math.floor(Math.random() * 1000000),
              title: m.title + ' (DEMO)',
              poster_path: m.posterUrl,
              backdrop_path: m.metadata?.backdrop_path || null,
              release_date: m.releaseDate ? m.releaseDate.split('T')[0] : 'Unknown',
              vote_average: m.metadata?.vote_average || 0,
              overview: m.metadata?.overview || ''
            }));
          }
        } catch (e) {
          console.error("Failed fetching demo data", e);
        }
      }

      if (searchQuery.trim() === '') {
        results = await tmdb.getPopularMovies(pageNum) || [];
      } else {
        results = await tmdb.searchMovies(searchQuery, pageNum) || [];
      }
      
      // Merge demo results
      if (demoResults.length > 0) {
        // Filter out TMDB results that are exactly the demo movies to prevent duplicates visually
        const demoTmdbIds = new Set(demoResults.map(d => d.id));
        results = [...demoResults, ...results.filter(r => !demoTmdbIds.has(r.id))];
      }
      
      if (pageNum === 1) {
        setMovies(results);
      } else {
        setMovies(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = results.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
      }
      
      setHasMore(results.length > 0);
    } catch (err) {
      console.error(err);
      if (pageNum === 1) {
        setError('Failed to fetch movies. Please try again.');
        setMovies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchMovies(query, 1);
    }, 400); // 400ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(query, nextPage);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Movie Explorer</h1>
          <p className="text-sentix-text mt-1">Search or browse popular movies in the database.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-sentix-text" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-sentix-panel border border-sentix-border rounded-xl text-white placeholder-sentix-text focus:outline-none focus:ring-2 focus:ring-sentix-cyan focus:border-transparent shadow-sm transition-all"
          placeholder="Search by title (e.g. Inception)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && page === 1 && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-sentix-cyan" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg font-bold">
          {error}
        </div>
      )}

      {/* Movies Grid */}
      {!loading && movies.length === 0 && !error ? (
        <div className="text-center py-20 bg-sentix-panel rounded-2xl border border-sentix-border shadow-lg">
          <Search className="mx-auto h-12 w-12 text-sentix-border mb-4" />
          <h3 className="text-lg font-bold text-white">No movies found</h3>
          <p className="text-sentix-text mt-1 font-medium">Try adjusting your search terms.</p>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {movies.map((movie) => (
              <motion.div key={movie.id} variants={itemVariants}>
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
          
          {hasMore && movies.length > 0 && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-sentix-panel border border-sentix-border text-white font-bold rounded-xl shadow-md hover:border-sentix-cyan hover:text-sentix-cyan transition-colors disabled:opacity-50 flex items-center"
              >
                {loading && page > 1 ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading && page > 1 ? 'Loading...' : 'Load More Movies'}
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
