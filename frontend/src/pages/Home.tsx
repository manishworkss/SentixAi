import React, { useEffect, useState } from 'react';
import { tmdb, TMDB_IMAGE_BASE } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';
import { Link } from 'react-router-dom';
import { Film, Star, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    tmdb.getPopularMovies().then(setMovies);
  }, []);

  return (
    <div className="min-h-screen bg-[#14181c] text-[#9ab] font-sans">
      
      {/* Header */}
      <header className="bg-[#1e252b] border-b border-[#2c3440] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SentixAI Logo" className="h-10 object-contain drop-shadow-lg" />
            <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
              Sentix<span className="text-[#00B4D8] font-black">[Ai]</span>
            </span>
          </Link>
          
          <div className="flex items-center space-x-6 text-sm font-semibold text-[#9ab] uppercase tracking-wider">
            <Link to="/" className="hover:text-white transition-colors">Films</Link>
            <Link to="/" className="hover:text-white transition-colors">Reviews</Link>
            
            {currentUser ? (
              <div className="flex items-center space-x-4 ml-6 border-l border-[#2c3440] pl-6">
                <Link to="/dashboard" className="text-white hover:text-[#00B4D8] transition-colors">{currentUser.email}</Link>
                <button onClick={logout} className="text-[#9ab] hover:text-red-500 transition-colors flex items-center" title="Log Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-6 border-l border-[#2c3440] pl-6">
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link to="/login?signup=true" className="bg-[#00e054] text-[#14181c] px-4 py-2 rounded-md hover:bg-[#00b042] transition-colors shadow-sm">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!currentUser && (
        <section className="relative overflow-hidden bg-[#1e252b]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#14181c] via-transparent to-[#14181c] z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg')] bg-cover bg-center opacity-10"></div>
          
          <div className="max-w-6xl mx-auto px-4 py-20 relative z-20 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
              Track films you've watched. <br/> Save those you want to see. <br/> Tell your friends what's good.
            </h1>
            <p className="text-lg md:text-xl text-[#9ab] max-w-2xl mb-10">
              The social network for film lovers. Powered by AI sentiment analysis.
            </p>
            <Link to="/login?signup=true" className="bg-[#00e054] text-[#14181c] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00b042] transition-all transform hover:scale-105 shadow-lg">
              Get Started — It's Free!
            </Link>
          </div>
        </section>
      )}

      {/* Popular Movies Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center space-x-2 mb-6 border-b border-[#2c3440] pb-2">
          <TrendingUp className="w-5 h-5 text-[#9ab]" />
          <h2 className="text-[#9ab] uppercase tracking-widest text-sm font-semibold">Popular Films This Week</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <Link 
              key={movie.id} 
              to={`/movie/${movie.id}`}
              className="group relative rounded-md overflow-hidden bg-[#2c3440] aspect-[2/3] block border border-[#2c3440] hover:border-[#00e054] transition-colors shadow-sm hover:shadow-[0_0_15px_rgba(0,224,84,0.3)]"
            >
              {movie.poster_path ? (
                <img 
                  src={movie.poster_path.startsWith('http') ? movie.poster_path : `${TMDB_IMAGE_BASE}${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center p-4">
                  <span className="text-white font-semibold">{movie.title}</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <h3 className="text-white font-bold text-sm leading-tight">{movie.title}</h3>
                <div className="flex items-center text-[#00e054] text-xs mt-1 font-bold">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  {movie.vote_average.toFixed(1)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

    </div>
  );
}
