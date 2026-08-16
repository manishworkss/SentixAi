import React, { useState, useEffect } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, Film, Star } from 'lucide-react';
import { MovieAPI } from '../api';

export function MoviesExplorer({ onSelectMovie }: { onSelectMovie: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchMovies = async (searchQuery: string, p: number) => {
    setLoading(true);
    try {
      const res = await MovieAPI.searchMovies(searchQuery, p);
      setMovies(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchMovies(query, page);
    }, 400); // 400ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [query, page]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto h-full pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Movie Explorer</h1>
          <p className="text-slate-500 mt-1">Search the database and inspect movie-level sentiment analytics.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-sm"
          placeholder="Search by title (e.g. The Dark Knight) or IMDb ID (e.g. tt0468569)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1); // Reset page on new query
          }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Results Grid */}
      {movies.length === 0 && !loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center">
          <Film className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-800">No movies found</h3>
          <p className="text-slate-500 mt-1">Try a different search term or clear the filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              onClick={() => onSelectMovie(movie.id)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-400 hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <Film className="h-5 w-5 text-slate-600" />
                </div>
                {movie.imdbId && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded-md">
                    {movie.imdbId}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2">{movie.title}</h3>
              <p className="text-slate-500 text-sm mt-auto">
                {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Unknown Year'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          <span className="text-sm text-slate-600">
            Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
