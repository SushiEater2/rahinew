// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyAFM8gSCXm4Wu3OxeMWZKjUvg6aMevO-FE",
  authDomain: "raahi-adf39.firebaseapp.com",
  projectId: "raahi-adf39",
  storageBucket: "raahi-adf39.firebasestorage.app",
  messagingSenderId: "1086656996206",
  appId: "1:1086656996206:web:01689548aab22f5ebf177f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
