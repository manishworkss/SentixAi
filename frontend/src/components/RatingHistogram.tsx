import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface RatingDistribution {
  [rating: number]: {
    count: number;
    users: { id: string; name: string }[];
  };
}

interface Props {
  distribution: RatingDistribution | null;
  averageRating: number | null;
}

export const RatingHistogram: React.FC<Props> = ({ distribution, averageRating }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  if (!distribution) return null;

  // Find max count to scale bars
  const counts = Object.values(distribution).map(d => d.count);
  const maxCount = Math.max(...counts, 1); // Avoid division by zero

  // Map 1-10 to UI bars
  const bars = Array.from({ length: 10 }, (_, i) => {
    const ratingValue = i + 1;
    const data = distribution[ratingValue] || { count: 0, users: [] };
    // Calculate height percentage (min 8% for visibility even if 0, max 100%)
    const heightPercent = data.count > 0 ? Math.max(8, (data.count / maxCount) * 100) : 8;
    
    return {
      ratingValue,
      starEquivalent: ratingValue / 2,
      count: data.count,
      users: data.users,
      heightPercent,
    };
  });

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2c3440]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8c9fb1]">Ratings</h3>
        {averageRating && (
          <div className="text-[10px] font-bold text-[#8c9fb1] uppercase tracking-widest">
            {averageRating.toFixed(1)} <span className="text-[#8c9fb1] text-[9px]">/10</span>
          </div>
        )}
      </div>

      {/* Histogram */}
      <div className="pt-6 pb-2">
        <div className="flex items-end h-[50px] gap-[2px] justify-center group relative w-full px-2">
          {/* Baseline */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#2c3440]" />
          
          {bars.map((bar) => {
            const isGreen = averageRating ? bar.ratingValue <= Math.round(averageRating) : false;
            
            return (
              <div 
                key={bar.ratingValue} 
                className="flex-1 flex flex-col justify-end items-center h-full relative cursor-pointer group/bar z-10"
                onClick={() => {
                  if (bar.count > 0) setSelectedRating(bar.ratingValue);
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-9 bg-[#2c3440] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block shadow-lg after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#2c3440]">
                  {bar.count} ratings ({bar.starEquivalent} ★)
                </div>
                
                {/* The Bar */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.heightPercent}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: bar.ratingValue * 0.05 }}
                  className={`w-full max-w-[16px] rounded-t-sm transition-colors ${
                    isGreen 
                      ? 'bg-[#00e054]' 
                      : (bar.count > 0 ? 'bg-[#404c56] group-hover/bar:bg-[#00e054]' : 'bg-[#2c3440] group-hover/bar:bg-[#00e054]')
                  }`}
                />
                
                {/* Active state base highlight */}
                {bar.count > 0 && (
                  <div className={`w-full h-[1px] absolute bottom-0 transition-colors ${
                    isGreen ? 'bg-[#00e054]' : 'bg-[#404c56] group-hover/bar:bg-[#00e054]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Modal for Selected Rating */}
      <AnimatePresence>
        {selectedRating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedRating(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#14181c] border border-[#2c3440] rounded-xl shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#2c3440] bg-[#1c2228]">
                <div>
                  <h3 className="text-white font-bold tracking-wide uppercase text-sm">
                    {distribution[selectedRating]?.count} Users Rated
                  </h3>
                  <div className="flex items-center text-sentix-green mt-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`w-3.5 h-3.5 ${idx < (selectedRating / 2) ? 'fill-current' : 'text-[#404c56] fill-transparent'}`} 
                      />
                    ))}
                    <span className="text-[#8c9fb1] text-xs ml-2 font-medium">({selectedRating / 2} Stars)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRating(null)}
                  className="p-2 text-[#8c9fb1] hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {distribution[selectedRating]?.users && distribution[selectedRating].users.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {distribution[selectedRating].users.map(user => (
                      <div key={user.id} className="flex flex-col items-center group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-[#1c2228] border-2 border-[#2c3440] flex items-center justify-center overflow-hidden group-hover:border-sentix-green transition-colors">
                          <span className="text-[#8c9fb1] group-hover:text-white font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="mt-2 text-[10px] text-[#8c9fb1] font-medium truncate w-full text-center group-hover:text-white transition-colors">
                          {user.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[#8c9fb1] py-10">No recent users found for this rating.</p>
                )}
                
                {distribution[selectedRating]?.count > 20 && (
                  <div className="mt-6 text-center">
                    <span className="text-xs text-[#8c9fb1] bg-[#1c2228] px-3 py-1.5 rounded-full border border-[#2c3440]">
                      Showing up to 20 recent users for performance.
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
