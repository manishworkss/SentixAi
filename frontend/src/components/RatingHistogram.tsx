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
    // Calculate height percentage (min 5% if count > 0, max 100%)
    const heightPercent = data.count > 0 ? Math.max(5, (data.count / maxCount) * 100) : 0;
    
    return {
      ratingValue,
      starEquivalent: ratingValue / 2,
      count: data.count,
      users: data.users,
      heightPercent,
    };
  });

  return (
    <div className="flex flex-col mb-8 bg-[#14181c] border border-sentix-border p-4 rounded-xl">
      <div className="flex items-center justify-between mb-4 border-b border-sentix-border/40 pb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-sentix-text">Ratings</h3>
        {averageRating && (
          <div className="flex items-center text-xl text-white">
            <span className="font-light mr-2">{averageRating.toFixed(1)}</span>
            <div className="flex text-sentix-green">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star 
                  key={idx} 
                  className={`w-3.5 h-3.5 ${idx < Math.round(averageRating / 2) ? 'fill-current' : 'text-sentix-border fill-transparent'}`} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between h-20 gap-0.5 group">
        {bars.map((bar) => (
          <div 
            key={bar.ratingValue} 
            className="flex-1 flex flex-col justify-end items-center h-full relative cursor-pointer"
            onClick={() => {
              if (bar.count > 0) setSelectedRating(bar.ratingValue);
            }}
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-8 bg-[#2c3440] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 hidden md:block border border-sentix-border">
              {bar.count} ratings ({bar.starEquivalent} ★)
            </div>
            
            {/* The Bar */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${bar.heightPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: bar.ratingValue * 0.05 }}
              className={`w-full max-w-[14px] rounded-t-sm transition-colors ${
                bar.count > 0 
                  ? 'bg-[#404c56] hover:bg-sentix-green' 
                  : 'bg-transparent'
              }`}
            />
            {/* The base line */}
            <div className={`w-full h-[1px] mt-0.5 ${bar.count > 0 ? 'bg-[#404c56]' : 'bg-transparent'}`} />
          </div>
        ))}
      </div>
      
      {/* 5 stars mapped below the bars */}
      <div className="flex justify-between mt-1 text-[#404c56] px-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star key={idx} className="w-2.5 h-2.5 fill-current" />
        ))}
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
