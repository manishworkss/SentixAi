import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, TMDB_IMAGE_BASE, TMDB_IMAGE_BASE_ORIGINAL } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';
import { Star, MessageSquare, Loader2, Activity, Bookmark, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MovieAPI, AnalyticsAPI, ListAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [internalMovieId, setInternalMovieId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sentimentSummary, setSentimentSummary] = useState<any>(null);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Edit Review State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Lists State
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Aspects State
  const [aspects, setAspects] = useState<any[]>([]);
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);

  const { currentUser } = useAuth();

  const fetchInternalData = async (internalId: string) => {
    try {
      const [revs, analytics] = await Promise.all([
        MovieAPI.getMovieReviews(internalId),
        AnalyticsAPI.getMovieAnalytics(internalId).catch(() => null)
      ]);
      if (revs) {
        let currentReviews = revs.reviews || [];
        setReviews(currentReviews);
        setAspects(revs.aspects || []);

        if (currentReviews.length === 0) {
          try {
            const tmdbRevs = await tmdb.getMovieReviews(Number(id));
            if (tmdbRevs && tmdbRevs.length > 0) {
              await MovieAPI.bulkAddReviews(internalId, tmdbRevs);
              const freshRevs = await MovieAPI.getMovieReviews(internalId);
              if (freshRevs) {
                setReviews(freshRevs.reviews || []);
                setAspects(freshRevs.aspects || []);
              }
            }
          } catch(e) {
            console.error("Failed to auto-sync TMDB reviews", e);
          }
        }
      }
      if (analytics) {
        setSentimentSummary(analytics);
      }
    } catch (e) {
      console.error("Error fetching internal data", e);
    }
  };

  useEffect(() => {
    if (id) {
      tmdb.getMovieDetails(Number(id)).then(async m => {
        setMovie(m);
        setLoading(false);
        if (m) {
          try {
            // Sync TMDB movie to internal database
            const res = await MovieAPI.syncMovie({
              id: m.id,
              title: m.title,
              release_date: m.release_date,
              poster_path: m.poster_path,
              overview: m.overview
            });
            if (res && res.id) {
              setInternalMovieId(res.id);
              fetchInternalData(res.id);
            }
          } catch(e) {
            console.error("Failed to sync movie", e);
          }
        }
      });
    }
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalMovieId) return;
    if (!reviewText.trim() || rating === 0) {
      setSubmitError('Rating and review text are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      if (editingReviewId) {
        await MovieAPI.updateReview(internalMovieId, editingReviewId, reviewText, rating);
      } else {
        await MovieAPI.addReview(internalMovieId, reviewText, rating);
      }
      setShowReviewModal(false);
      setReviewText('');
      setRating(0);
      setEditingReviewId(null);
      
      // refresh reviews
      const data = await MovieAPI.getMovieReviews(internalMovieId);
      setReviews(data?.reviews || []);
      setAspects(data?.aspects || []);
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: any) => {
    setEditingReviewId(review.id);
    setReviewText(review.reviewText);
    setRating(review.rating || 0);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!internalMovieId) return;
    if (!confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await MovieAPI.deleteReview(internalMovieId, reviewId);
      const data = await MovieAPI.getMovieReviews(internalMovieId);
      setReviews(data?.reviews || []);
      setAspects(data?.aspects || []);
    } catch (e: any) {
      alert(e.message || 'Failed to delete review');
    }
  };

  const handleOpenListModal = async () => {
    if (!currentUser) {
      window.location.href = `/login?returnUrl=/movie/${id}`;
      return;
    }
    setShowListModal(true);
    setLoadingLists(true);
    try {
      const fetchedLists = await ListAPI.getLists();
      setLists(fetchedLists || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleAddToList = async (listId: string) => {
    if (!internalMovieId) return;
    try {
      await ListAPI.addMovieToList(listId, internalMovieId);
      alert('Movie added to list!');
      setShowListModal(false);
    } catch (e: any) {
      alert(e.message || 'Failed to add movie to list');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-sentix-bg flex items-center justify-center text-sentix-text"><Loader2 className="w-8 h-8 animate-spin text-sentix-cyan" /></div>;
  }

  if (!movie) {
    return <div className="min-h-screen bg-sentix-bg flex items-center justify-center text-white font-bold text-xl">Movie not found.</div>;
  }

  return (
    <div className="w-full font-sans pb-20 overflow-x-hidden">
      
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-[50vh] md:h-[60vh] relative"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-sentix-bg via-sentix-bg/60 to-transparent z-10"></div>
        {movie.backdrop_path && (
          <img 
            src={movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `${TMDB_IMAGE_BASE_ORIGINAL}${movie.backdrop_path}`} 
            alt={movie.title}
            className="w-full h-full object-cover object-top mix-blend-luminosity"
          />
        )}
      </motion.div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 -mt-32 md:-mt-48 relative z-20">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row gap-8"
        >
          
          {/* Poster Column */}
          <motion.div variants={fadeUpVariants} className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
            <div className="rounded-xl overflow-hidden bg-sentix-panel shadow-2xl border border-sentix-border">
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
            
            <div className="mt-6 flex flex-col space-y-3">
              <button 
                onClick={() => {
                  if (!currentUser) {
                    window.location.href = `/login?returnUrl=/movie/${id}`;
                    return;
                  }
                  setEditingReviewId(null);
                  setReviewText('');
                  setRating(0);
                  setShowReviewModal(true);
                }}
                className="w-full bg-sentix-green hover:bg-sentix-greenHover text-sentix-bg py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,224,84,0.2)] hover:shadow-[0_0_20px_rgba(0,224,84,0.4)] flex items-center justify-center transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Write Review
              </button>
              <button 
                onClick={handleOpenListModal}
                className="w-full bg-sentix-panel hover:bg-sentix-border text-white border border-sentix-border py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center transform hover:-translate-y-0.5"
              >
                <Bookmark className="w-5 h-5 mr-2 text-sentix-text" />
                Save to List
              </button>
            </div>
          </motion.div>

          {/* Details Column */}
          <motion.div variants={fadeUpVariants} className="flex-1 mt-4 md:mt-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">
              {movie.title} <span className="text-sentix-text font-normal text-2xl md:text-3xl tracking-normal">{movie.release_date.split('-')[0]}</span>
            </h1>
            
            <p className="text-lg leading-relaxed text-white/80 mb-8 max-w-3xl mx-auto md:mx-0">
              {movie.overview}
            </p>

            {/* Trailer Section */}
            {movie.videos?.results && movie.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer') && (
              <div className="mb-12 max-w-3xl mx-auto md:mx-0">
                <a 
                  href={`https://www.youtube.com/watch?v=${movie.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block w-full aspect-video rounded-2xl overflow-hidden border border-sentix-border shadow-2xl bg-black cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <img 
                    src={`https://img.youtube.com/vi/${movie.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key}/maxresdefault.jpg`}
                    onError={(e) => {
                      // Fallback to hqdefault if maxresdefault doesn't exist
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${movie.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key}/hqdefault.jpg`;
                    }}
                    alt="Trailer Thumbnail"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(220,38,38,0.6)] group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white text-center drop-shadow-md">Watch Trailer on YouTube</h3>
                    <p className="text-sm text-gray-300 mt-2 text-center drop-shadow-md">Opens in a new tab</p>
                  </div>
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Traditional Rating */}
              <div className="bg-sentix-panel p-6 rounded-2xl border border-sentix-border shadow-lg">
                <h3 className="text-sm font-bold uppercase tracking-widest text-sentix-text mb-4">Audience Rating</h3>
                <div className="flex items-center justify-center md:justify-start text-white">
                  <Star className="w-8 h-8 text-yellow-400 mr-3 fill-current" />
                  <span className="font-black text-4xl tracking-tighter">
                    {sentimentSummary && sentimentSummary.averageRating > 0 
                      ? sentimentSummary.averageRating.toFixed(1) 
                      : movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-sentix-text ml-2 text-xl font-medium">
                    / {sentimentSummary && sentimentSummary.averageRating > 0 ? '5' : '10'}
                  </span>
                </div>
                <p className="text-xs text-sentix-text mt-3 text-center md:text-left">Based on user star ratings</p>
              </div>

              {/* SentixAI Sentiment */}
              <div className="bg-gradient-to-br from-sentix-panel to-sentix-bg p-6 rounded-2xl border border-sentix-cyan/30 relative overflow-hidden shadow-[0_0_20px_rgba(0,180,216,0.1)]">
                <div className="absolute -right-4 -top-4 opacity-[0.03] text-white pointer-events-none">
                  <Activity size={120} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-sentix-cyan mb-4 flex items-center justify-center md:justify-start">
                  <Activity className="w-4 h-4 mr-2" /> SentixAI Sentiment
                </h3>
                
                {sentimentSummary && (sentimentSummary.positiveCount > 0 || sentimentSummary.negativeCount > 0) ? (
                  <div>
                    <div className="flex items-end justify-center md:justify-start space-x-6 mb-4">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-black text-sentix-green">{sentimentSummary.positivePercentage}%</span>
                        <span className="text-sm font-bold text-sentix-text uppercase tracking-wider">Pos</span>
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-black text-rose-500">{sentimentSummary.negativePercentage}%</span>
                        <span className="text-sm font-bold text-sentix-text uppercase tracking-wider">Neg</span>
                      </div>
                    </div>
                    {/* Sentiment Bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-sentix-border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${sentimentSummary.positivePercentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" as const }}
                        className="bg-sentix-green h-full"
                      />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${sentimentSummary.negativePercentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" as const, delay: 0.2 }}
                        className="bg-rose-500 h-full"
                      />
                    </div>
                    <p className="text-xs text-sentix-text mt-4 font-medium text-center md:text-left">
                      Based on {sentimentSummary.positiveCount + sentimentSummary.negativeCount} AI-analyzed reviews
                    </p>
                  </div>
                ) : (
                  <div className="py-4 text-center md:text-left">
                    <p className="text-sentix-text italic font-medium">Not enough reviews processed by AI yet.</p>
                  </div>
                )}
              </div>
            </div>

            <h3 id="reviews-section" className="text-sm font-bold uppercase tracking-widest text-white border-b border-sentix-border pb-2 mb-6 text-center md:text-left">Top Rated Review</h3>
            
            {/* Aspect Filters */}
            {aspects && aspects.length > 0 && (
              <div className="mb-6 p-5 bg-[#181d23] rounded-2xl border border-sentix-border shadow-md">
                <h3 className="text-[11px] font-bold text-sentix-text uppercase tracking-widest mb-4">Highlighted Topics</h3>
                <div className="flex flex-wrap gap-2.5">
                  <button 
                    onClick={() => setSelectedAspect(null)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center h-8 ${!selectedAspect ? 'text-white' : 'text-sentix-text hover:text-white'}`}
                  >
                    All Reviews
                  </button>
                  {aspects.map(a => (
                    <button
                      key={a.name}
                      onClick={() => setSelectedAspect(a.name === selectedAspect ? null : a.name)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5 h-8 border ${selectedAspect === a.name ? 'bg-white/10 border-white/20 text-white shadow-sm' : 'bg-transparent border-sentix-border text-sentix-text hover:border-sentix-text/40 hover:text-white/90'}`}
                    >
                      <span className="uppercase tracking-wide">{a.name} ({a.count})</span>
                      {a.averageRating && (
                        <span className="flex items-center gap-1.5 opacity-80">
                          <span className="text-sentix-border">|</span>
                          <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-current" /> {a.averageRating}/10</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {reviews.length > 0 ? (
                (selectedAspect ? reviews.filter((r: any) => r.aspectSentiments?.some((as: any) => as.aspect.name === selectedAspect)) : reviews).map((r: any) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={r.id} 
                    className="bg-sentix-panel p-5 rounded-2xl border border-sentix-border/60 hover:border-sentix-border transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 pb-4 border-b border-sentix-border/40">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sentix-bg border border-sentix-border flex items-center justify-center overflow-hidden shrink-0">
                          {r.user ? (
                            <span className="text-sentix-primary font-bold text-lg">{r.user.name.charAt(0).toUpperCase()}</span>
                          ) : (
                            <span className="text-sentix-text font-bold text-sm">TMDB</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-[15px]">{r.user ? r.user.name : 'TMDB User'}</span>
                            <span className="text-[11px] text-sentix-text font-medium bg-sentix-bg px-2 py-0.5 rounded border border-sentix-border">
                              {new Date(r.reviewDate || r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {r.rating && (
                            <div className="flex items-center text-sentix-green mt-1">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star key={idx} className={`w-3.5 h-3.5 ${idx < (r.rating / 2) ? 'fill-current' : 'text-sentix-border'}`} />
                              ))}
                              <span className="text-[10px] font-bold ml-1.5 opacity-80">{r.rating}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {r.aspectSentiments?.map((as: any) => (
                          <div key={as.id} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            as.sentiment === 'POSITIVE' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 
                            as.sentiment === 'NEGATIVE' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                            'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                          }`}>
                            {as.aspect.name}
                          </div>
                        ))}
                        
                        {currentUser && r.user?.firebaseUid === currentUser.uid && (
                          <div className="flex items-center space-x-1 pl-2 ml-1 border-l border-sentix-border">
                            <button onClick={() => handleEditReview(r)} className="text-sentix-text hover:text-white bg-sentix-bg p-1 rounded border border-sentix-border transition-colors" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteReview(r.id)} className="text-sentix-text hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 bg-sentix-bg p-1 rounded border border-sentix-border transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[14px] leading-relaxed text-white/80 whitespace-pre-wrap font-medium">{r.reviewText}</p>
                  </motion.div>
                ))
              ) : (
                <div className="bg-sentix-panel p-10 rounded-2xl border border-sentix-border text-center shadow-md">
                  <MessageSquare className="w-12 h-12 text-sentix-border mx-auto mb-4" />
                  <p className="text-white font-bold text-lg">No reviews yet.</p>
                  <p className="text-sm text-sentix-text mt-1">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      </main>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
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
              className="bg-sentix-panel rounded-2xl border border-sentix-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative"
            >
              <div className="p-6 border-b border-sentix-border flex justify-between items-center bg-sentix-bg/50">
                <h2 className="text-xl font-bold text-white">{editingReviewId ? 'Edit your review...' : 'I watched...'}</h2>
                <button onClick={() => setShowReviewModal(false)} className="text-sentix-text hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="p-6 flex-1 flex flex-col">
                <div className="mb-6 flex items-start space-x-4">
                  <img src={movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : `${TMDB_IMAGE_BASE}${movie.poster_path}`) : ''} alt="Poster" className="w-16 rounded-lg shadow-md border border-sentix-border" />
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{movie.title}</h3>
                    <p className="text-sentix-text text-sm mt-1 font-medium">{movie.release_date.split('-')[0]}</p>
                  </div>
                </div>

                {submitError && (
                  <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm font-bold">
                    {submitError}
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-xs font-bold text-sentix-text uppercase tracking-wider mb-3">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-125"
                      >
                        <Star 
                          className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'text-sentix-green fill-current' : 'text-sentix-border'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <label className="block text-xs font-bold text-sentix-text uppercase tracking-wider mb-3">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Add a review..."
                    className="w-full h-40 bg-sentix-bg border border-sentix-border rounded-xl p-4 text-white placeholder:text-sentix-border focus:outline-none focus:border-sentix-green focus:ring-1 focus:ring-sentix-green transition-all resize-none text-[15px] leading-relaxed shadow-inner"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4 border-t border-sentix-border mt-auto">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-2.5 text-sentix-text font-bold hover:text-white transition-colors mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !reviewText.trim() || rating === 0}
                    className="px-8 py-2.5 bg-sentix-green text-sentix-bg font-bold rounded-xl shadow-md hover:bg-sentix-greenHover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Modal */}
      <AnimatePresence>
        {showListModal && (
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
                <h2 className="text-xl font-bold text-white">Save to List</h2>
                <button onClick={() => setShowListModal(false)} className="text-sentix-text hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {loadingLists ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-sentix-cyan" /></div>
              ) : userLists.length === 0 ? (
                <div className="text-center py-8 text-sentix-text bg-sentix-bg rounded-xl border border-sentix-border">
                  <p className="mb-4">You don't have any lists yet.</p>
                  <Link to="/lists" className="text-sentix-green font-bold hover:underline">Create a List</Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {userLists.map(list => (
                    <button 
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                      className="w-full text-left bg-sentix-bg hover:bg-sentix-border/50 border border-sentix-border p-4 rounded-xl transition-all flex justify-between items-center group hover:border-sentix-cyan"
                    >
                      <div>
                        <h4 className="font-bold text-white group-hover:text-sentix-cyan transition-colors">{list.name}</h4>
                        <p className="text-xs text-sentix-text mt-1 font-medium uppercase tracking-wider">{list._count?.movies || 0} Films</p>
                      </div>
                      <Bookmark className="w-5 h-5 text-sentix-text group-hover:text-sentix-cyan transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
