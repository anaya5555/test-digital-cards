import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Added GoogleAuthProvider here

const firebaseConfig = {
  apiKey: "AIzaSyCMoDuMsR4CAxcOTnoKrsFfIEkqlkP6UpI",
  authDomain: "testdigitalcards.firebaseapp.com",
  projectId: "testdigitalcards",
  storageBucket: "testdigitalcards.appspot.com",
  messagingSenderId: "866670933249",
  appId: "1:866670933249:web:b5f6b36a10d852a5e0d700"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // Added this line

// Optional: Set custom OAuth parameters if needed
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection even when logged in
});