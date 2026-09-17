import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, TMDB_IMAGE_BASE, TMDB_IMAGE_BASE_ORIGINAL } from '../lib/tmdb';
import type { TMDBMovie } from '../lib/tmdb';
import { Star, MessageSquare, Loader2, Activity, Bookmark, Edit2, Trash2, X, PlayCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MovieAPI, AnalyticsAPI, ListAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import ReactPlayer from 'react-player';
import { RatingHistogram } from '../components/RatingHistogram';
import { AInsightDashboard } from '../components/AInsightDashboard';

const Player = ReactPlayer as any;

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
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

  // AI Review Assistant State
  const [draftAnalysis, setDraftAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestedRating, setAiSuggestedRating] = useState<number | null>(null);

  // Lists State
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [topMovies, setTopMovies] = useState<TMDBMovie[]>([]);

  useEffect(() => {
    tmdb.getTopRatedMovies().then(res => setTopMovies(res));
  }, []);
  const [loadingLists, setLoadingLists] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Aspects State
  const [aspects, setAspects] = useState<any[]>([]);
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);

  // Letterboxd Layout State
  const [ratingsDistribution, setRatingsDistribution] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'CAST' | 'CREW' | 'GENRES'>('CAST');
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllCrew, setShowAllCrew] = useState(false);

  const { currentUser } = useAuth();

  const fetchInternalData = async (internalId: string) => {
    try {
      const [revs, analytics, dist] = await Promise.all([
        MovieAPI.getMovieReviews(internalId),
        AnalyticsAPI.getMovieAnalytics(internalId).catch(() => null),
        MovieAPI.getMovieRatingsDistribution(internalId).catch(() => null)
      ]);

      if (dist && dist.data) {
        setRatingsDistribution(dist.data);
      } else if (dist) {
        setRatingsDistribution(dist);
      }

      if (revs) {
        let currentReviews = revs.reviews || [];
        setReviews(currentReviews);
        setAspects(revs.aspects || []);

        if (currentReviews.length === 0) {
          try {
            const tmdbRevs = await tmdb.getMovieReviews(Number(id));
            if (tmdbRevs && tmdbRevs.length > 0) {
              await MovieAPI.bulkAddReviews(internalId, tmdbRevs);
              const [freshRevs, freshDist] = await Promise.all([
                MovieAPI.getMovieReviews(internalId),
                MovieAPI.getMovieRatingsDistribution(internalId).catch(() => null)
              ]);
              if (freshRevs) {
                setReviews(freshRevs.reviews || []);
                setAspects(freshRevs.aspects || []);
              }
              if (freshDist) {
                setRatingsDistribution(freshDist.data || freshDist);
              }
            }
          } catch (e) {
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
          } catch (e) {
            console.error("Failed to sync movie", e);
          }
        }
      });
    }
  }, [id]);

  // Poll for unanalyzed reviews every 5 seconds
  useEffect(() => {
    const hasUnanalyzed = reviews.some((r: any) => !r.sentiments || r.sentiments.length === 0);
    if (hasUnanalyzed && internalMovieId) {
      const interval = setInterval(() => {
        fetchInternalData(internalMovieId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews, internalMovieId]);

  // AI Review Assistant Debounce Effect
  useEffect(() => {
    if (!showReviewModal || reviewText.trim().length < 15) {
      setDraftAnalysis(null);
      setAiSuggestedRating(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const result = await MovieAPI.analyzeDraft(reviewText);
        setDraftAnalysis(result);

        // Auto-suggest rating based on sentiment score
        if (result?.sentiment) {
          let suggested = 5;
          if (result.sentiment.label === 'POSITIVE') {
            suggested = Math.round(5 + (result.sentiment.score * 5)); // 5 to 10
          } else if (result.sentiment.label === 'NEGATIVE') {
            suggested = Math.round(5 - (result.sentiment.score * 4)); // 1 to 5
          }
          const finalRating = Math.max(1, Math.min(10, suggested));
          // Convert 1-10 to 1-5 for the UI
          const starRating = Math.max(1, Math.round(finalRating / 2));
          setAiSuggestedRating(starRating);

          // If user hasn't touched rating, gently auto-apply it
          if (rating === 0) {
            setRating(starRating);
          }
        }
      } catch (e) {
        console.error("AI Analysis failed", e);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(delayDebounceFn);
  }, [reviewText, showReviewModal]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalMovieId) return;
    if (!reviewText.trim() || rating === 0) {
      setSubmitError('Rating and review text are required.');
      return;
    }
    if (reviewText.trim().length < 100) {
      setSubmitError('Content is too short (minimum is 100 characters)');
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


  // Helper for reviews
  const sortedReviews = [...reviews];
  const recentReviews = [...sortedReviews].sort((a, b) => new Date(b.reviewDate || b.createdAt).getTime() - new Date(a.reviewDate || a.createdAt).getTime());
  const popularReviews = [...sortedReviews].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

  const director = movie.credits?.crew?.find((c: any) => c.job === 'Director');
  const cast = showAllCast ? (movie.credits?.cast || []) : (movie.credits?.cast?.slice(0, 7) || []);
  const crew = showAllCrew ? (movie.credits?.crew || []) : (movie.credits?.crew?.slice(0, 7) || []);

  return (
    <div className="w-full font-sans pb-20 overflow-x-hidden bg-[#14181c] min-h-screen">

      {/* Backdrop with Letterboxd style dark fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-[50vh] md:h-[60vh] relative flex justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14181c] via-transparent to-[#14181c] z-10" />
        {movie.backdrop_path && (
          <img
            src={movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `${TMDB_IMAGE_BASE_ORIGINAL}${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full max-w-[1400px] h-full object-cover object-top opacity-50 mask-image-b"
          />
        )}
      </motion.div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 -mt-32 md:-mt-64 relative z-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row gap-8 lg:gap-12"
        >

          {/* Left Column (Poster & Actions) */}
          <motion.div variants={fadeLeftVariants} className="w-56 md:w-64 flex-shrink-0 mx-auto md:mx-0">
            <div className="rounded border border-sentix-border/40 overflow-hidden bg-[#2c3440] shadow-2xl relative group">
              {movie.poster_path ? (
                <img
                  src={movie.poster_path.startsWith('http') ? movie.poster_path : `${TMDB_IMAGE_BASE}${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center text-center p-4">
                  <span className="text-[#8c9fb1] font-semibold">{movie.title}</span>
                </div>
              )}
              {/* Hover overlay similar to Letterboxd */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-sentix-green/50 transition-colors pointer-events-none rounded" />
            </div>

            <div className="mt-4 flex items-center justify-center space-x-4 text-[#8c9fb1] text-xs font-bold border-b border-[#2c3440] pb-4">
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-current text-sentix-green" /> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {reviews.length}</span>
              <span className="flex items-center gap-1.5"><Bookmark className="w-3.5 h-3.5" /> Save</span>
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              <div className="bg-[#2c3440] rounded border border-sentix-border overflow-hidden">
                <div className="bg-[#404c56] px-3 py-2 text-[10px] font-bold text-[#8c9fb1] uppercase tracking-widest flex justify-between items-center">
                  <span>Where to Watch</span>
                  <a
                    href={movie.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer')
                      ? `https://www.youtube.com/watch?v=${movie.videos.results.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer')?.key}`
                      : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' movie trailer')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#14181c] hover:bg-white hover:text-black transition-colors px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full" /> Trailer
                  </a>
                </div>
                <div className="p-3">
                  <p className="text-sm text-[#8c9fb1] font-medium">Not streaming.</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#404c56]">
                    <span className="text-xs text-sentix-green cursor-pointer hover:text-white transition-colors">All services...</span>
                    <span className="text-[10px] text-[#8c9fb1] uppercase tracking-widest">JustWatch</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
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
                  className="w-full bg-[#2c3440] hover:bg-sentix-green hover:text-white hover:border-sentix-green text-[#8c9fb1] border border-[#404c56] py-2.5 rounded font-bold transition-all flex flex-col items-center justify-center text-[11px] uppercase tracking-wider"
                >
                  <MessageSquare className="w-4 h-4 mb-1" />
                  Review
                </button>
                <button
                  onClick={handleOpenListModal}
                  className="w-full bg-[#2c3440] hover:bg-[#404c56] text-[#8c9fb1] hover:text-white border border-[#404c56] py-2.5 rounded font-bold transition-all flex flex-col items-center justify-center text-[11px] uppercase tracking-wider"
                >
                  <Bookmark className="w-4 h-4 mb-1" />
                  Save
                </button>
              </div>
            </div>

            {/* Ratings Histogram Component (Sidebar) */}
            <div className="mt-8">
              <RatingHistogram distribution={ratingsDistribution} averageRating={sentimentSummary?.averageRating || movie.vote_average} />
            </div>

            {/* Movie Metadata (Sidebar) */}
            <div className="mt-8 border border-white/30 rounded-lg overflow-hidden bg-transparent mb-8">
              <div className="flex flex-col divide-y divide-white/30">
                {movie.status && (
                  <div className="p-3 px-4">
                    <span className="block text-[10px] font-bold text-[#8c9fb1] uppercase tracking-widest mb-1">Status</span>
                    <span className="text-[13px] font-medium text-white">{movie.status}</span>
                  </div>
                )}
                {movie.original_language && (
                  <div className="p-3 px-4">
                    <span className="block text-[10px] font-bold text-[#8c9fb1] uppercase tracking-widest mb-1">Original Language</span>
                    <span className="text-[13px] font-medium text-white uppercase">{movie.original_language}</span>
                  </div>
                )}
                {!!movie.budget && (
                  <div className="p-3 px-4">
                    <span className="block text-[10px] font-bold text-[#8c9fb1] uppercase tracking-widest mb-1">Budget</span>
                    <span className="text-[13px] font-medium text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(movie.budget)}
                    </span>
                  </div>
                )}
                {!!movie.revenue && (
                  <div className="p-3 px-4">
                    <span className="block text-[10px] font-bold text-[#8c9fb1] uppercase tracking-widest mb-1">Revenue</span>
                    <span className="text-[13px] font-medium text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(movie.revenue)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Films (Sidebar) */}
            {movie.similar && movie.similar.results && movie.similar.results.length > 0 && (
              <div className="mt-8 mb-8">
                <div className="flex justify-between items-end border-b border-sentix-border/40 pb-2 mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c9fb1]">Similar Films</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {movie.similar.results.slice(0, 6).map((sim: any) => (
                    <Link to={`/movie/${sim.id}`} key={sim.id} className="w-full aspect-[2/3] group relative">
                      <div className="w-full h-full rounded border border-sentix-border/40 overflow-hidden bg-[#2c3440] relative">
                        {sim.poster_path ? (
                          <img
                            src={`${TMDB_IMAGE_BASE}${sim.poster_path}`}
                            alt={sim.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-center p-1">
                            <span className="text-[#8c9fb1] text-[8px] font-semibold line-clamp-3">{sim.title}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 border border-transparent group-hover:border-sentix-green/50 transition-colors pointer-events-none rounded" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested For You (Sidebar) */}
            {movie.recommendations && movie.recommendations.results && movie.recommendations.results.length > 0 && (
              <div className="mt-8 mb-8">
                <div className="flex justify-between items-end border-b border-sentix-border/40 pb-2 mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c9fb1]">Suggested for You</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {movie.recommendations.results.slice(0, 6).map((rec: any) => (
                    <Link to={`/movie/${rec.id}`} key={rec.id} className="w-full aspect-[2/3] group relative">
                      <div className="w-full h-full rounded border border-sentix-border/40 overflow-hidden bg-[#2c3440] relative">
                        {rec.poster_path ? (
                          <img
                            src={`${TMDB_IMAGE_BASE}${rec.poster_path}`}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-center p-1">
                            <span className="text-[#8c9fb1] text-[8px] font-semibold line-clamp-3">{rec.title}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 border border-transparent group-hover:border-sentix-green/50 transition-colors pointer-events-none rounded" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Movies (Sidebar) */}
            {topMovies.length > 0 && (
              <div className="mt-8 mb-8">
                <div className="flex justify-between items-end border-b border-sentix-border/40 pb-2 mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c9fb1]">Top Movies</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {topMovies.slice(0, 6).map((top: any) => (
                    <Link to={`/movie/${top.id}`} key={top.id} className="w-full aspect-[2/3] group relative">
                      <div className="w-full h-full rounded border border-sentix-border/40 overflow-hidden bg-[#2c3440] relative">
                        {top.poster_path ? (
                          <img
                            src={`${TMDB_IMAGE_BASE}${top.poster_path}`}
                            alt={top.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-center p-1">
                            <span className="text-[#8c9fb1] text-[8px] font-semibold line-clamp-3">{top.title}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 border border-transparent group-hover:border-sentix-green/50 transition-colors pointer-events-none rounded" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column (Details) */}
          <motion.div variants={fadeRightVariants} className="flex-1 min-w-0 mt-4 md:mt-10">
            <motion.h1 variants={fadeDownVariants} className="text-3xl md:text-4xl font-serif font-bold text-white mb-1 tracking-tight">
              {movie.title} <span className="text-[#8c9fb1] font-sans font-medium text-2xl md:text-3xl ml-1">{movie.release_date.split('-')[0]}</span>
            </motion.h1>

            {director && (
              <motion.p variants={fadeLeftVariants} className="text-[#8c9fb1] text-sm font-bold uppercase tracking-wider mb-6">
                Directed by <span className="text-white hover:text-sentix-green cursor-pointer transition-colors">{director.name}</span>
              </motion.p>
            )}

            <motion.div variants={fadeUpVariants} className="mt-8 mb-8 text-[#8c9fb1] leading-relaxed text-[15px] md:text-[16px] font-medium max-w-3xl">
              {movie.overview}
            </motion.div>

            {/* Tabs for Cast, Crew, Genres */}
            <div className="border-b border-sentix-border/40 mb-4 flex space-x-6 text-[11px] font-bold uppercase tracking-widest text-[#8c9fb1]">
              <button onClick={() => setActiveTab('CAST')} className={`pb-2 transition-colors hover:text-white ${activeTab === 'CAST' ? 'text-white border-b-2 border-sentix-green' : ''}`}>Cast</button>
              <button onClick={() => setActiveTab('CREW')} className={`pb-2 transition-colors hover:text-white ${activeTab === 'CREW' ? 'text-white border-b-2 border-sentix-green' : ''}`}>Crew</button>
              <button onClick={() => setActiveTab('GENRES')} className={`pb-2 transition-colors hover:text-white ${activeTab === 'GENRES' ? 'text-white border-b-2 border-sentix-green' : ''}`}>Genres</button>
            </div>

            <div className="mb-10 min-h-[120px]">
              {activeTab === 'CAST' && (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {cast.map((member: any) => (
                    <a
                      key={member.id}
                      href={`https://www.google.com/search?q=${encodeURIComponent(member.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[130px] flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group block"
                    >
                      {member.profile_path ? (
                        <img
                          src={`${TMDB_IMAGE_BASE}${member.profile_path}`}
                          alt={member.name}
                          className="w-full h-[160px] object-cover group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-[160px] bg-gradient-to-br from-[#2c3440] to-[#1a1f26] flex items-center justify-center text-[#8c9fb1] border-b border-sentix-border/30">
                          <span className="font-serif text-4xl font-bold opacity-30">
                            {member.name ? member.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-bold text-black text-[13px] leading-tight mb-1 truncate">{member.name}</p>
                        <p className="text-gray-600 text-[11px] leading-tight line-clamp-2">{member.character}</p>
                      </div>
                    </a>
                  ))}
                  {!showAllCast && movie.credits?.cast && movie.credits.cast.length > 7 && (
                    <div className="w-[130px] flex-shrink-0 flex items-center justify-center">
                      <button onClick={() => setShowAllCast(true)} className="bg-[#2c3440] text-[#8c9fb1] hover:text-white hover:bg-[#404c56] cursor-pointer transition-colors px-4 py-2 rounded text-xs font-bold border border-[#404c56] uppercase tracking-wider">
                        Show All
                      </button>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'CREW' && (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {crew.map((member: any) => (
                    <a
                      key={`${member.id}-${member.job}`}
                      href={`https://www.google.com/search?q=${encodeURIComponent(member.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[130px] flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group block"
                    >
                      {member.profile_path ? (
                        <img
                          src={`${TMDB_IMAGE_BASE}${member.profile_path}`}
                          alt={member.name}
                          className="w-full h-[160px] object-cover group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-[160px] bg-gradient-to-br from-[#2c3440] to-[#1a1f26] flex items-center justify-center text-[#8c9fb1] border-b border-sentix-border/30">
                          <span className="font-serif text-4xl font-bold opacity-30">
                            {member.name ? member.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-bold text-black text-[13px] leading-tight mb-1 truncate">{member.name}</p>
                        <p className="text-gray-600 text-[11px] leading-tight line-clamp-2">{member.job}</p>
                      </div>
                    </a>
                  ))}
                  {!showAllCrew && movie.credits?.crew && movie.credits.crew.length > 7 && (
                    <div className="w-[130px] flex-shrink-0 flex items-center justify-center">
                      <button onClick={() => setShowAllCrew(true)} className="bg-[#2c3440] text-[#8c9fb1] hover:text-white hover:bg-[#404c56] cursor-pointer transition-colors px-4 py-2 rounded text-xs font-bold border border-[#404c56] uppercase tracking-wider">
                        Show All
                      </button>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'GENRES' && movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: any) => (
                    <span key={genre.id} className="bg-[#2c3440] hover:bg-[#404c56] text-[#8c9fb1] hover:text-white cursor-pointer transition-colors px-2.5 py-1 rounded text-xs font-medium">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sentix AI Deep Review (Replaces Trailer) */}
            <motion.div variants={fadeRightVariants}>
              {internalMovieId && <AInsightDashboard movieId={internalMovieId} />}
            </motion.div>

            {/* Popular Reviews Section */}
            <motion.div variants={fadeUpVariants} className="mb-12">
              <div className="flex justify-between items-end border-b border-sentix-border/40 pb-2 mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c9fb1]">Popular Reviews</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c9fb1] hover:text-white cursor-pointer">More</span>
              </div>

              <div className="space-y-4">
                {popularReviews.length > 0 ? popularReviews.map((r: any) => (
                  <div key={r.id} className="py-4 border-b border-[#2c3440] last:border-0 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#2c3440] flex items-center justify-center overflow-hidden shrink-0">
                        {r.user ? (
                          <span className="text-[#8c9fb1] font-bold text-sm">{r.user.name.charAt(0).toUpperCase()}</span>
                        ) : (
                          <span className="text-[#8c9fb1] font-bold text-[10px]">TMDB</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#8c9fb1] group-hover:text-white transition-colors text-sm">Review by <span className="text-white">{r.user ? r.user.name : 'TMDB User'}</span></span>
                        {r.rating && (
                          <div className="flex items-center text-sentix-green">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} className={`w-3 h-3 ${idx < Math.round(r.rating / 2) ? 'fill-current' : 'text-[#2c3440] fill-transparent'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {(!r.sentiments || r.sentiments.length === 0) && (
                      <div className="bg-[#fff9e6] text-[#856404] border border-[#ffeeba] px-4 py-2.5 rounded-md mb-3 text-sm font-semibold shadow-sm">
                        This review is currently pending approval.
                      </div>
                    )}
                    <p className="text-[14px] leading-relaxed text-[#8c9fb1] group-hover:text-white/90 transition-colors whitespace-pre-wrap font-serif break-words">
                      {r.reviewText}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-[#8c9fb1]">No popular reviews yet.</p>
                )}
              </div>
            </motion.div>

            {/* Recent Reviews Section */}
            <motion.div variants={fadeUpVariants} className="mb-12">
              <div className="flex justify-between items-end border-b border-sentix-border/40 pb-2 mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8c9fb1]">Recent Reviews</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c9fb1] hover:text-white cursor-pointer">More</span>
              </div>

              <div className="space-y-4">
                {recentReviews.length > 0 ? recentReviews.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="py-4 border-b border-[#2c3440] last:border-0 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#2c3440] flex items-center justify-center overflow-hidden shrink-0">
                        {r.user ? (
                          <span className="text-[#8c9fb1] font-bold text-sm">{r.user.name.charAt(0).toUpperCase()}</span>
                        ) : (
                          <span className="text-[#8c9fb1] font-bold text-[10px]">TMDB</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#8c9fb1] group-hover:text-white transition-colors text-sm">Review by <span className="text-white">{r.user ? r.user.name : 'TMDB User'}</span></span>
                        {r.rating && (
                          <div className="flex items-center text-sentix-green">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} className={`w-3 h-3 ${idx < Math.round(r.rating / 2) ? 'fill-current' : 'text-[#2c3440] fill-transparent'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {(!r.sentiments || r.sentiments.length === 0) && (
                      <div className="bg-[#fff9e6] text-[#856404] border border-[#ffeeba] px-4 py-2.5 rounded-md mb-3 text-sm font-semibold shadow-sm">
                        This review is currently pending approval.
                      </div>
                    )}
                    <p className="text-[14px] leading-relaxed text-[#8c9fb1] group-hover:text-white/90 transition-colors whitespace-pre-wrap font-serif break-words">
                      {r.reviewText}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-[#8c9fb1]">No recent reviews yet.</p>
                )}
              </div>
            </motion.div>
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

                <div className="mb-6 flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-sentix-text uppercase tracking-wider mb-3">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Add a review..."
                    className="w-full h-40 bg-sentix-bg border border-sentix-border rounded-xl p-4 text-white placeholder:text-sentix-border focus:outline-none focus:border-sentix-green focus:ring-1 focus:ring-sentix-green transition-all resize-none text-[15px] leading-relaxed shadow-inner"
                  ></textarea>

                  {/* AI Assistant Insight Box */}
                  <div className="mt-3 min-h-[60px]">
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2 text-sentix-cyan text-sm animate-pulse">
                        <Activity className="w-4 h-4" />
                        <span>Sentix AI is analyzing your thoughts...</span>
                      </div>
                    ) : draftAnalysis ? (
                      <div className={`p-3 rounded-xl border flex items-start space-x-3 text-sm transition-all ${draftAnalysis.sentiment.label === 'POSITIVE' ? 'bg-green-500/10 border-green-500/30 text-green-400' : draftAnalysis.sentiment.label === 'NEGATIVE' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                        <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            AI Insight: {draftAnalysis.sentiment.label.charAt(0) + draftAnalysis.sentiment.label.slice(1).toLowerCase()} tone detected.
                          </p>
                          {draftAnalysis.aspects?.length > 0 && (
                            <p className="mt-1 opacity-90">
                              You're talking about: {draftAnalysis.aspects.map((a: any) => a.name).join(', ')}.
                            </p>
                          )}
                          {aiSuggestedRating && rating === 0 && (
                            <p className="mt-1 text-white font-medium text-xs opacity-80">
                              Auto-applied {aiSuggestedRating} stars based on tone.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
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
              ) : lists.length === 0 ? (
                <div className="text-center py-8 text-sentix-text bg-sentix-bg rounded-xl border border-sentix-border">
                  <p className="mb-4">You don't have any lists yet.</p>
                  <Link to="/lists" className="text-sentix-green font-bold hover:underline">Create a List</Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {lists.map((list: any) => (
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
