const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Sample user data
const sampleUser = {
  email: 'john.traveler@example.com',
  password: 'securePass123',
  username: 'johntraveler',
  firstName: 'John',
  lastName: 'Traveler'
};

async function registerSampleUser() {
  try {
    console.log('🚀 Registering sample user...');
    console.log('📧 Email:', sampleUser.email);
    console.log('👤 Username:', sampleUser.username);
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, sampleUser, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });

    if (response.data.success) {
      console.log('\n✅ User registered successfully!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      // Store the token for future use
      const token = response.data.token;
      console.log('\n🔑 JWT Token (first 50 chars):', token.substring(0, 50) + '...');
      
      return {
        success: true,
        user: response.data.data.user,
        token: token
      };
    } else {
      console.log('❌ Registration failed:', response.data.error);
      return { success: false, error: response.data.error };
    }

  } catch (error) {
    console.error('❌ Error during registration:');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      return { 
        success: false, 
        error: error.response.data.error || error.response.data.message,
        details: error.response.data.details
      };
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received. Is the server running on port 3000?');
      return { success: false, error: 'No response from server' };
    } else {
      // Something else went wrong
      console.error('Request setup error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Test login with the registered user
async function testLogin(email, password) {
  try {
    console.log('\n🔐 Testing login...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('👤 User ID:', response.data.data.user.id);
      console.log('📧 Email:', response.data.data.user.email);
      console.log('🌟 Travel Interests:', response.data.data.user.travelPreferences.interests.join(', '));
      return { success: true, token: response.data.token };
    } else {
      console.log('❌ Login failed:', response.data.error);
      return { success: false, error: response.data.error };
    }

  } catch (error) {
    console.error('❌ Error during login:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return { success: false, error: error.message };
  }
}

// Get user profile using token
async function getUserProfile(token) {
  try {
    console.log('\n👤 Fetching user profile...');
    
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data.success) {
      console.log('✅ Profile retrieved successfully!');
      const user = response.data.data.user;
      
      console.log('\n📋 User Profile:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'Not provided'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      
      if (user.travelPreferences) {
        console.log('\n🧳 Travel Preferences:');
        console.log(`   Interests: ${user.travelPreferences.interests?.join(', ') || 'None'}`);
        console.log(`   Budget Range: ${user.travelPreferences.budgetRange || 'Not specified'}`);
        console.log(`   Travel Style: ${user.travelPreferences.travelStyle || 'Not specified'}`);
        console.log(`   Accommodation: ${user.travelPreferences.accommodationType?.join(', ') || 'None'}`);
        console.log(`   Dietary Restrictions: ${user.travelPreferences.dietaryRestrictions?.join(', ') || 'None'}`);
      }
      
      if (user.location) {
        console.log('\n📍 Location:');
        console.log(`   City: ${user.location.city || 'Not specified'}`);
        console.log(`   Country: ${user.location.country || 'Not specified'}`);
      }
      
      return { success: true, user: user };
    }

  } catch (error) {
    console.error('❌ Error fetching profile:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return { success: false, error: error.message };
  }
}

// Main execution function
async function main() {
  console.log('🎯 RAAHI Smart Tourism - Sample User Registration');
  console.log('=' .repeat(60));
  
  // Step 1: Register the user
  const registrationResult = await registerSampleUser();
  
  if (!registrationResult.success) {
    console.log('\n❌ Registration failed. Stopping...');
    return;
  }
  
  // Step 2: Test login
  const loginResult = await testLogin(sampleUser.email, sampleUser.password);
  
  if (!loginResult.success) {
    console.log('\n❌ Login test failed.');
    return;
  }
  
  // Step 3: Get user profile
  await getUserProfile(loginResult.token);
  
  console.log('\n🎉 Sample user registration and testing completed successfully!');
  console.log('\n💡 You can now use these credentials to test the application:');
  console.log(`   Email: ${sampleUser.email}`);
  console.log(`   Password: ${sampleUser.password}`);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = {
  registerSampleUser,
  testLogin,
  getUserProfile,
  sampleUser
};