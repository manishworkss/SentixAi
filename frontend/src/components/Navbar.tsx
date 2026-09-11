import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Films', path: '/films' },
    { name: 'Lists', path: '/lists' },
    { name: 'Reviews', path: '/reviews' },
  ];

  return (
    <header className="bg-sentix-panel border-b border-sentix-border sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="SentixAI Logo" className="h-10 object-contain drop-shadow-lg" />
          <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
            Sentix<span className="text-sentix-cyan font-black">[Ai]</span>
          </span>
        </Link>
        
        <div className="flex items-center space-x-6 text-sm font-semibold text-sentix-text uppercase tracking-wider">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-1 pb-1 transition-colors hover:text-white ${
                  isActive ? 'text-white' : ''
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-sentix-cyan"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          
          {currentUser ? (
            <div className="flex items-center space-x-4 ml-6 border-l border-sentix-border pl-6">
              <Link to="/dashboard" className="text-white hover:text-sentix-cyan transition-colors">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </Link>
              <button onClick={logout} className="text-sentix-text hover:text-red-500 transition-colors flex items-center" title="Log Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-6 border-l border-sentix-border pl-6">
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/login?signup=true" className="bg-sentix-green text-sentix-bg px-4 py-2 rounded-md hover:bg-sentix-greenHover transition-colors shadow-sm">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
