import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import type { TMDBMovie } from '../lib/tmdb';

interface MovieCardProps {
  movie: TMDBMovie;
  layoutId?: string;
  className?: string;
}

export function MovieCard({ movie, layoutId, className = '' }: MovieCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative group rounded-xl overflow-hidden bg-sentix-panel border border-sentix-border shadow-lg ${className}`}
    >
      <Link to={`/movie/${movie.id}`} className="block w-full h-full">
        {movie.poster_path ? (
          <img
            src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-sentix-bg">
            <Film className="w-12 h-12 text-sentix-text mb-2 opacity-50" />
            <span className="text-xs text-sentix-text text-center px-2">{movie.title}</span>
          </div>
        )}
        
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-sentix-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-bold text-sm line-clamp-2 shadow-sm">
              {movie.title}
            </h3>
            <div className="text-sentix-cyan text-xs font-medium mt-1">
              {movie.release_date?.substring(0, 4)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
