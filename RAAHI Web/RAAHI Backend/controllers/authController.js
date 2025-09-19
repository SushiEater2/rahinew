const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { initializeFirebase } = require('../config/firebase');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Create token response
const createTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  // Update last login
  user.lastLogin = new Date();
  user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        travelPreferences: user.travelPreferences,
        location: user.location,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    },
    tokenInfo: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      type: 'Bearer'
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      phone,
      travelPreferences,
      location
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          error: 'A user with this email already exists'
        });
      }
      
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          error: 'Username is already taken'
        });
      }
    }

    let firebaseUser = null;
    let mongoUser = null;

    try {
      // Initialize Firebase services
      const firebaseServices = initializeFirebase();
      const auth = firebaseServices.auth;

      // Create Firebase user first
      firebaseUser = await auth.createUser({
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`,
        disabled: false,
        emailVerified: false
      });

      console.log(`✅ Firebase user created: ${firebaseUser.uid}`);

      // Create user object for MongoDB
      const userData = {
        email,
        password,
        username,
        firstName,
        lastName,
        firebaseUid: firebaseUser.uid // Link Firebase UID
      };

      // Add optional fields
      if (phone) userData.phone = phone;
      if (travelPreferences) userData.travelPreferences = travelPreferences;
      if (location) userData.location = location;

      // Create MongoDB user
      mongoUser = await User.create(userData);

      console.log(`✅ MongoDB user created: ${mongoUser.email} (${mongoUser.username})`);

      // Set custom claims in Firebase for user role
      await auth.setCustomUserClaims(firebaseUser.uid, {
        role: mongoUser.role,
        mongoId: mongoUser._id.toString(),
        username: mongoUser.username
      });

      // Successfully created both Firebase and MongoDB users
      const user = mongoUser;
      
      // Log user creation
      console.log(`✅ New user registered: ${user.email} (${user.username})`);

      createTokenResponse(user, 201, res, 'User registered successfully');
      
    } catch (createError) {
      console.error('User creation error:', createError);
      
      // Cleanup: If Firebase user was created but MongoDB failed, delete Firebase user
      if (firebaseUser && !mongoUser) {
        try {
          const firebaseServices = initializeFirebase();
          await firebaseServices.auth.deleteUser(firebaseUser.uid);
          console.log(`🧹 Cleaned up Firebase user: ${firebaseUser.uid}`);
        } catch (cleanupError) {
          console.error('Firebase cleanup error:', cleanupError);
        }
      }
      
      // Re-throw the error to be handled by the outer catch block
      throw createError;
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log(`✅ User logged in: ${user.email} (${user.username})`);

    createTokenResponse(user, 200, res, 'Logged in successfully');

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          travelPreferences: user.travelPreferences,
          location: user.location,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      travelPreferences,
      location
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone; // Allow clearing phone
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (travelPreferences) updateData.travelPreferences = travelPreferences;
    if (location) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ Profile updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          travelPreferences: user.travelPreferences,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is primarily handled on the frontend
    // by removing the token from storage. However, we can log the event.
    
    console.log(`✅ User logged out: ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

// @desc    Verify Firebase token and get user data
// @route   POST /api/auth/verify-firebase
// @access  Public
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        error: 'Firebase token is required'
      });
    }

    // Initialize Firebase services
    const firebaseServices = initializeFirebase();
    const auth = firebaseServices.auth;

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(firebaseToken);
    const { uid, email } = decodedToken;

    // Find user in MongoDB by Firebase UID
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found in database'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    console.log(`✅ Firebase user verified: ${user.email} (${user.username})`);

    createTokenResponse(user, 200, res, 'Firebase authentication successful');

  } catch (error) {
    console.error('Firebase token verification error:', error);
    
    if (error.code) {
      // Firebase-specific errors
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired Firebase token'
      });
    }
    
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  verifyFirebaseToken
};
