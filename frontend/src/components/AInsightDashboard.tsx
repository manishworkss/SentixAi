import React, { useEffect, useState } from 'react';
import { MovieAPI } from '../api';
import { Activity } from 'lucide-react';
import { AspectReviewModal } from './AspectReviewModal';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightsProps {
  movieId: string;
}

export const AInsightDashboard: React.FC<AIInsightsProps> = ({ movieId }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter & Sort state
  const [filterCount, setFilterCount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await MovieAPI.getAiInsights(movieId);
        setInsights(data);
      } catch (error) {
        console.error("Failed to fetch AI insights", error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchInsights();
    }
  }, [movieId]);

  const handleAspectClick = (aspectKey: string) => {
    setSelectedAspect(aspectKey);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-[#14181c] border border-sentix-border rounded-xl p-6 mb-12 flex items-center justify-center h-48 shadow-xl">
        <Activity className="w-8 h-8 text-sentix-cyan animate-spin" />
        <span className="ml-3 text-sentix-cyan font-bold tracking-widest uppercase text-sm">Processing Deep Review...</span>
      </div>
    );
  }

  if (!insights || !insights.deepReview) {
    return null; // Not enough data
  }

  const { aspects, score, totalReviews } = insights.deepReview;

  const aspectList = [
    { key: 'acting', title: 'Acting', icon: '🎭', data: aspects.acting || { score: 0, mentions: 0 } },
    { key: 'romance', title: 'Romance', icon: '🤎', data: aspects.romance || { score: 0, mentions: 0 } },
    { key: 'plot', title: 'Plot & Story', icon: '📜', data: aspects.plot || { score: 0, mentions: 0 } },
    { key: 'direction', title: 'Direction', icon: '🎬', data: aspects.direction || { score: 0, mentions: 0 } },
    { key: 'visuals', title: 'Visual Effects', icon: '🎥', data: aspects.visuals || { score: 0, mentions: 0 } },
    { key: 'sound', title: 'Sound & Music', icon: '🎧', data: aspects.sound || { score: 0, mentions: 0 } },
  ];

  const filteredAspects = aspectList.filter(a => (a.data.mentions || totalReviews) >= filterCount);
  
  const sortedAspects = [...filteredAspects].sort((a, b) => {
    if (sortBy === 'highest_rated') return b.data.score - a.data.score;
    if (sortBy === 'lowest_rated') return a.data.score - b.data.score;
    if (sortBy === 'most_reviewed') return (b.data.mentions || totalReviews) - (a.data.mentions || totalReviews);
    if (sortBy === 'least_reviewed') return (a.data.mentions || totalReviews) - (b.data.mentions || totalReviews);
    return 0; // 'default'
  });

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#8c9fb1] tracking-tight">
          SENTIX<span className="text-sentix-cyan">[AI]</span> <span className="text-white uppercase">Deep Review</span>
        </h2>
        <div className="flex gap-4 mt-2 md:mt-0">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-[#8c9fb1] mb-1">Filter by contributor count</label>
            <select 
              value={filterCount} 
              onChange={e => setFilterCount(Number(e.target.value))}
              className="bg-[#14181c] border border-[#2c3440] rounded text-white text-xs px-2 py-1.5 outline-none focus:border-sentix-cyan cursor-pointer hover:border-[#8c9fb1] transition-colors"
            >
              <option value={0}>All</option>
              <option value={50}>&gt; 50 Reviews</option>
              <option value={100}>&gt; 100 Reviews</option>
              <option value={200}>&gt; 200 Reviews</option>
              <option value={300}>&gt; 300 Reviews</option>
              <option value={350}>&gt; 350 Reviews</option>
              <option value={400}>&gt; 400 Reviews</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-[#8c9fb1] mb-1">Sort by rate</label>
            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#14181c] border border-[#2c3440] rounded text-white text-xs px-2 py-1.5 outline-none focus:border-sentix-cyan cursor-pointer hover:border-[#8c9fb1] transition-colors"
            >
              <option value="default">Default</option>
              <option value="highest_rated">Highest rated</option>
              <option value="lowest_rated">Lowest rated</option>
              <option value="most_reviewed">Most reviewed</option>
              <option value="least_reviewed">Least reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Aspects */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <AnimatePresence mode="popLayout">
          {sortedAspects.map(aspect => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={aspect.key}
              onClick={() => handleAspectClick(aspect.key)}
              className="cursor-pointer bg-[#14181c] rounded-xl border border-[#2c3440] p-4 flex items-center hover:border-cyan-400/50 transition-colors hover:bg-[#1a2128]"
            >
              <div className="w-12 h-12 flex items-center justify-center text-3xl mr-4 filter drop-shadow-md">{aspect.icon}</div>
              <div className="flex-1">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">{aspect.title}</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#ffcc00]">{aspect.data.score?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm font-bold text-white">- {aspect.data.score?.toFixed(1) || '0.0'}/5</span>
                </div>
                <div className="text-[10px] text-[#8c9fb1] mt-0.5">(From {aspect.data.mentions?.toLocaleString() || totalReviews.toLocaleString()} Reviews)</div>
                <div className="w-full h-1 bg-[#2c3440] mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all duration-500 ease-out" style={{ width: `${(aspect.data.score / 5) * 100 || 0}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sortedAspects.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="col-span-1 md:col-span-2 text-center py-10 bg-[#14181c] border border-dashed border-[#2c3440] rounded-xl text-[#8c9fb1] font-medium text-sm"
          >
            No aspects match your filters. Try adjusting them.
          </motion.div>
        )}
      </motion.div>

      {/* Overall Score */}
      <div className="bg-[#1c2228] border border-[#2c3440] rounded-xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Overall Experience</span>
          <span className="text-2xl font-bold text-sentix-green uppercase tracking-tighter">Sentix Score</span>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex text-[#ffcc00] mb-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span key={idx} className="text-3xl filter drop-shadow-md" style={{ opacity: idx < Math.round(score) ? 1 : 0.3 }}>
                ★
              </span>
            ))}
          </div>
          <span className="text-[10px] text-[#8c9fb1]">(From {totalReviews.toLocaleString()} unique users)</span>
        </div>
      </div>

      <AspectReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        aspectKey={selectedAspect || ''}
        aspectData={selectedAspect ? aspects[selectedAspect] : null}
      />
    </div>
  );
};
