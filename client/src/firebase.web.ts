import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDrrzYmb7jgRpzfEWT9edYAy5kDWWiZu6Q",
  authDomain: "oauth-4df77.firebaseapp.com",
  projectId: "oauth-4df77",
  storageBucket: "oauth-4df77.firebasestorage.app",
  messagingSenderId: "917950144788",
  appId: "1:917950144788:web:5db363233fcbcaf4656201",
  measurementId: "G-EHGM3TPBD1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup }; 