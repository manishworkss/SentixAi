import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { tmdb, type TMDBMovie } from '../lib/tmdb';
import { motion, type Variants } from 'framer-motion';
import { MovieCard } from './MovieCard';
import { MovieAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const dynamicItemVariants: Variants = {
  hidden: (i: number) => {
    const directions = [
      { x: -100, y: -100 }, // top-left
      { x: 100, y: -100 },  // top-right
      { x: -100, y: 100 },  // bottom-left
      { x: 100, y: 100 },   // bottom-right
      { x: 0, y: 150 },     // bottom
      { x: 0, y: -150 },    // top
      { x: 150, y: 0 },     // right
      { x: -150, y: 0 }     // left
    ];
    const dir = directions[i % directions.length];
    return {
      opacity: 0,
      x: dir.x,
      y: dir.y,
      scale: 0.5,
      rotate: i % 3 === 0 ? 15 : i % 2 === 0 ? -15 : 0 // dramatic tilts
    };
  },
  show: { 
    opacity: 1, 
    x: 0, 
    y: 0, 
    scale: 1, 
    rotate: 0, 
    transition: { 
      type: "spring", 
      stiffness: 80, 
      damping: 12,
      mass: 1.2
    } 
  }
};

export function MoviesExplorer({ onSelectMovie }: { onSelectMovie?: (id: string) => void }) {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSemantic, setIsSemantic] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [hasClickedLoadMore, setHasClickedLoadMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
        if (isSemantic) {
          // AI Semantic Search
          const aiResults = await MovieAPI.semanticSearch(searchQuery);
          if (aiResults && Array.isArray(aiResults)) {
             results = aiResults.map((m: any) => ({
              id: m.tmdbId || Math.floor(Math.random() * 1000000),
              title: m.title,
              poster_path: m.posterUrl,
              backdrop_path: m.metadata?.backdrop_path || null,
              release_date: m.releaseDate ? m.releaseDate.split('T')[0] : 'Unknown',
              vote_average: m.metadata?.vote_average || 0,
              overview: m.metadata?.overview || ''
            }));
          }
        } else {
          results = await tmdb.searchMovies(searchQuery, pageNum) || [];
        }
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
      setHasClickedLoadMore(false);
      fetchMovies(query, 1);
    }, 400); // 400ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!hasClickedLoadMore || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoading(true); // Prevent multiple triggers
          setTimeout(() => {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(query, nextPage);
          }, 1200); // 1.2s delay for the cool animation effect
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasClickedLoadMore, loading, hasMore, page, query, isSemantic]);

  const handleFirstLoadMore = () => {
    setHasClickedLoadMore(true);
    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(query, nextPage);
    }, 800); // slight delay on click too
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
          placeholder={isSemantic ? "Search by plot (e.g. funny movie in space)..." : "Search by title (e.g. Inception)..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && page === 1 && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-sentix-cyan" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => { 
            if (!currentUser && !isSemantic) {
              setShowPremiumModal(true);
              return;
            }
            setIsSemantic(!isSemantic); 
            setPage(1); 
            setHasClickedLoadMore(false);
            fetchMovies(query, 1); 
          }}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-colors border ${isSemantic ? 'bg-sentix-cyan/20 border-sentix-cyan text-sentix-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-sentix-panel border-sentix-border text-sentix-text hover:text-white hover:border-gray-500'}`}
        >
          ✨ AI Semantic Search
        </button>
        {isSemantic && <span className="text-sm text-sentix-text italic">Searching AI-synced movies only</span>}
      </div>

      {/* Premium Gate Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPremiumModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#110E0E]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none" />
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Unlock AI Search</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Search by mood, feelings, or plot concepts. 
              Create a free SentixAI account to access our powerful semantic search engine.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/login?signup=true" className="w-full py-3.5 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Create Free Account
              </Link>
              <button onClick={() => setShowPremiumModal(false)} className="w-full py-3.5 px-4 text-gray-400 font-bold rounded-xl hover:text-white transition-colors">
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
            {movies.map((movie, index) => (
              <motion.div key={movie.id} custom={index} variants={dynamicItemVariants}>
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
          
          {hasMore && movies.length > 0 && (
            <div className="flex justify-center pt-8 pb-12" ref={loadMoreRef}>
              {!hasClickedLoadMore ? (
                <button 
                  onClick={handleFirstLoadMore}
                  disabled={loading}
                  className="px-8 py-3.5 bg-gradient-to-r from-sentix-panel to-[#2c3440] border border-sentix-cyan/40 text-white font-bold rounded-full shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:border-sentix-cyan transition-all disabled:opacity-50 flex items-center group transform hover:scale-105 active:scale-95"
                >
                  {loading && page > 1 ? <Loader2 className="w-5 h-5 animate-spin mr-2 text-sentix-cyan" /> : null}
                  {loading && page > 1 ? 'Loading...' : 'Want more movies? Click here ✨'}
                </button>
              ) : (
                loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-6 my-8"
                  >
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {/* Outer rotating ring */}
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-sentix-cyan/30"
                      />
                      {/* Middle counter-rotating ring */}
                      <motion.div 
                        animate={{ rotate: -360, scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500/80 border-b-sentix-cyan/80"
                      />
                      {/* Inner pulsing core */}
                      <motion.div 
                        animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-6 h-6 rounded-full bg-sentix-cyan shadow-[0_0_30px_rgba(34,211,238,1)]"
                      />
                      {/* Scanning vertical laser line */}
                      <motion.div
                        animate={{ y: [-45, 45, -45] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-full h-[2px] bg-sentix-cyan/90 shadow-[0_0_15px_rgba(34,211,238,1)]"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <motion.span 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-sentix-cyan font-black tracking-[0.4em] text-[11px] uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                      >
                        Deep Scan Active
                      </motion.span>
                      <span className="text-gray-500 text-[9px] uppercase tracking-widest">Retrieving Neural Patterns...</span>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
