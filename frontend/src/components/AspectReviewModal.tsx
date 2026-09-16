import React, { useEffect } from 'react';
import { X, MessageSquareQuote, Bot, Users } from 'lucide-react';

interface Review {
  content: string;
  author: string;
  rating: number;
}

interface AspectData {
  score: number;
  mentions: number;
  topReviews?: Review[];
  botSummary?: string;
}

interface AspectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectKey: string;
  aspectData: AspectData | null;
}

const getAspectMeta = (key: string) => {
  switch (key) {
    case 'acting': return { name: 'Acting', icon: '🎭', color: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/10', borderSolid: 'border-cyan-400' };
    case 'romance': return { name: 'Romance', icon: '🤎', color: 'text-rose-400', border: 'border-rose-400/30', bg: 'bg-rose-400/10', borderSolid: 'border-rose-400' };
    case 'plot': return { name: 'Plot & Story', icon: '📜', color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', borderSolid: 'border-amber-400' };
    case 'direction': return { name: 'Direction', icon: '🎬', color: 'text-gray-400', border: 'border-gray-400/30', bg: 'bg-gray-400/10', borderSolid: 'border-gray-400' };
    case 'visuals': return { name: 'Visual Effects', icon: '🎥', color: 'text-orange-400', border: 'border-orange-400/30', bg: 'bg-orange-400/10', borderSolid: 'border-orange-400' };
    case 'sound': return { name: 'Sound & Music', icon: '🎧', color: 'text-red-400', border: 'border-red-400/30', bg: 'bg-red-400/10', borderSolid: 'border-red-400' };
    default: return { name: 'Aspect', icon: '✨', color: 'text-sentix-cyan', border: 'border-sentix-cyan/30', bg: 'bg-sentix-cyan/10', borderSolid: 'border-sentix-cyan' };
  }
};

export const AspectReviewModal: React.FC<AspectReviewModalProps> = ({ isOpen, onClose, aspectKey, aspectData }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !aspectData) return null;

  const meta = getAspectMeta(aspectKey);
  const reviews = aspectData.topReviews || [];
  const topReview = reviews.length > 0 ? reviews[0] : null;
  const similarReviews = reviews.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-[#14181c] w-full max-w-2xl rounded-2xl border ${meta.border} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-[#2c3440] ${meta.bg}`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl filter drop-shadow-md">{meta.icon}</span>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">{meta.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-lg font-bold ${meta.color}`}>{aspectData.score.toFixed(1)}/5</span>
                <span className="text-xs text-[#8c9fb1] font-medium">• Based on {aspectData.mentions.toLocaleString()} mentions</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#8c9fb1] hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Bot Synthesis */}
          {aspectData.botSummary && (
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Bot className={`w-5 h-5 ${meta.color}`} />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sentix AI Synthesis</h3>
              </div>
              <div className={`p-5 rounded-xl border border-[#2c3440] bg-[#1c2228] text-[#8c9fb1] text-sm leading-relaxed border-l-4 ${meta.borderSolid.replace('border-', 'border-l-')}`}>
                {aspectData.botSummary}
              </div>
            </div>
          )}

          {/* Top Comment */}
          {topReview && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquareQuote className={`w-5 h-5 ${meta.color}`} />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Top Comment</h3>
              </div>
              <div className="bg-[#1c2228] p-5 rounded-xl border border-[#2c3440] shadow-inner">
                <p className="text-white font-medium text-[15px] italic leading-relaxed mb-4">"{topReview.content}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8c9fb1] uppercase tracking-wider">— {topReview.author}</span>
                  <span className="text-xs font-bold text-[#ffcc00] flex items-center gap-1">
                    ★ {topReview.rating ? (topReview.rating / 2).toFixed(1) : aspectData.score.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Similar Comments */}
          {similarReviews.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-[#8c9fb1]" />
                <h3 className="text-sm font-bold text-[#8c9fb1] uppercase tracking-widest">Similar Perspectives</h3>
              </div>
              <div className="space-y-3">
                {similarReviews.map((rev, idx) => (
                  <div key={idx} className="bg-[#14181c] p-4 rounded-xl border border-[#2c3440] hover:border-[#3d4856] transition-colors">
                    <p className="text-[#8c9fb1] text-sm italic mb-3">"{rev.content}"</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#667a8c] uppercase">— {rev.author}</span>
                      <span className="text-[10px] font-bold text-[#ffcc00] flex items-center gap-1">
                        ★ {rev.rating ? (rev.rating / 2).toFixed(1) : aspectData.score.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length === 0 && !aspectData.botSummary && (
            <div className="text-center py-10">
              <p className="text-[#8c9fb1] text-sm">No specific reviews extracted for this aspect yet.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
