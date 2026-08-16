import React, { useState, useEffect } from 'react';
import { AnalyticsAPI, SentimentAPI } from '../api';
import { ArrowLeft, Loader2, Star, AlertTriangle, MessageSquare, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Movies
        </button>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-3" />
          {error || 'Movie not found.'}
        </div>
      </div>
    );
  }

  const { movie } = summary;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full pb-20">
      
      {/* Header */}
      <div>
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Explorer
        </button>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{movie.title}</h1>
            <div className="flex items-center text-slate-500 mt-2 space-x-4">
              <span className="flex items-center"><Star className="h-4 w-4 mr-1 text-yellow-500" /> {summary.averageRating.toFixed(1)} / 10 Avg Rating</span>
              <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {summary.reviewCount.toLocaleString()} Total Reviews</span>
              {movie.imdbId && <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{movie.imdbId}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Analyzed</div>
          <div className="text-2xl font-bold text-slate-800">{(summary.positiveCount + summary.negativeCount).toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Avg Sentiment Score</div>
          <div className="text-2xl font-bold text-slate-800">{summary.averageSentimentScore.toFixed(3)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Positive Reviews</div>
          <div className="text-2xl font-bold text-emerald-600">{summary.positiveCount.toLocaleString()} <span className="text-sm font-normal text-emerald-400">({summary.positivePercentage}%)</span></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Negative Reviews</div>
          <div className="text-2xl font-bold text-red-600">{summary.negativeCount.toLocaleString()} <span className="text-sm font-normal text-red-400">({summary.negativePercentage}%)</span></div>
        </div>
      </div>

      {/* Aspect Analysis */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Aspect Sentiment Analysis</h3>
        <p className="text-slate-500 text-sm mb-6 flex items-center">
          <BarChart3 className="h-4 w-4 mr-1.5" /> 
          Keyword-based aspect attribution from AI-analyzed reviews
        </p>
        
        {aspects.length === 0 ? (
          <div className="text-center py-10 text-slate-500 italic">No specific aspects (acting, story, etc.) heavily mentioned yet.</div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aspects} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[-1, 1]} tick={{fontSize: 12}} />
                <YAxis dataKey="aspect" type="category" tick={{fontSize: 12, fill: '#475569'}} width={100} />
                <Tooltip formatter={(val: any) => Number(val).toFixed(2)} cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="averageScore" name="Avg Sentiment Score" radius={[0, 4, 4, 0]}>
                  {aspects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.averageScore > 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Analyzed Reviews</h3>
          <p className="text-slate-500 text-sm mt-1">Review texts with their corresponding AI sentiment labels.</p>
        </div>
        
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No reviews analyzed for this movie yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Review Text</th>
                  <th className="px-6 py-4 font-medium">Sentiment</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                      {r.review.rating ? `${r.review.rating} / 10` : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="line-clamp-2 max-w-lg">{r.review.reviewText}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.sentiment === 'POSITIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {r.sentiment}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {r.score.toFixed(3)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedReview(r)} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wider">
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
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <button 
              disabled={reviewPage === 1}
              onClick={() => setReviewPage(p => p - 1)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {reviewPage} of {reviewTotalPages}</span>
            <button 
              disabled={reviewPage === reviewTotalPages}
              onClick={() => setReviewPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Review Inspector Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Review Analysis Inspector</h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">Original Text</h4>
                <div className="p-4 bg-slate-50 rounded-lg text-slate-700 leading-relaxed text-sm border border-slate-100">
                  {selectedReview.review.reviewText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-lg">
                  <div className="text-xs text-slate-400 font-medium mb-1">AI Sentiment</div>
                  <div className={`font-bold ${selectedReview.sentiment === 'POSITIVE' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedReview.sentiment}</div>
                </div>
                <div className="p-4 border border-slate-100 rounded-lg">
                  <div className="text-xs text-slate-400 font-medium mb-1">Raw Score</div>
                  <div className="font-mono text-slate-800 font-medium">{selectedReview.score}</div>
                </div>
                <div className="p-4 border border-slate-100 rounded-lg">
                  <div className="text-xs text-slate-400 font-medium mb-1">Confidence</div>
                  <div className="font-mono text-slate-800 font-medium">{(selectedReview.confidence * 100).toFixed(2)}%</div>
                </div>
                <div className="p-4 border border-slate-100 rounded-lg">
                  <div className="text-xs text-slate-400 font-medium mb-1">Original Rating</div>
                  <div className="font-mono text-slate-800 font-medium">{selectedReview.review.rating ? `${selectedReview.review.rating}/10` : 'None'}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                <Clock className="h-3.5 w-3.5 mr-1" /> Analyzed on {new Date(selectedReview.analyzedAt).toLocaleString()}
                <span className="mx-2">•</span>
                Model: <span className="font-mono ml-1">{selectedReview.modelProvider}</span>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedReview(null)} className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
