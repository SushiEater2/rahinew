const axios = require('axios');

async function testBasicConnection() {
  try {
    console.log('🧪 Testing basic server connection...');
    const response = await axios.get('http://localhost:3000/');
    console.log('✅ Server is reachable');
    console.log('Response status:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    return false;
  }
}

async function testHealthEndpoint() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Health endpoint working');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health endpoint failed:', error.message);
    return false;
  }
}

async function testRegistrationWithMinimalData() {
  try {
    console.log('👤 Testing registration with minimal valid data...');
    
    const userData = {
      email: `test.user.${Date.now()}@example.com`, // Unique email
      password: 'testPass123',
      username: `testuser${Date.now()}`, // Unique username  
      firstName: 'Test',
      lastName: 'User'
    };

    console.log('📧 Testing with email:', userData.email);
    console.log('👤 Testing with username:', userData.username);

    const response = await axios.post('http://localhost:3000/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    if (response.data.success) {
      console.log('✅ Registration successful!');
      console.log('User ID:', response.data.data.user.id);
      console.log('Token received:', response.data.token ? 'Yes' : 'No');
      return { success: true, data: response.data };
    } else {
      console.log('❌ Registration failed:', response.data.error);
      return { success: false, error: response.data.error };
    }

  } catch (error) {
    console.error('❌ Registration request failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error response:', error.response.data);
      return { 
        success: false, 
        error: error.response.data,
        status: error.response.status
      };
    } else if (error.request) {
      console.error('No response received - network/timeout error');
      console.error('Request error:', error.code || error.message);
      return { success: false, error: 'Network/timeout error' };
    } else {
      console.error('Request setup error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

async function testMongoDBConnection() {
  try {
    console.log('🗄️  Testing if server can connect to MongoDB...');
    
    // We'll try to make a request that requires MongoDB and see what error we get
    const testData = {
      email: 'existing.user@example.com',
      password: 'wrongpass'
    };

    const response = await axios.post('http://localhost:3000/api/auth/login', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('✅ MongoDB connection working (got expected auth error)');
        return true;
      } else if (error.response.status === 500) {
        console.log('❌ MongoDB connection issue (500 server error)');
        console.log('Error:', error.response.data);
        return false;
      }
    } else {
      console.log('❌ Network error testing MongoDB connection');
      return false;
    }
  }
}

async function main() {
  console.log('🔍 RAAHI Registration Debugging Tool');
  console.log('=' .repeat(50));

  // Step 1: Test basic connectivity
  const serverReachable = await testBasicConnection();
  if (!serverReachable) {
    console.log('❌ Cannot proceed - server not reachable');
    return;
  }

  console.log('');

  // Step 2: Test health endpoint
  const healthWorking = await testHealthEndpoint();
  if (!healthWorking) {
    console.log('❌ Cannot proceed - health endpoint failing');
    return;
  }

  console.log('');

  // Step 3: Test MongoDB connection indirectly
  const mongoWorking = await testMongoDBConnection();
  if (!mongoWorking) {
    console.log('⚠️  MongoDB connection issues detected');
    console.log('💡 This is likely the cause of registration failures');
  }

  console.log('');

  // Step 4: Test registration
  const registrationResult = await testRegistrationWithMinimalData();
  
  if (registrationResult.success) {
    console.log('🎉 Registration test successful!');
    console.log('💡 The sample user registration script should work now');
  } else {
    console.log('❌ Registration test failed');
    if (registrationResult.status === 500) {
      console.log('💡 This is likely a database connection issue');
      console.log('🔧 Check your MongoDB connection string and network connectivity');
    } else if (registrationResult.status === 400) {
      console.log('💡 This is likely a validation issue');
      console.log('🔧 Check the validation requirements in the error response');
    }
  }
}

// Run the debug script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = {
  testBasicConnection,
  testHealthEndpoint,
  testRegistrationWithMinimalData,
  testMongoDBConnection
};