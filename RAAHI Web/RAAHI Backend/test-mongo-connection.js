const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDBConnection() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Port:', conn.connection.port);
    console.log('Ready State:', conn.connection.readyState);
    
    // Test a simple operation
    console.log('🧪 Testing database operation...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.cause) {
      console.error('Caused by:', error.cause.message);
    }
    
    process.exit(1);
  }
}

testMongoDBConnection();