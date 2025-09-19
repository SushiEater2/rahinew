const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load shared Firebase configuration
const configPath = path.join(__dirname, '../../firebase-config.json');
let sharedConfig = {};
try {
  const configData = fs.readFileSync(configPath, 'utf8');
  sharedConfig = JSON.parse(configData);
} catch (error) {
  console.warn('Could not load shared Firebase config, using environment variables');
}

// Firebase project configuration (using shared config as fallback)
const FIREBASE_CONFIG = {
  projectId: process.env.FIREBASE_PROJECT_ID || sharedConfig.projectId || 'raahi-adf39',
  databaseURL: process.env.FIREBASE_DATABASE_URL || sharedConfig.databaseURL || 'https://raahi-adf39-default-rtdb.firebaseio.com',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || sharedConfig.storageBucket || 'raahi-adf39.firebasestorage.app'
};

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || FIREBASE_CONFIG.projectId,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://oauth2.googleapis.com/token',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs`,
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: FIREBASE_CONFIG.databaseURL,
        storageBucket: FIREBASE_CONFIG.storageBucket
      });

      console.log('Firebase Admin SDK initialized successfully');
    }

    return {
      auth: admin.auth(),
      database: admin.database(),
      firestore: admin.firestore(),
      storage: admin.storage(),
      messaging: admin.messaging()
    };

  } catch (error) {
    console.error('Error initializing Firebase:', error.message);
    throw error;
  }
};

module.exports = { initializeFirebase, admin };