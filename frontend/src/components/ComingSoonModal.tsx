import React from 'react';
import { X, Wrench } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
}

export function ComingSoonModal({ isOpen, onClose, title, message = "We're working hard to bring you this feature in a future update!" }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1e2329] rounded-xl border border-white/10 w-full max-w-sm overflow-hidden shadow-2xl relative text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-sentix-text hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-sentix-bg rounded-full flex items-center justify-center mb-6">
            <Wrench className="w-8 h-8 text-sentix-cyan" />
          </div>
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{title}</h2>
          <p className="text-sentix-text text-sm mb-6">{message}</p>

          <button 
            onClick={onClose}
            className="w-full bg-white/10 text-white font-bold uppercase tracking-wider py-3 rounded-md hover:bg-white/20 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
