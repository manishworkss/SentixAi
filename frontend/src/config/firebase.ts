import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "REMOVED_FIREBASE_KEY",
  authDomain: "sentixai-bdafb.firebaseapp.com",
  projectId: "sentixai-bdafb",
  storageBucket: "sentixai-bdafb.firebasestorage.app",
  messagingSenderId: "220265160585",
  appId: "1:220265160585:web:9ab3e77a6fd7d46fc38b58",
  measurementId: "G-PFL7WKPEYL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
