import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, TMDB_IMAGE_BASE, TMDB_IMAGE_BASE_ORIGINAL } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';
import { Film, Star, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MovieAPI } from '../api';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (id) {
      tmdb.getMovieDetails(Number(id)).then(m => {
        setMovie(m);
        setLoading(false);
        if (m) {
          MovieAPI.searchMovies(m.title)
            .then((res: any) => {
              const internalMovie = Array.isArray(res) ? res[0] : null;
              if (internalMovie) {
                return MovieAPI.getMovieReviews(internalMovie.id);
              }
              return null;
            })
            .then((revs: any) => {
              if (revs && revs.reviews) {
                setReviews(revs.reviews);
              }
            })
            .catch(console.error);
        }
      });
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#14181c] flex items-center justify-center text-[#9ab]">Loading...</div>;
  }

  if (!movie) {
    return <div className="min-h-screen bg-[#14181c] flex items-center justify-center text-white">Movie not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#14181c] text-[#9ab] font-sans">
      
      {/* Header */}
      <header className="bg-[#1e252b] border-b border-[#2c3440] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SentixAI Logo" className="h-10 object-contain drop-shadow-lg" />
            <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
              Sentix<span className="text-[#00B4D8] font-black">[Ai]</span>
            </span>
          </Link>
          
          <div className="flex items-center space-x-6 text-sm font-semibold text-[#9ab] uppercase tracking-wider">
            <Link to="/" className="hover:text-white transition-colors">Films</Link>
            {currentUser ? (
              <div className="flex items-center space-x-4 border-l border-[#2c3440] pl-6">
                <Link to="/dashboard" className="text-white hover:text-[#00B4D8] transition-colors">{currentUser.email}</Link>
                <button onClick={logout} className="text-[#9ab] hover:text-red-500 transition-colors flex items-center" title="Log Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 border-l border-[#2c3440] pl-6">
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link to="/login?signup=true" className="bg-[#00e054] text-[#14181c] px-4 py-2 rounded-md hover:bg-[#00b042] transition-colors shadow-sm">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div className="w-full h-[50vh] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/60 to-transparent z-10"></div>
        {movie.backdrop_path && (
          <img 
            src={movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `${TMDB_IMAGE_BASE_ORIGINAL}${movie.backdrop_path}`} 
            alt={movie.title}
            className="w-full h-full object-cover object-top"
          />
        )}
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 -mt-32 relative z-20 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Poster Column */}
          <div className="w-48 md:w-64 flex-shrink-0">
            <div className="rounded-md overflow-hidden bg-[#2c3440] shadow-2xl border border-[#2c3440]">
              {movie.poster_path ? (
                <img 
                  src={movie.poster_path.startsWith('http') ? movie.poster_path : `${TMDB_IMAGE_BASE}${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center text-center p-4">
                  <span className="text-white font-semibold">{movie.title}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex flex-col space-y-2">
              <button className="w-full bg-[#2c3440] hover:bg-[#445566] text-white py-2 rounded-md font-semibold transition-colors flex items-center justify-center">
                <MessageSquare className="w-4 h-4 mr-2 text-[#00e054]" />
                Log or Review
              </button>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 mt-4 md:mt-10">
            <h1 className="text-4xl font-bold text-white mb-2 font-serif">{movie.title} <span className="text-[#9ab] font-normal text-2xl">{movie.release_date.split('-')[0]}</span></h1>
            
            <div className="flex items-center space-x-6 text-sm mb-6 border-b border-[#2c3440] pb-4">
              <div className="flex items-center text-white">
                <Star className="w-4 h-4 text-[#00e054] mr-2 fill-current" />
                <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                <span className="text-[#9ab] ml-1">/ 10</span>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-[#9ab] mb-10 max-w-3xl">
              {movie.overview}
            </p>

            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#9ab] border-b border-[#2c3440] pb-2 mb-4">Recent Reviews</h3>
            
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={r.id || i} className="bg-[#1e252b] p-4 rounded-md border border-[#2c3440]">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500"></div>
                      <span className="font-bold text-white text-sm">{r.externalReviewId ? r.externalReviewId.replace('csv_', '').split('_')[0] : "Anonymous"}</span>
                      <div className="flex items-center text-[#00e054]">
                        {Array.from({ length: Math.ceil((r.rating || 10) / 2) }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#9ab] whitespace-pre-wrap">{r.reviewText}</p>
                  </div>
                ))
              ) : (
                <div className="text-[#9ab] italic">No reviews yet. Be the first to review!</div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
