import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Film } from 'lucide-react';
import type { TMDBMovie } from '../lib/tmdb';

interface JournalMovieCardProps {
  movie: TMDBMovie;
}

export function JournalMovieCard({ movie }: JournalMovieCardProps) {
  // Use backdrop if available (16:9), otherwise fallback to poster
  const imageUrl = movie.backdrop_path 
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`)
    : (movie.poster_path 
        ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) 
        : null);

  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' movie trailer')}`;

  const openTrailer = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(trailerUrl, '_blank');
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-sentix-panel rounded-xl overflow-hidden shadow-lg border border-sentix-border flex flex-col group mb-6"
    >
      {/* Image / Trailer Section */}
      <Link to={`/movie/${movie.id}`} className="relative aspect-video w-full bg-sentix-bg overflow-hidden shrink-0 block">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
            <Film className="w-12 h-12 text-sentix-text opacity-50 mb-2" />
          </div>
        )}
        
        {/* Overlay & Play Button */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none">
          <button 
            onClick={openTrailer}
            className="text-white/80 hover:text-white transition-transform hover:scale-110 pointer-events-auto"
            aria-label="Play Trailer"
          >
            <PlayCircle className="w-14 h-14" strokeWidth={1.5} />
          </button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/movie/${movie.id}`}>
          <h3 className="text-xl font-bold text-white mb-2 hover:text-sentix-cyan transition-colors" title={movie.title}>
            {movie.title}
          </h3>
        </Link>
        
        <p className="text-sentix-text text-sm mb-4 leading-relaxed flex-1">
          {movie.overview || "No overview available."}
        </p>

        <Link 
          to={`/movie/${movie.id}`} 
          className="text-sentix-green font-bold text-sm tracking-widest uppercase hover:text-sentix-greenHover transition-colors mt-auto inline-flex items-center"
        >
          Read Story
        </Link>
      </div>
    </motion.div>
  );
}
