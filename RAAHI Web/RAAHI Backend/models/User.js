const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Basic user information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: 50
  },

  // Profile information
  avatar: {
    type: String, // URL to profile picture
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || validator.isMobilePhone(v);
      },
      message: 'Please provide a valid phone number'
    }
  },

  // Tourism preferences for AI training
  travelPreferences: {
    interests: [{
      type: String,
      enum: ['adventure', 'culture', 'food', 'nature', 'history', 'art', 'nightlife', 'shopping', 'relaxation', 'photography']
    }],
    budgetRange: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury']
    },
    travelStyle: {
      type: String,
      enum: ['solo', 'couple', 'family', 'group', 'business']
    },
    accommodationType: [{
      type: String,
      enum: ['hotel', 'hostel', 'apartment', 'resort', 'guesthouse', 'camping']
    }],
    preferredActivities: [{
      type: String
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'dairy-free', 'none']
    }]
  },

  // Location and preferences
  location: {
    country: String,
    city: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },

  // User activity data for AI training
  activityHistory: [{
    action: {
      type: String,
      enum: ['search', 'view', 'bookmark', 'review', 'visit']
    },
    targetType: {
      type: String,
      enum: ['destination', 'attraction', 'restaurant', 'hotel', 'activity']
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    duration: Number, // Time spent in seconds
    rating: Number, // If applicable
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],

  // Account status and verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'business', 'admin'],
    default: 'user'
  },

  // Firebase UID for real-time features
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },

  // Timestamps
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Fixed: removed duplicate indexes for email & username
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ 'activityHistory.timestamp': -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Static method to find users for AI recommendations
userSchema.statics.findSimilarUsers = function(userId, preferences) {
  return this.find({
    _id: { $ne: userId },
    'travelPreferences.interests': { $in: preferences.interests },
    'travelPreferences.budgetRange': preferences.budgetRange
  }).limit(20);
};

module.exports = mongoose.model('User', userSchema);
