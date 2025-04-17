import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Add this line
import { getAuth } from "firebase/auth"; // Optional (for future logins)

const firebaseConfig = {
  apiKey: "AIzaSyCMoDuMsR4CAxcOTnoKrsFfIEkqlkP6UpI",
  authDomain: "testdigitalcards.firebaseapp.com",
  projectId: "testdigitalcards",
  storageBucket: "testdigitalcards.appspot.com", // Fixed storageBucket (remove .app)
  messagingSenderId: "866670933249",
  appId: "1:866670933249:web:b5f6b36a10d852a5e0d700"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export Firestore
export const auth = getAuth(app); // Optional (for future logins)