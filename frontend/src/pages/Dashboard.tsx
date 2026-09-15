import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { StackedPosters } from '../components/StackedPosters';
import { EditProfileModal } from '../components/EditProfileModal';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { Calendar, Film, Heart, List as ListIcon, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TMDBMovie } from '../lib/tmdb';

// Mock Favorite Movies
const MOCK_FAVORITES: TMDBMovie[] = [
  {
    id: 155,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "",
    release_date: "2008",
    vote_average: 8.5,
    overview: ""
  },
  {
    id: 238,
    title: "The Godfather",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "",
    release_date: "1972",
    vote_average: 8.7,
    overview: ""
  },
  {
    id: 680,
    title: "Pulp Fiction",
    poster_path: "/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    backdrop_path: "",
    release_date: "1994",
    vote_average: 8.5,
    overview: ""
  },
  {
    id: 157336,
    title: "Interstellar",
    poster_path: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    backdrop_path: "",
    release_date: "2014",
    vote_average: 8.4,
    overview: ""
  }
];

export function Dashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'lists' | 'watchlist'>('lists');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState({ isOpen: false, title: '' });

  // Stats mock
  const stats = {
    films: 423,
    thisYear: 52,
    lists: 12,
    following: 45,
    followers: 128
  };

  return (
    <div className="w-full">
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
          
          {/* User Info */}
          <div className="flex flex-col md:flex-row items-center md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <UserAvatar user={currentUser} size={100} className="border-4 border-sentix-bg shadow-xl" />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || currentUser?.phoneNumber || "User"}
              </h1>
              {currentUser?.email && (
                <p className="text-sentix-text text-sm mb-2">{currentUser.email}</p>
              )}
              <button 
                onClick={() => setShowEditProfile(true)}
                className="text-sentix-text hover:text-white text-xs uppercase tracking-wider font-bold transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex mt-8 md:mt-0 space-x-6 md:space-x-12">
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-black text-white group-hover:text-sentix-cyan transition-colors">{stats.films}</div>
              <div className="text-[10px] text-sentix-text uppercase tracking-widest font-bold">Films</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-black text-white group-hover:text-sentix-green transition-colors">{stats.thisYear}</div>
              <div className="text-[10px] text-sentix-text uppercase tracking-widest font-bold">This Year</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">{stats.lists}</div>
              <div className="text-[10px] text-sentix-text uppercase tracking-widest font-bold">Lists</div>
            </div>
            <div className="text-center group cursor-pointer hidden sm:block">
              <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{stats.following}</div>
              <div className="text-[10px] text-sentix-text uppercase tracking-widest font-bold">Following</div>
            </div>
            <div className="text-center group cursor-pointer hidden sm:block">
              <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{stats.followers}</div>
              <div className="text-[10px] text-sentix-text uppercase tracking-widest font-bold">Followers</div>
            </div>
          </div>
        </div>

        {/* FAVORITE FILMS */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4 border-b border-sentix-border pb-2">
            <h2 className="text-sm font-bold text-sentix-text uppercase tracking-widest">Favorite Films</h2>
            <button 
              onClick={() => setShowComingSoon({ isOpen: true, title: 'Edit Favorite Films' })}
              className="text-[10px] text-sentix-text hover:text-white uppercase tracking-wider font-bold"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-2xl">
            {MOCK_FAVORITES.map((movie) => (
              <div key={movie.id} className="aspect-[2/3] rounded-md overflow-hidden border border-white/10 shadow-lg hover:border-sentix-cyan cursor-pointer transition-colors">
                <img 
                  src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-t border-sentix-border bg-[#14181c] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 flex space-x-8">
          {[
            { id: 'profile', label: 'Profile', icon: null },
            { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4 mr-2" /> },
            { id: 'lists', label: 'Lists', icon: <ListIcon className="w-4 h-4 mr-2" /> },
            { id: 'watchlist', label: 'Watchlist', icon: <Calendar className="w-4 h-4 mr-2" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative py-4 text-xs font-bold uppercase tracking-widest flex items-center transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-sentix-text hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute left-0 right-0 bottom-0 h-[2px] bg-sentix-cyan"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-8 min-h-[50vh]">
        {activeTab === 'lists' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Your Lists</h2>
              <button 
                onClick={() => setShowComingSoon({ isOpen: true, title: 'Create New List' })}
                className="bg-sentix-green text-sentix-bg px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                New List
              </button>
            </div>
            {/* Example List using StackedPosters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group cursor-pointer block">
                <StackedPosters movies={MOCK_FAVORITES} />
                <div className="mt-3">
                  <h3 className="text-white font-bold text-lg group-hover:text-sentix-cyan transition-colors">All Time Favorites</h3>
                  <div className="text-xs text-sentix-text mt-1">4 Films</div>
                </div>
              </div>
              
              <div className="group cursor-pointer block">
                {/* Reversing mock array just to look slightly different */}
                <StackedPosters movies={[...MOCK_FAVORITES].reverse()} />
                <div className="mt-3">
                  <h3 className="text-white font-bold text-lg group-hover:text-sentix-cyan transition-colors">Sci-Fi Masterpieces</h3>
                  <div className="text-xs text-sentix-text mt-1">4 Films</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Star className="w-16 h-16 text-sentix-border mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
            <p className="text-sentix-text text-sm max-w-sm">You haven't logged any films or written any reviews yet. Go to the Films page to get started!</p>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="w-16 h-16 text-sentix-border mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your Watchlist is Empty</h3>
            <p className="text-sentix-text text-sm max-w-sm">Keep track of movies you want to see by adding them to your watchlist.</p>
          </div>
        )}
      </div>
      <EditProfileModal 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
      />
      
      <ComingSoonModal 
        isOpen={showComingSoon.isOpen}
        onClose={() => setShowComingSoon({ isOpen: false, title: '' })}
        title={showComingSoon.title}
      />
    </div>
  );
}
