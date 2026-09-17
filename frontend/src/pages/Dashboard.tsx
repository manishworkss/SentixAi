import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { StackedPosters } from '../components/StackedPosters';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { Calendar, List as ListIcon, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { TMDBMovie } from '../lib/tmdb';

// Mock Favorite Movies
const MOCK_FAVORITES: TMDBMovie[] = [
  {
    id: 969681,
    title: "Spider-Man: Brand New Day",
    poster_path: "/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    backdrop_path: "/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg",
    release_date: "2026",
    vote_average: 7.85,
    overview: ""
  },
  {
    id: 1204680,
    title: "Coyote vs. Acme",
    poster_path: "/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg",
    backdrop_path: "/7GOW6jod9lLurW5utokAatxg7ql.jpg",
    release_date: "2026",
    vote_average: 7.615,
    overview: ""
  },
  {
    id: 1375646,
    title: "Colony",
    poster_path: "/tN799oUR0f1gUKDYdMNrDaY7I51.jpg",
    backdrop_path: "/hpBGCnzOvdtQoMyE48gvwp2y5yx.jpg",
    release_date: "2026",
    vote_average: 8.085,
    overview: ""
  },
  {
    id: 1368337,
    title: "The Odyssey",
    poster_path: "/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    backdrop_path: "/iuylzRSllrGn7YB322kwKoOVMcq.jpg",
    release_date: "2026",
    vote_average: 8.007,
    overview: ""
  },
  {
    id: 1288445,
    title: "Mutiny",
    poster_path: "/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    backdrop_path: "/e2QAGrEmbpmZpMymDRkDisJkvg9.jpg",
    release_date: "2026",
    vote_average: 6.441,
    overview: ""
  },
  {
    id: 1294189,
    title: "The Mongoose",
    poster_path: "/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
    backdrop_path: "/iRIhPqqoUHiFBxn8oYf3gCQnaKk.jpg",
    release_date: "2026",
    vote_average: 0,
    overview: ""
  },
  {
    id: 1108427,
    title: "Moana",
    poster_path: "/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg",
    backdrop_path: "/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
    release_date: "2026",
    vote_average: 7.227,
    overview: ""
  },
  {
    id: 1440098,
    title: "Drawn Together",
    poster_path: "/6rpvddXbaQPOi0fB2HKWbZ3uUSg.jpg",
    backdrop_path: "/i65y7cMae36K0giN0GRaMjAHUru.jpg",
    release_date: "2026",
    vote_average: 6.62,
    overview: ""
  },
  {
    id: 1137844,
    title: "Mayday",
    poster_path: "/hVXjX1jLZ1ljFSNGXpjJfbTUOa7.jpg",
    backdrop_path: "/g7Ccid5kuD7A8hXWlsQiNfwOxaD.jpg",
    release_date: "2026",
    vote_average: 7.931,
    overview: ""
  },
  {
    id: 1386315,
    title: "The Runner",
    poster_path: "/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg",
    backdrop_path: "/jzBWExXacS33rMQ2zLBrqIVweyG.jpg",
    release_date: "2026",
    vote_average: 6.778,
    overview: ""
  },
  {
    id: 1393326,
    title: "Ghost in the Cell",
    poster_path: "/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg",
    backdrop_path: "/tK3QdOOrX4qEkmSlvrmc8cK7iOU.jpg",
    release_date: "2026",
    vote_average: 7.292,
    overview: ""
  },
  {
    id: 1285366,
    title: "Shape of My Heart",
    poster_path: "/3r0O6BW9USoZ9mteCVyNKMQriRL.jpg",
    backdrop_path: "/yjK3ardrgdS8suZG8KMU82Q7U38.jpg",
    release_date: "2024",
    vote_average: 5.167,
    overview: ""
  },
  {
    id: 1506560,
    title: "Clash of the Thundermans",
    poster_path: "/16oqRrWVzQm6qdGfBxvziZ2UiMT.jpg",
    backdrop_path: "/tBZMwg5oCJn8P0pStfuOMhhSQD3.jpg",
    release_date: "2026",
    vote_average: 6.846,
    overview: ""
  },
  {
    id: 1084244,
    title: "Toy Story 5",
    poster_path: "/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    backdrop_path: "/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
    release_date: "2026",
    vote_average: 8.351,
    overview: ""
  },
  {
    id: 1339713,
    title: "Obsession",
    poster_path: "/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
    backdrop_path: "/rZfmzpixLKLR3Hg2u0WgC7XLFl8.jpg",
    release_date: "2026",
    vote_average: 8.191,
    overview: ""
  }
];

export function Dashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'lists' | 'watchlist'>('lists');
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
              <Link 
                to="/edit-profile"
                className="text-sentix-text hover:text-white text-xs uppercase tracking-wider font-bold transition-colors inline-block mt-2"
              >
                Edit Profile
              </Link>
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
            {MOCK_FAVORITES.slice(0, 4).map((movie) => (
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
                  <div className="text-xs text-sentix-text mt-1">{MOCK_FAVORITES.length} Films</div>
                </div>
              </div>
              
              <div className="group cursor-pointer block">
                {/* Reversing mock array just to look slightly different */}
                <StackedPosters movies={[...MOCK_FAVORITES].reverse()} />
                <div className="mt-3">
                  <h3 className="text-white font-bold text-lg group-hover:text-sentix-cyan transition-colors">Sci-Fi Masterpieces</h3>
                  <div className="text-xs text-sentix-text mt-1">{MOCK_FAVORITES.length} Films</div>
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
      <ComingSoonModal 
        isOpen={showComingSoon.isOpen}
        onClose={() => setShowComingSoon({ isOpen: false, title: '' })}
        title={showComingSoon.title}
      />
    </div>
  );
}
