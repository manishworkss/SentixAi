import React, { useEffect, useState } from 'react';
import { tmdb, TMDB_IMAGE_BASE } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { MovieCard } from '../components/MovieCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function Home() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    tmdb.getPopularMovies().then(setMovies);
  }, []);

  return (
    <div className="w-full">
      
      {/* Hero Section */}
      {!currentUser && (
        <section className="relative overflow-hidden bg-sentix-panel">
          <div className="absolute inset-0 bg-gradient-to-b from-sentix-bg via-transparent to-sentix-bg z-10 pointer-events-none"></div>
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.5, ease: "easeOut" as const }}
            className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg')] bg-cover bg-center mix-blend-luminosity"
          ></motion.div>
          
          <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 relative z-20 flex flex-col items-center text-center">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" as const }}
              className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight drop-shadow-lg"
            >
              Track films you've watched. <br/> Save those you want to see. <br/> Tell your friends what's good.
            </motion.h1>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" as const }}
              className="text-lg md:text-2xl text-sentix-text max-w-2xl mb-10 font-medium drop-shadow-md"
            >
              The social network for film lovers. Powered by AI sentiment analysis.
            </motion.p>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" as const }}
            >
              <Link 
                to="/login?signup=true" 
                className="inline-block bg-sentix-green text-sentix-bg px-10 py-4 rounded-xl font-bold text-lg hover:bg-sentix-greenHover transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,224,84,0.4)]"
              >
                Get Started — It's Free!
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Popular Movies Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center space-x-2 mb-8 border-b border-sentix-border pb-3">
          <TrendingUp className="w-5 h-5 text-sentix-text" />
          <h2 className="text-sentix-text uppercase tracking-widest text-sm font-semibold">Popular Films This Week</h2>
        </div>

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
      </main>

    </div>
  );
}
