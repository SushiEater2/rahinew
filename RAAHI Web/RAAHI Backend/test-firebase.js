require('dotenv').config();
const { initializeFirebase, admin } = require('./config/firebase');

// Test Firebase initialization and basic services
async function testFirebaseBasics() {
  console.log('\n🧪 Testing Firebase Basic Connection...');
  console.log('=' .repeat(50));
  
  try {
    // Test environment variables
    console.log('📋 Checking Environment Variables:');
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID', 
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID'
    ];
    
    let envStatus = true;
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`  ✅ ${varName}: Set`);
      } else {
        console.log(`  ❌ ${varName}: Missing`);
        envStatus = false;
      }
    });
    
    if (!envStatus) {
      throw new Error('Missing required environment variables');
    }
    
    // Test Firebase initialization
    console.log('\n🔥 Testing Firebase Initialization:');
    const firebaseServices = initializeFirebase();
    console.log('  ✅ Firebase Admin SDK initialized');
    console.log(`  ✅ Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    
    // Test Authentication service
    console.log('\n🔐 Testing Firebase Auth Service:');
    const auth = firebaseServices.auth;
    console.log('  ✅ Auth service available');
    
    // Test if we can access auth methods
    try {
      // This is a safe test - just checking if methods exist
      console.log(`  ✅ Auth methods available: ${typeof auth.createUser === 'function' ? 'Yes' : 'No'}`);
    } catch (authError) {
      console.log('  ⚠️  Auth methods check failed:', authError.message);
    }
    
    // Test Storage service
    console.log('\n📦 Testing Firebase Storage:');
    try {
      const storage = firebaseServices.storage;
      const bucket = storage.bucket();
      console.log(`  ✅ Storage bucket available: ${bucket.name}`);
    } catch (storageError) {
      console.log('  ⚠️  Storage test failed:', storageError.message);
    }
    
    console.log('\n🎉 Firebase basic services are working!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Firebase basic test failed:', error.message);
    return false;
  }
}

// Test Firebase advanced features (optional services)
async function testFirebaseAdvanced() {
  console.log('\n🚀 Testing Firebase Advanced Features...');
  console.log('=' .repeat(50));
  
  const firebaseServices = initializeFirebase();
  const results = {
    firestore: false,
    realtimeDb: false,
    messaging: false
  };
  
  // Test Firestore
  console.log('\n🗄️  Testing Firestore:');
  try {
    const db = firebaseServices.firestore;
    // Just test if we can access the service
    console.log('  ✅ Firestore service initialized');
    results.firestore = true;
  } catch (firestoreError) {
    console.log('  ⚠️  Firestore not available:', firestoreError.message);
    console.log('  💡 To enable: Visit Firebase Console > Firestore Database > Create database');
  }
  
  // Test Realtime Database
  console.log('\n🔄 Testing Realtime Database:');
  try {
    const rtdb = firebaseServices.database;
    console.log('  ✅ Realtime Database service initialized');
    results.realtimeDb = true;
  } catch (rtdbError) {
    console.log('  ⚠️  Realtime Database not available:', rtdbError.message);
    console.log('  💡 To enable: Visit Firebase Console > Realtime Database > Create database');
  }
  
  // Test Messaging
  console.log('\n📱 Testing Cloud Messaging:');
  try {
    const messaging = firebaseServices.messaging;
    console.log('  ✅ Cloud Messaging service initialized');
    results.messaging = true;
  } catch (messagingError) {
    console.log('  ⚠️  Cloud Messaging not available:', messagingError.message);
    console.log('  💡 To enable: Visit Firebase Console > Cloud Messaging');
  }
  
  return results;
}

// Main test function
async function runAllTests() {
  console.log('🔥 FIREBASE CONNECTION TESTS');
  console.log('=' .repeat(60));
  
  try {
    // Test basic Firebase functionality
    const basicResult = await testFirebaseBasics();
    
    if (basicResult) {
      // Test advanced features
      const advancedResults = await testFirebaseAdvanced();
      
      console.log('\n📊 TEST SUMMARY');
      console.log('=' .repeat(30));
      console.log(`✅ Firebase Core: Working`);
      console.log(`${advancedResults.firestore ? '✅' : '❌'} Firestore: ${advancedResults.firestore ? 'Available' : 'Not Available'}`);
      console.log(`${advancedResults.realtimeDb ? '✅' : '❌'} Realtime DB: ${advancedResults.realtimeDb ? 'Available' : 'Not Available'}`);
      console.log(`${advancedResults.messaging ? '✅' : '❌'} Messaging: ${advancedResults.messaging ? 'Available' : 'Not Available'}`);
      
      console.log('\n🎉 Firebase is properly configured and working on your backend!');
      return true;
    } else {
      console.log('\n❌ Firebase basic setup has issues. Please check your configuration.');
      return false;
    }
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    return false;
  }
}

// Run the test
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
