const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs`,
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
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