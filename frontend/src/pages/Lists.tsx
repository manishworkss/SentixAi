import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListAPI } from '../api';
import { tmdb, TMDB_IMAGE_BASE } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';
import { Plus, List as ListIcon, Loader2, X, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';



// --- MOCK DATA FOR PUBLIC DISCOVERY ---
const MOCK_FEATURED_LISTS = [
  { id: 'f1', name: 'Top 500 Narrative Feature Films', creator: 'Official Lists', moviesCount: 500, isOfficial: true },
  { id: 'f2', name: 'Most Fans on SentixAi', creator: 'Official Lists', moviesCount: 250, isOfficial: true },
  { id: 'f3', name: 'One Million Watched Club', creator: 'Alexander', moviesCount: 142, isOfficial: false },
];

const MOCK_POPULAR_LISTS = [
  { id: 'p1', name: "SentixAi's Top 500 Films", creator: 'Official Lists', moviesCount: 500, likes: '429K', comments: '34K', isOfficial: true },
  { id: 'p2', name: 'Movies everyone should watch at least once', creator: 'fcbarcelona', moviesCount: 800, likes: '430K', comments: '2K', isOfficial: false },
  { id: 'p3', name: 'Solidarity Cinema Archive', creator: 'Solidarity Cinema', moviesCount: 10723, likes: '32K', comments: '191', isOfficial: false },
];

const MOCK_RECENTLY_LIKED = [
  { id: 'r1', name: 'HOOPTOBER The 13th', creator: 'jakariverj', moviesCount: 31, likes: '4', comments: '1', desc: 'First time joining the Hooptober challenge...' },
  { id: 'r2', name: 'Chinese', creator: 'George Aron', moviesCount: 85, likes: '1.3K', comments: '7', desc: 'Filling in the gaps of my Chinese cinema knowledge' },
  { id: 'r3', name: 'Serial Killers', creator: 'Marlonn Locatelli', moviesCount: 22, likes: '51', comments: '0', desc: '' },
  { id: 'r4', name: 'Bordwell & Thompson\'s Film Art', creator: 'czechjulio', moviesCount: 479, likes: '56', comments: '2', desc: 'All the movies mentioned in Film Art: An Introduction' },
];

const MOCK_CREW_PICKS = [
  { id: 'c1', name: 'Hooptober the 13th: The Final Chapter', creator: 'Cinemonster', moviesCount: 36 },
  { id: 'c2', name: 'Telluride Film Festival 2026', creator: 'filmfestival', moviesCount: 36 },
  { id: 'c3', name: 'Venice Film Festival 2026', creator: 'filmfestival', moviesCount: 148 },
  { id: 'c4', name: 'TIFF 2026', creator: 'filmfestival', moviesCount: 217 },
];

import { StackedPosters } from '../components/StackedPosters';

export function Lists() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mockMovies, setMockMovies] = useState<TMDBMovie[]>([]);

  const fetchLists = async () => {
    try {
      const res = await ListAPI.getLists();
      setLists(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Fetch mock movies for public UI
    tmdb.getPopularMovies().then(movies => {
      setMockMovies(movies);
    });

    if (currentUser) {
      fetchLists().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await ListAPI.createList(name, description);
      setShowModal(false);
      setName('');
      setDescription('');
      fetchLists();
    } catch (e) {
      console.error(e);
      alert('Failed to create list');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartListClick = () => {
    if (currentUser) {
      setShowModal(true);
    } else {
      navigate('/login?signup=true');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-sentix-bg flex items-center justify-center text-sentix-text"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // Helper to slice mock posters uniquely for different lists
  const getMoviesForList = (startIndex: number) => {
    if (mockMovies.length === 0) return [];
    const len = mockMovies.length;
    // ensure we don't go out of bounds by wrapping
    const movies = [];
    for (let i = 0; i < 5; i++) {
      movies.push(mockMovies[(startIndex + i) % len]);
    }
    return movies;
  };

  return (
    <div className="w-full font-sans bg-sentix-bg min-h-screen text-sentix-text pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-[#14181c] border-b border-sentix-border py-12 px-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-sentix-cyan/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-6">
            Collect, curate, and share. <br className="hidden md:block" />
            <span className="text-sentix-text">Lists are the perfect way to group films.</span>
          </h1>
          <button 
            onClick={handleStartListClick}
            className="bg-sentix-green text-sentix-bg px-6 py-3 rounded-md font-bold hover:bg-sentix-greenHover transition-colors shadow-lg"
          >
            Start your own list
          </button>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 mt-12 space-y-16">
        
        {/* --- USER'S LISTS (If Logged In) --- */}
        {currentUser && (
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-sentix-border pb-2">
              <h2 className="text-sm font-bold text-sentix-text uppercase tracking-widest">Your Lists</h2>
              <button 
                onClick={() => setShowModal(true)}
                className="text-xs text-white hover:text-sentix-green uppercase tracking-wider font-bold transition-colors flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> New List
              </button>
            </div>
            
            {lists.length === 0 ? (
              <div className="bg-[#14181c] p-8 rounded-xl border border-sentix-border text-center">
                <p className="text-sentix-text mb-4">You haven't created any lists yet.</p>
                <button onClick={() => setShowModal(true)} className="text-sentix-green hover:text-white font-bold transition-colors">Create one now</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map(list => (
                  <Link 
                    key={list.id}
                    to={`/lists/${list.id}`} 
                    className="block group"
                  >
                    <div className="bg-[#14181c] border border-sentix-border rounded-xl p-6 h-full hover:border-sentix-green transition-colors">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sentix-green transition-colors">{list.name}</h3>
                      {list.description && <p className="text-sm text-sentix-text line-clamp-2 mb-4">{list.description}</p>}
                      <div className="mt-4 pt-4 border-t border-sentix-border flex items-center text-xs font-bold text-sentix-cyan uppercase tracking-wider">
                        {list._count?.movies || 0} Films
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- FEATURED LISTS --- */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-sentix-border pb-2">
            <h2 className="text-sm font-bold text-sentix-text uppercase tracking-widest">Featured Lists</h2>
            <Link to="#" className="text-xs text-sentix-text hover:text-white uppercase tracking-wider transition-colors">All + Official</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_FEATURED_LISTS.map((list, idx) => (
              <div key={list.id} className="group cursor-pointer block">
                <StackedPosters movies={getMoviesForList(idx * 2)} />
                <div className="mt-3">
                  <h3 className="text-white font-bold text-lg group-hover:text-sentix-cyan transition-colors">{list.name}</h3>
                  <div className="flex items-center text-xs mt-1">
                    <div className={`w-4 h-4 rounded-full mr-2 bg-gradient-to-br ${list.isOfficial ? 'from-sentix-green to-sentix-cyan' : 'from-gray-600 to-gray-800'}`} />
                    <span className="text-sentix-text mr-1">Created by</span>
                    <span className="text-white font-bold">{list.creator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROMO BANNER */}
        <div className="w-full bg-[#1e2329] border border-sentix-border rounded-lg p-6 flex flex-col md:flex-row items-center justify-between shadow-inner">
          <div className="mb-4 md:mb-0">
            <h3 className="text-white font-black text-xl md:text-2xl tracking-tight">AD-FREE. QUESTION. AMAZE. AMAZE.</h3>
            <p className="text-sm text-sentix-text mt-1">Get annual and all-time stats, filtering by your favorite streaming services, watchlist notifications, and more...</p>
          </div>
          <button className="bg-sentix-cyan text-sentix-bg font-black uppercase tracking-wider px-6 py-2 rounded shadow-lg hover:bg-white transition-colors shrink-0">
            Upgrade to Pro
          </button>
        </div>

        {/* --- POPULAR & CREW PICKS LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column (Popular & Recently Liked) */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* POPULAR THIS WEEK */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-sentix-border pb-2">
                <h2 className="text-sm font-bold text-sentix-text uppercase tracking-widest">Popular This Week</h2>
                <Link to="#" className="text-xs text-sentix-text hover:text-white uppercase tracking-wider transition-colors">More</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_POPULAR_LISTS.map((list, idx) => (
                  <div key={list.id} className="group cursor-pointer block">
                    <StackedPosters movies={getMoviesForList(idx * 3 + 5)} />
                    <div className="mt-3">
                      <h3 className="text-white font-bold text-[15px] leading-snug group-hover:text-sentix-cyan transition-colors">{list.name}</h3>
                      <div className="flex items-center text-[11px] mt-1 text-sentix-text">
                        <div className={`w-3.5 h-3.5 rounded-full mr-1.5 bg-gradient-to-br ${list.isOfficial ? 'from-sentix-green to-sentix-cyan' : 'from-gray-600 to-gray-800'}`} />
                        <span className="mr-1">Created by</span>
                        <span className="text-white font-bold mr-2">{list.creator}</span>
                        <Heart className="w-3 h-3 text-sentix-text mr-1" />
                        <span className="mr-2">{list.likes}</span>
                        <MessageCircle className="w-3 h-3 text-sentix-text mr-1" />
                        <span>{list.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RECENTLY LIKED */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-sentix-border pb-2">
                <h2 className="text-sm font-bold text-sentix-text uppercase tracking-widest">Recently Liked</h2>
              </div>
              <div className="space-y-6">
                {MOCK_RECENTLY_LIKED.map((list, idx) => (
                  <div key={list.id} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-6 last:border-0 block">
                    <div className="w-[180px] shrink-0">
                      <StackedPosters movies={getMoviesForList(idx * 4 + 2)} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-white font-bold text-lg group-hover:text-sentix-cyan transition-colors">{list.name}</h3>
                      <div className="flex items-center text-xs mt-1 mb-2 text-sentix-text">
                        <div className={`w-4 h-4 rounded-full mr-2 bg-gradient-to-br from-gray-600 to-gray-800`} />
                        <span className="text-white font-bold mr-3">{list.creator}</span>
                        <Heart className="w-3 h-3 mr-1" />
                        <span className="mr-3">{list.likes}</span>
                        <MessageCircle className="w-3 h-3 mr-1" />
                        <span>{list.comments}</span>
                      </div>
                      {list.desc && (
                        <p className="text-sm text-sentix-text">{list.desc}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Crew Picks) */}
          <div className="lg:col-span-1">
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-sentix-border pb-2">
                <h2 className="text-sm font-bold text-sentix-text uppercase tracking-widest">Crew Picks</h2>
              </div>
              <div className="space-y-4">
                {MOCK_CREW_PICKS.map((list, idx) => (
                  <div key={list.id} className="group cursor-pointer bg-[#14181c] p-3 rounded-lg border border-sentix-border hover:border-sentix-cyan transition-colors flex flex-col block">
                    <div className="w-full aspect-[3/1] mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      <StackedPosters movies={getMoviesForList(idx * 5 + 7)} />
                    </div>
                    <h3 className="text-white font-bold text-sm leading-snug group-hover:text-sentix-cyan transition-colors line-clamp-2">{list.name}</h3>
                    <div className="flex items-center text-[11px] mt-2 text-sentix-text">
                      <div className={`w-3.5 h-3.5 rounded-full mr-1.5 bg-gradient-to-br from-gray-600 to-gray-800`} />
                      <span className="text-white font-bold mr-2">{list.creator}</span>
                      <span>{list.moviesCount} films</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
        </div>
      </main>

      {/* --- CREATE LIST MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-sentix-panel rounded-2xl border border-sentix-border shadow-2xl w-full max-w-md p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create New List</h2>
                <button onClick={() => setShowModal(false)} className="text-sentix-text hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-sentix-text uppercase tracking-wider mb-2">List Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-sentix-bg border border-sentix-border rounded-xl p-3 text-white focus:border-sentix-green focus:ring-1 focus:ring-sentix-green transition-all outline-none"
                    placeholder="e.g. Favorite Sci-Fi"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-sentix-text uppercase tracking-wider mb-2">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full h-24 bg-sentix-bg border border-sentix-border rounded-xl p-3 text-white focus:border-sentix-green focus:ring-1 focus:ring-sentix-green transition-all outline-none resize-none"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sentix-text hover:text-white font-bold transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting || !name.trim()} className="px-6 py-2 bg-sentix-green text-sentix-bg rounded-lg font-bold hover:bg-sentix-greenHover disabled:opacity-50 flex items-center transition-colors">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save List
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
