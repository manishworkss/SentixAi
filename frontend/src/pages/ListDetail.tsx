import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ListAPI } from '../api';
import { Loader2, ArrowLeft, Trash2, Film } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TMDB_IMAGE_BASE } from '../lib/tmdb';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { currentUser } = useAuth();

  const fetchList = async () => {
    try {
      const res = await ListAPI.getList(id!);
      setList(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && id) {
      fetchList();
    } else {
      setLoading(false);
    }
  }, [currentUser, id]);

  const handleRemoveMovie = async (movieId: string) => {
    if (!confirm('Remove this movie from the list?')) return;
    try {
      await ListAPI.removeMovieFromList(id!, movieId);
      fetchList(); // refresh
    } catch (e) {
      alert('Failed to remove movie');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-sentix-bg flex items-center justify-center text-sentix-text"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!list) {
    return <div className="min-h-screen bg-sentix-bg flex items-center justify-center text-white">List not found or you don't have access.</div>;
  }

  return (
    <div className="w-full font-sans pb-20">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <Link to="/lists" className="inline-flex items-center text-sentix-text hover:text-white font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lists
        </Link>
        
        <div className="mb-12 border-b border-sentix-border pb-6">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-3"
          >
            {list.name}
          </motion.h1>
          {list.description && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-sentix-text"
            >
              {list.description}
            </motion.p>
          )}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex items-center space-x-4 text-sm font-bold uppercase tracking-wider text-sentix-green"
          >
            <span>{list.movies.length} Films</span>
          </motion.div>
        </div>

        {list.movies.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-sentix-panel p-12 rounded-2xl border border-sentix-border text-center shadow-lg"
          >
            <Film className="w-12 h-12 text-sentix-border mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">This list is empty</h3>
            <p className="text-sentix-text mb-6">Browse films and add them to this list.</p>
            <Link 
              to="/"
              className="bg-sentix-green text-sentix-bg px-6 py-3 rounded-md font-bold hover:bg-sentix-greenHover transition-colors inline-block"
            >
              Browse Films
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {list.movies.map((lm: any) => {
              const movie = lm.movie;
              const linkId = movie.tmdbId ? movie.tmdbId : movie.id;
              
              return (
                <motion.div 
                  key={lm.id} 
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative rounded-xl overflow-hidden bg-sentix-panel aspect-[2/3] block border border-sentix-border hover:border-sentix-green hover:shadow-[0_0_15px_rgba(0,224,84,0.3)] transition-all"
                >
                  <Link to={`/movie/${linkId}`} className="block w-full h-full">
                    {movie.posterUrl ? (
                      <img 
                        src={movie.posterUrl.startsWith('http') ? movie.posterUrl : `${TMDB_IMAGE_BASE}${movie.posterUrl}`} 
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-sentix-bg">
                        <Film className="w-8 h-8 text-sentix-border mb-2" />
                        <span className="text-white font-semibold text-xs">{movie.title}</span>
                      </div>
                    )}
                  </Link>
                  <button 
                    onClick={(e) => { e.preventDefault(); handleRemoveMovie(movie.id); }}
                    className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white backdrop-blur-sm shadow-md"
                    title="Remove from list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 pointer-events-none">
                    <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md">{movie.title}</h3>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
