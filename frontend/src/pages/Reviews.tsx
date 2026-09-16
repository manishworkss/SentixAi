import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReviewAPI, MovieAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Search, Star, MessageSquare, Trash2, Edit2, Check, X, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  
  // Filters
  const [searchTitle, setSearchTitle] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');

  // Edit state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editRating, setEditRating] = useState<number>(0);

  const { currentUser } = useAuth();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await ReviewAPI.getAllReviews({
        movieTitle: searchTitle,
        sentiment: sentimentFilter,
        myReviews: activeTab === 'my',
      });
      setReviews(res.reviews || []);
    } catch (e) {
      console.error(e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my' && !currentUser) {
      setActiveTab('all');
      return;
    }
    
    const timer = setTimeout(() => {
      fetchReviews();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchTitle, sentimentFilter, currentUser]);

  const handleDelete = async (movieId: string, reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await MovieAPI.deleteReview(movieId, reviewId);
      fetchReviews();
    } catch (e) {
      alert("Failed to delete review");
    }
  };

  const handleEditSave = async (movieId: string, reviewId: string) => {
    try {
      await MovieAPI.updateReview(movieId, reviewId, editReviewText, editRating);
      setEditingReviewId(null);
      fetchReviews();
    } catch (e) {
      alert("Failed to update review");
    }
  };

  const startEdit = (review: any) => {
    setEditingReviewId(review.id);
    setEditReviewText(review.reviewText);
    setEditRating(review.rating || 0);
  };

  return (
    <div className="w-full font-sans pb-20">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-white flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-sentix-cyan" />
            Community Reviews
          </h1>
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-sentix-panel p-4 rounded-2xl border border-sentix-border mb-8 gap-4 shadow-lg">
          <div className="flex items-center space-x-2 border border-sentix-border rounded-xl p-1 bg-sentix-bg">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-sentix-panel text-white shadow-sm' : 'text-sentix-text hover:text-white'}`}
            >
              All Reviews
            </button>
            {currentUser && (
              <button 
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-sentix-panel text-white shadow-sm' : 'text-sentix-text hover:text-white'}`}
              >
                My Reviews
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sentix-text" />
              <input 
                type="text" 
                placeholder="Search by movie..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="bg-sentix-bg border border-sentix-border text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:ring-1 focus:ring-sentix-cyan focus:border-sentix-cyan outline-none w-full md:w-64 transition-all"
              />
            </div>
            
            <select 
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="bg-sentix-bg border border-sentix-border text-white text-sm rounded-xl px-4 py-2 focus:ring-1 focus:ring-sentix-cyan focus:border-sentix-cyan outline-none transition-all"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sentix-cyan" />
          </div>
        ) : reviews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-sentix-panel rounded-2xl border border-sentix-border shadow-lg"
          >
            <MessageSquare className="w-12 h-12 text-sentix-border mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No reviews found</h3>
            <p className="text-sentix-text">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            {reviews.map((review) => {
              const sentiment = review.sentiments?.[0]?.sentiment || 'UNANALYZED';
              const sentimentColors: any = {
                'POSITIVE': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                'NEGATIVE': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
                'NEUTRAL': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                'UNANALYZED': 'text-slate-400 bg-slate-400/10 border-slate-400/20'
              };
              const sColor = sentimentColors[sentiment];
              const isOwner = currentUser && review.userId && currentUser.email === review.user?.email;

              return (
                <motion.div 
                  key={review.id} 
                  variants={itemVariants}
                  className="bg-sentix-panel border border-sentix-border rounded-2xl p-6 transition-colors hover:border-sentix-border/80 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                    <div className="flex items-center space-x-4">
                      {review.movie?.posterUrl ? (
                        <Link to={`/movie/${review.movie.id}`} className="shrink-0">
                          <img src={review.movie.posterUrl.startsWith('http') ? review.movie.posterUrl : `https://image.tmdb.org/t/p/w342${review.movie.posterUrl}`} alt={review.movie.title} className="w-16 h-24 object-cover rounded-lg shadow-md hover:ring-2 hover:ring-sentix-cyan transition-all" loading="lazy" />
                        </Link>
                      ) : (
                        <div className="w-16 h-24 bg-sentix-bg border border-sentix-border rounded-lg flex items-center justify-center shrink-0">
                          <Film className="w-6 h-6 text-sentix-text" />
                        </div>
                      )}
                      <div>
                        <Link to={`/movie/${review.movie?.id}`} className="text-xl font-bold text-white hover:text-sentix-cyan transition-colors">
                          {review.movie?.title || 'Unknown Movie'}
                        </Link>
                        <div className="text-sm text-sentix-text mt-1 flex items-center space-x-2">
                          <span>Review by <span className="text-white font-medium">{review.user?.name || review.user?.email || 'Anonymous'}</span></span>
                          <span>•</span>
                          <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center mt-3 space-x-4">
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-sentix-green fill-sentix-green' : 'text-sentix-border'}`} />
                            ))}
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-bold tracking-wider ${sColor}`}>
                            {sentiment}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions for Owner */}
                    {isOwner && activeTab === 'my' && editingReviewId !== review.id && (
                      <div className="flex space-x-2">
                        <button onClick={() => startEdit(review)} className="p-2 text-sentix-text hover:text-white bg-sentix-bg border border-sentix-border rounded-lg transition-colors hover:border-sentix-cyan" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(review.movie?.id, review.id)} className="p-2 text-sentix-text hover:text-white bg-sentix-bg border border-sentix-border hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-500 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-white/90 text-base leading-relaxed border-t border-sentix-border pt-4">
                    {editingReviewId === review.id ? (
                      <div className="space-y-4">
                        <textarea 
                          value={editReviewText}
                          onChange={(e) => setEditReviewText(e.target.value)}
                          className="w-full h-32 bg-sentix-bg border border-sentix-cyan text-white rounded-xl p-4 focus:ring-1 focus:ring-sentix-cyan outline-none transition-all resize-none"
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 bg-sentix-bg border border-sentix-border p-2 rounded-xl">
                            <span className="text-sm font-bold text-sentix-text pl-2">Rating:</span>
                            <div className="flex space-x-1 pr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setEditRating(star)} className="hover:scale-110 transition-transform">
                                  <Star className={`w-6 h-6 ${editRating >= star ? 'text-sentix-green fill-sentix-green' : 'text-sentix-border'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button onClick={() => setEditingReviewId(null)} className="flex items-center px-4 py-2 rounded-lg bg-sentix-bg border border-sentix-border font-bold text-sentix-text hover:text-white transition-colors">
                              <X className="w-4 h-4 mr-1" /> Cancel
                            </button>
                            <button onClick={() => handleEditSave(review.movie?.id, review.id)} className="flex items-center px-4 py-2 rounded-lg bg-sentix-cyan font-bold text-sentix-bg hover:bg-sentix-cyanHover transition-colors shadow-md">
                              <Check className="w-4 h-4 mr-1" /> Save Review
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{review.reviewText}</p>
                    )}
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
