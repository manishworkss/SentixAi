import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD33Np3CDmX1Ci6DUhZTnInd8NOYtb542E",
  authDomain: "sentixai-fb552.firebaseapp.com",
  projectId: "sentixai-fb552",
  storageBucket: "sentixai-fb552.firebasestorage.app",
  messagingSenderId: "644490164244",
  appId: "1:644490164244:web:c33659853a26efb00e0f01",
  measurementId: "G-5FY0SGM5D8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

