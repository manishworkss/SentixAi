import React, { useState, useEffect } from 'react';
import { AnalyticsAPI, SentimentAPI } from '../api';
import { ArrowLeft, Loader2, Star, AlertTriangle, MessageSquare, BarChart3, Clock, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function MovieAnalytics({ movieId, onBack }: { movieId: string, onBack: () => void }) {
  const [summary, setSummary] = useState<any>(null);
  const [aspects, setAspects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  useEffect(() => {
    const loadMovieData = async () => {
      setLoading(true);
      try {
        const [sumRes, aspRes] = await Promise.all([
          AnalyticsAPI.getMovieAnalytics(movieId),
          AnalyticsAPI.getMovieAspects(movieId)
        ]);
        setSummary(sumRes);
        setAspects(aspRes.aspects || []);
        setError(null);
      } catch (err) {
        setError("Failed to load movie analytics.");
      } finally {
        setLoading(false);
      }
    };
    loadMovieData();
  }, [movieId]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await SentimentAPI.getMovieSentiments(movieId, reviewPage, 10);
        setReviews(res.data || []);
        setReviewTotalPages(res.meta?.totalPages || 1);
      } catch (err) {
        console.error("Failed to load reviews");
      }
    };
    loadReviews();
  }, [movieId, reviewPage]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-sentix-bg text-sentix-cyan">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 bg-sentix-bg">
        <button onClick={onBack} className="flex items-center text-sentix-text hover:text-white mb-6 transition-colors font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Movies
        </button>
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-4 rounded-xl flex items-center font-bold">
          <AlertTriangle className="h-5 w-5 mr-3" />
          {error || 'Movie not found.'}
        </div>
      </div>
    );
  }

  const { movie } = summary;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full pb-20 custom-scrollbar">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="flex items-center text-sentix-text hover:text-white mb-4 transition-colors font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Explorer
        </button>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{movie.title}</h1>
            <div className="flex flex-wrap items-center text-sentix-text mt-3 gap-4 font-medium">
              <span className="flex items-center"><Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" /> {summary.averageRating.toFixed(1)} / 5 Avg Rating</span>
              <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {summary.reviewCount.toLocaleString()} Total Reviews</span>
              {movie.imdbId && <span className="font-mono text-xs bg-sentix-border px-2 py-0.5 rounded text-white font-bold">{movie.imdbId}</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        
        {/* Analytics KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="bg-sentix-panel p-5 rounded-2xl border border-sentix-border shadow-lg hover:border-sentix-cyan transition-colors">
            <div className="text-xs font-bold text-sentix-text uppercase tracking-wider mb-1">Total Analyzed</div>
            <div className="text-3xl font-black text-white">{(summary.positiveCount + summary.negativeCount).toLocaleString()}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-sentix-panel p-5 rounded-2xl border border-sentix-border shadow-lg hover:border-sentix-cyan transition-colors">
            <div className="text-xs font-bold text-sentix-text uppercase tracking-wider mb-1">Avg Sentiment Score</div>
            <div className="text-3xl font-black text-white">{summary.averageSentimentScore.toFixed(3)}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-sentix-panel p-5 rounded-2xl border border-sentix-border shadow-lg hover:border-sentix-green transition-colors">
            <div className="text-xs font-bold text-sentix-text uppercase tracking-wider mb-1">Positive Reviews</div>
            <div className="text-3xl font-black text-sentix-green">{summary.positiveCount.toLocaleString()} <span className="text-sm font-bold text-sentix-green/70">({summary.positivePercentage}%)</span></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-sentix-panel p-5 rounded-2xl border border-sentix-border shadow-lg hover:border-rose-500 transition-colors">
            <div className="text-xs font-bold text-sentix-text uppercase tracking-wider mb-1">Negative Reviews</div>
            <div className="text-3xl font-black text-rose-500">{summary.negativeCount.toLocaleString()} <span className="text-sm font-bold text-rose-500/70">({summary.negativePercentage}%)</span></div>
          </motion.div>
        </div>

        {/* Aspect Analysis */}
        <motion.div variants={itemVariants} className="bg-sentix-panel p-6 rounded-3xl border border-sentix-border shadow-lg">
          <h3 className="text-lg font-bold text-white mb-1">Aspect Sentiment Analysis</h3>
          <p className="text-sentix-text text-sm mb-6 flex items-center font-medium">
            <BarChart3 className="h-4 w-4 mr-2" /> 
            Keyword-based aspect attribution from AI-analyzed reviews
          </p>
          
          {aspects.length === 0 ? (
            <div className="text-center py-10 text-sentix-text italic bg-sentix-bg rounded-xl border border-sentix-border">No specific aspects (acting, story, etc.) heavily mentioned yet.</div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aspects} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2c3440" />
                  <XAxis type="number" domain={[-1, 1]} tick={{fontSize: 12, fill: '#9ab'}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="aspect" type="category" tick={{fontSize: 12, fill: '#fff', fontWeight: 'bold'}} width={100} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(val: any) => Number(val).toFixed(2)} 
                    cursor={{fill: '#2c3440'}} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #2c3440', backgroundColor: '#1e252b', color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="averageScore" name="Avg Sentiment Score" radius={[0, 4, 4, 0]}>
                    {aspects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.averageScore > 0 ? '#00e054' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Reviews Table */}
        <motion.div variants={itemVariants} className="bg-sentix-panel rounded-3xl border border-sentix-border shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-sentix-border bg-sentix-bg/50">
            <h3 className="text-lg font-bold text-white">Analyzed Reviews</h3>
            <p className="text-sentix-text text-sm mt-1 font-medium">Review texts with their corresponding AI sentiment labels.</p>
          </div>
          
          {reviews.length === 0 ? (
            <div className="p-12 text-center text-sentix-text italic">No reviews analyzed for this movie yet.</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-sentix-text uppercase tracking-wider bg-sentix-bg border-b border-sentix-border">
                  <tr>
                    <th className="px-6 py-4 font-bold">Rating</th>
                    <th className="px-6 py-4 font-bold">Review Text</th>
                    <th className="px-6 py-4 font-bold">Sentiment</th>
                    <th className="px-6 py-4 font-bold">Score</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r, i) => (
                    <tr key={i} className="border-b border-sentix-border/50 hover:bg-sentix-bg transition-colors last:border-none">
                      <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                        {r.review.rating ? `${r.review.rating} / 5` : '-'}
                      </td>
                      <td className="px-6 py-4 text-white/90">
                        <div className="line-clamp-2 max-w-lg">{r.review.reviewText}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border tracking-wider ${r.sentiment === 'POSITIVE' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                          {r.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sentix-text font-medium">
                        {r.score.toFixed(3)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedReview(r)} className="text-sentix-cyan hover:text-white font-bold text-xs uppercase tracking-wider transition-colors bg-sentix-border/50 hover:bg-sentix-cyan hover:border-sentix-cyan border border-transparent px-3 py-1.5 rounded-lg">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {reviewTotalPages > 1 && (
            <div className="p-4 border-t border-sentix-border flex justify-between items-center bg-sentix-bg/50">
              <button 
                disabled={reviewPage === 1}
                onClick={() => setReviewPage(p => p - 1)}
                className="px-4 py-2 bg-sentix-panel border border-sentix-border rounded-lg text-white text-sm font-bold disabled:opacity-50 hover:border-sentix-cyan transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-sentix-text">Page {reviewPage} of {reviewTotalPages}</span>
              <button 
                disabled={reviewPage === reviewTotalPages}
                onClick={() => setReviewPage(p => p + 1)}
                className="px-4 py-2 bg-sentix-panel border border-sentix-border rounded-lg text-white text-sm font-bold disabled:opacity-50 hover:border-sentix-cyan transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Review Inspector Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-sentix-panel rounded-2xl shadow-2xl border border-sentix-border max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden relative"
            >
              <div className="p-6 border-b border-sentix-border flex justify-between items-center bg-sentix-bg/80">
                <h3 className="text-lg font-bold text-white">Review Analysis Inspector</h3>
                <button onClick={() => setSelectedReview(null)} className="text-sentix-text hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="mb-6">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-sentix-text mb-3">Original Text</h4>
                  <div className="p-5 bg-sentix-bg rounded-xl text-white/90 leading-relaxed text-[15px] border border-sentix-border shadow-inner">
                    {selectedReview.review.reviewText}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-sentix-border bg-sentix-bg rounded-xl shadow-sm">
                    <div className="text-xs text-sentix-text font-bold uppercase tracking-wider mb-1">AI Sentiment</div>
                    <div className={`font-black text-xl ${selectedReview.sentiment === 'POSITIVE' ? 'text-sentix-green' : 'text-rose-500'}`}>{selectedReview.sentiment}</div>
                  </div>
                  <div className="p-4 border border-sentix-border bg-sentix-bg rounded-xl shadow-sm">
                    <div className="text-xs text-sentix-text font-bold uppercase tracking-wider mb-1">Raw Score</div>
                    <div className="font-mono text-white font-bold text-xl">{selectedReview.score.toFixed(4)}</div>
                  </div>
                  <div className="p-4 border border-sentix-border bg-sentix-bg rounded-xl shadow-sm">
                    <div className="text-xs text-sentix-text font-bold uppercase tracking-wider mb-1">Confidence</div>
                    <div className="font-mono text-white font-bold text-xl">{(selectedReview.confidence * 100).toFixed(2)}%</div>
                  </div>
                  <div className="p-4 border border-sentix-border bg-sentix-bg rounded-xl shadow-sm">
                    <div className="text-xs text-sentix-text font-bold uppercase tracking-wider mb-1">Original Rating</div>
                    <div className="font-mono text-white font-bold text-xl">{selectedReview.review.rating ? `${selectedReview.review.rating}/5` : 'None'}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center text-xs font-bold text-sentix-text border-t border-sentix-border pt-4 gap-y-2">
                  <Clock className="h-4 w-4 mr-1.5" /> Analyzed on {new Date(selectedReview.analyzedAt).toLocaleString()}
                  <span className="mx-3 text-sentix-border hidden sm:inline">•</span>
                  <div className="flex items-center ml-auto sm:ml-0">
                    Model: <span className="font-mono ml-2 bg-sentix-border text-white px-2 py-0.5 rounded-md">{selectedReview.modelProvider}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-sentix-border bg-sentix-bg/80 flex justify-end">
                <button onClick={() => setSelectedReview(null)} className="px-6 py-2.5 bg-sentix-panel border border-sentix-border text-white rounded-xl text-sm font-bold hover:bg-sentix-border transition-colors">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
