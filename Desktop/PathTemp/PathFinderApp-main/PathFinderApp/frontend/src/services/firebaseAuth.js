import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBc8yJRCciaXC9ycPfvN7Sc4erTcrhQy68",
  authDomain: "pathfinder-30cbc.firebaseapp.com",
  projectId: "pathfinder-30cbc",
  storageBucket: "pathfinder-30cbc.firebasestorage.app",
  messagingSenderId: "217851551216",
  appId: "1:217851551216:web:63a34eece0098dfa345135",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app);
export const db = getFirestore(app);

export default auth;
