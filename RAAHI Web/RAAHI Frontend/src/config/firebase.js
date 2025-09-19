import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables or defaults
// This configuration should match the shared firebase-config.json in the root
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFM8gSCXm4Wu3OxeMWZKjUvg6aMevO-FE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "raahi-adf39.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "raahi-adf39",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "raahi-adf39.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1086656996206",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1086656996206:web:01689548aab22f5ebf177f",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://raahi-adf39-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Connect to emulators in development mode
if (import.meta.env.DEV && !auth._delegate._config.emulator) {
  try {
    // Only connect if not already connected
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulators might not be running, continue without them
    console.log('Firebase emulators not available, using production Firebase');
  }
}

export default app;