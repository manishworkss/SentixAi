import React, { useEffect, useState } from 'react';
import { tmdb, TMDB_IMAGE_BASE } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';
import { Link } from 'react-router-dom';
import { TrendingUp, CalendarDays, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { JournalMovieCard } from '../components/JournalMovieCard';

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
  const [popularThisWeek, setPopularThisWeek] = useState<TMDBMovie[]>([]);
  const [popular2026, setPopular2026] = useState<TMDBMovie[]>([]);
  const [popular2025, setPopular2025] = useState<TMDBMovie[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fetch all categories simultaneously
    Promise.all([
      tmdb.getPopularMovies(),
      tmdb.getMoviesByYear(2026),
      tmdb.getMoviesByYear(2025)
    ]).then(([thisWeek, movies2026, movies2025]) => {
      setPopularThisWeek(thisWeek);
      setPopular2026(movies2026);
      setPopular2025(movies2025);
    });
  }, []);

  return (
    <div className="w-full pb-12">

      {/* Hero Section */}
      {!currentUser && (
        <section className="relative min-h-[85vh] flex items-center bg-[#0a0c10] mb-12 border-b border-white/5">
          {/* Background Image & Gradients */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg"
              alt="Hero Background"
              className="w-full h-full object-cover object-top mix-blend-screen opacity-50"
            />
            {/* Dark gradient from left */}
            <div className="absolute inset-0 bg-gradient-to-r from-sentix-bg via-sentix-bg/80 to-transparent"></div>
            {/* Dark gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-sentix-bg via-transparent to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full relative z-20 flex flex-col pt-24 pb-10 h-full justify-between">

            <div className="flex flex-col lg:flex-row w-full justify-between gap-12 mt-10">

              {/* Left Side: Typography */}
              <div className="w-full lg:w-[60%]">
                <motion.h1
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                  className="font-serif font-black uppercase text-white text-3xl md:text-5xl lg:text-[3.2rem] leading-[1.05] tracking-tight drop-shadow-2xl"
                >
                  Track films you've watched. <br />
                  Save those you want to see. <br />
                  Tell your friends what's good.
                </motion.h1>

                {/* Subtitle & Get Started button inline block */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="mt-10 lg:mt-12 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8"
                >
                  <p className="text-xl md:text-2xl text-sentix-text font-medium max-w-sm leading-snug">
                    The social network for film lovers. Powered by AI sentiment analysis.
                  </p>

                  <Link
                    to="/login?signup=true"
                    className="inline-block bg-sentix-green text-sentix-bg px-10 py-4 rounded-full font-bold text-lg hover:bg-[#00c94b] transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(0,224,84,0.3)] hover:shadow-[0_0_60px_rgba(0,224,84,0.5)] whitespace-nowrap"
                  >
                    Get Started — It's Free!
                  </Link>
                </motion.div>
              </div>

              {/* Right Side: Films This Week Carousel */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="w-full lg:w-[40%] flex flex-col justify-end lg:pt-8"
              >
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-white font-serif tracking-widest text-xl uppercase font-bold drop-shadow-md">Films This Week</h3>
                  <div className="flex space-x-2">
                    <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white transition-colors backdrop-blur-sm">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white transition-colors backdrop-blur-sm">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                  {popularThisWeek.slice(0, 15).map((movie) => (
                    <Link to={`/movie/${movie.id}`} key={movie.id} className="min-w-[150px] w-[150px] md:min-w-[180px] md:w-[180px] shrink-0 rounded-2xl overflow-hidden relative group snap-start shadow-xl border border-white/10">
                      <img
                        src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : ''}
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 flex items-center space-x-1.5 shadow-lg">
                          <Heart className="w-3.5 h-3.5 text-sentix-green fill-sentix-green" />
                          <span className="text-white text-xs font-bold">{movie.vote_average ? (movie.vote_average).toFixed(1) : 'NR'}/10</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* Bottom Row: Spotlight */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-16 w-full max-w-[320px]"
            >
              <div className="bg-[#1c2228]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-sentix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h4 className="text-white font-bold text-[15px] mb-3 relative z-10">Community Spotlight</h4>
                <p className="text-sentix-text text-[13px] leading-relaxed mb-5 relative z-10">
                  Real-time review. <span className="text-[#3b82f6]">@manishwrelias</span> inold film owers. She's criastess thoma soout choince..Soavs tamight of the resules...
                </p>
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center space-x-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=manish" alt="User" className="w-9 h-9 rounded-full bg-[#14181c] border border-sentix-border" />
                    <div>
                      <div className="text-white text-xs font-bold">manishwork</div>
                      <div className="text-sentix-text text-[10px]">@manishworks</div>
                    </div>
                  </div>
                  <div className="flex space-x-0.5 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 text-[#404c56]" />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>
      )}

      {/* Main Content Sections */}
      <main className="max-w-6xl mx-auto px-4 space-y-16 mt-8">

        {/* Popular Films This Week */}
        <section>
          <div className="flex items-center space-x-2 mb-8 border-b border-sentix-border pb-3">
            <TrendingUp className="w-5 h-5 text-sentix-text" />
            <h2 className="text-sentix-text uppercase tracking-widest text-sm font-semibold">Popular Films This Week</h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="columns-1 md:columns-2 lg:columns-4 gap-6 space-y-6"
          >
            {popularThisWeek.map((movie) => (
              <motion.div key={movie.id} variants={itemVariants} className="break-inside-avoid">
                <JournalMovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Popular Films in 2026 */}
        <section>
          <div className="flex items-center space-x-2 mb-8 border-b border-sentix-border pb-3">
            <CalendarDays className="w-5 h-5 text-sentix-text" />
            <h2 className="text-sentix-text uppercase tracking-widest text-sm font-semibold">Popular Films in 2026</h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="columns-1 md:columns-2 lg:columns-4 gap-6 space-y-6"
          >
            {popular2026.map((movie) => (
              <motion.div key={movie.id} variants={itemVariants} className="break-inside-avoid">
                <JournalMovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Popular Films in 2025 */}
        <section>
          <div className="flex items-center space-x-2 mb-8 border-b border-sentix-border pb-3">
            <CalendarDays className="w-5 h-5 text-sentix-text" />
            <h2 className="text-sentix-text uppercase tracking-widest text-sm font-semibold">Popular Films in 2025</h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="columns-1 md:columns-2 lg:columns-4 gap-6 space-y-6"
          >
            {popular2025.map((movie) => (
              <motion.div key={movie.id} variants={itemVariants} className="break-inside-avoid">
                <JournalMovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        </section>

      </main>
    </div>
  );
}
