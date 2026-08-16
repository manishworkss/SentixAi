import React, { createContext, useContext, useEffect, useState } from 'react';

// Mock User interface to match Firebase's minimal expected shape
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start with a dummy user for development
  const [currentUser, setCurrentUser] = useState<User | null>({
    uid: 'mock-uid-12345',
    email: 'mock@example.com',
    displayName: 'Mock User',
    photoURL: null,
  });
  
  const [loading, setLoading] = useState(false);

  // Mock functions that just resolve immediately
  const login = async (email: string, pass: string) => {
    setCurrentUser({ uid: 'mock-uid-' + Date.now(), email, displayName: 'Mock User', photoURL: null });
  };
  
  const signup = async (email: string, pass: string) => {
    setCurrentUser({ uid: 'mock-uid-' + Date.now(), email, displayName: 'Mock User', photoURL: null });
  };
  
  const loginWithGoogle = async () => {
    setCurrentUser({ uid: 'mock-uid-google', email: 'google@example.com', displayName: 'Google User', photoURL: null });
  };
  
  const logout = async () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
