import React from 'react';
import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';

export const StackedPosters = ({ movies }: { movies: TMDBMovie[] }) => {
  // Ensure we always try to render 5 slots. If not enough posters, just use empty bg.
  const displayMovies = Array.from({ length: 5 }).map((_, i) => movies[i] || null);

  return (
    <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden flex border border-white/10 bg-[#14181c]">
      {displayMovies.map((movie, index) => {
        const isCenter = index === 2;
        return (
          <div 
            key={index} 
            className={`relative h-full ${isCenter ? 'flex-grow z-10 shadow-2xl' : 'w-[15%] z-0'}`}
            style={{
              zIndex: isCenter ? 10 : (index < 2 ? index : 4 - index),
              boxShadow: isCenter ? '0 0 20px rgba(0,0,0,0.8)' : 'none'
            }}
          >
            {movie ? (
              <Link 
                to={`/movie/${movie.id}`}
                onClick={(e) => e.stopPropagation()} 
                className="block w-full h-full cursor-pointer transition-transform hover:scale-105"
                title={movie.title}
              >
                <img 
                  src={`${TMDB_IMAGE_BASE}${movie.poster_path}`} 
                  alt={movie.title} 
                  className="w-full h-full object-cover"
                  style={{
                    filter: isCenter ? 'none' : 'brightness(0.6)'
                  }}
                />
              </Link>
            ) : (
              <div className="w-full h-full bg-[#1a2026]" />
            )}
            
            {/* Dark gradient overlays for edge posters to blend them */}
            {!isCenter && index < 2 && (
              <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent mix-blend-multiply pointer-events-none" />
            )}
            {!isCenter && index > 2 && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent mix-blend-multiply pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
};
