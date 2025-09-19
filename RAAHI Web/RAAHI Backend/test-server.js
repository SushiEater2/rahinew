require('dotenv').config();
const databaseManager = require('./config/database');

async function testServer() {
  try {
    console.log('🚀 Testing server startup with Firebase...');
    
    // Initialize database connections (including Firebase)
    await databaseManager.connect();
    
    console.log('✅ Server components initialized successfully!');
    console.log('✅ Firebase is working on your backend!');
    
    // Show Firebase status
    const firebaseServices = databaseManager.getFirebaseServices();
    if (firebaseServices) {
      console.log('🔥 Firebase services available:');
      console.log('  - Auth:', !!firebaseServices.auth);
      console.log('  - Firestore:', !!firebaseServices.firestore);
      console.log('  - Storage:', !!firebaseServices.storage);
      console.log('  - Messaging:', !!firebaseServices.messaging);
      console.log('  - Realtime DB:', !!firebaseServices.database);
    }
    
    // Cleanup
    await databaseManager.disconnect();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    process.exit(1);
  }
}

testServer();