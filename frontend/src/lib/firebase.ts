import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Replace with your actual Firebase config from console
const firebaseConfig = {
  apiKey: "PLACEHOLDER-API-KEY",
  authDomain: "sentixai-placeholder.firebaseapp.com",
  projectId: "sentixai-placeholder",
  storageBucket: "sentixai-placeholder.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
