const validator = require('validator');

// Validation utility functions
const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!validator.isEmail(email)) return 'Please provide a valid email address';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  if (password.length > 128) return 'Password must not exceed 128 characters';
  
  // Check for at least one number, one letter
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  
  return null;
};

const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters long';
  if (username.length > 30) return 'Username must not exceed 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

const validateName = (name, fieldName) => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
  if (name.length > 50) return `${fieldName} must not exceed 50 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, apostrophes, and hyphens`;
  }
  return null;
};

const validatePhone = (phone) => {
  if (!phone) return null; // Phone is optional
  if (!validator.isMobilePhone(phone)) return 'Please provide a valid phone number';
  return null;
};

// Middleware functions
const validateRegistration = (req, res, next) => {
  const errors = [];
  const { email, password, username, firstName, lastName, phone } = req.body;

  // Validate required fields
  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  const usernameError = validateUsername(username);
  if (usernameError) errors.push(usernameError);

  const firstNameError = validateName(firstName, 'First name');
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = validateName(lastName, 'Last name');
  if (lastNameError) errors.push(lastNameError);

  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Sanitize data
  req.body.email = validator.normalizeEmail(email);
  req.body.username = username.trim().toLowerCase();
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  if (phone) req.body.phone = phone.trim();

  next();
};

const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Sanitize email
  req.body.email = validator.normalizeEmail(email);

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const errors = [];
  const { firstName, lastName, phone, dateOfBirth } = req.body;

  // Validate optional fields if provided
  if (firstName) {
    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) errors.push(firstNameError);
    else req.body.firstName = firstName.trim();
  }

  if (lastName) {
    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) errors.push(lastNameError);
    else req.body.lastName = lastName.trim();
  }

  if (phone) {
    const phoneError = validatePhone(phone);
    if (phoneError) errors.push(phoneError);
    else req.body.phone = phone.trim();
  }

  if (dateOfBirth) {
    if (!validator.isDate(dateOfBirth)) {
      errors.push('Please provide a valid date of birth');
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        errors.push('Age must be between 13 and 120 years');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

const validateTravelPreferences = (req, res, next) => {
  const { travelPreferences } = req.body;
  
  if (!travelPreferences) return next();

  const errors = [];
  const validInterests = ['adventure', 'culture', 'food', 'nature', 'history', 'art', 'nightlife', 'shopping', 'relaxation', 'photography'];
  const validBudgetRanges = ['budget', 'mid-range', 'luxury'];
  const validTravelStyles = ['solo', 'couple', 'family', 'group', 'business'];
  const validAccommodationTypes = ['hotel', 'hostel', 'apartment', 'resort', 'guesthouse', 'camping'];
  const validDietaryRestrictions = ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'dairy-free', 'none'];

  // Validate interests
  if (travelPreferences.interests && Array.isArray(travelPreferences.interests)) {
    const invalidInterests = travelPreferences.interests.filter(interest => !validInterests.includes(interest));
    if (invalidInterests.length > 0) {
      errors.push(`Invalid interests: ${invalidInterests.join(', ')}`);
    }
  }

  // Validate budget range
  if (travelPreferences.budgetRange && !validBudgetRanges.includes(travelPreferences.budgetRange)) {
    errors.push('Invalid budget range');
  }

  // Validate travel style
  if (travelPreferences.travelStyle && !validTravelStyles.includes(travelPreferences.travelStyle)) {
    errors.push('Invalid travel style');
  }

  // Validate accommodation types
  if (travelPreferences.accommodationType && Array.isArray(travelPreferences.accommodationType)) {
    const invalidTypes = travelPreferences.accommodationType.filter(type => !validAccommodationTypes.includes(type));
    if (invalidTypes.length > 0) {
      errors.push(`Invalid accommodation types: ${invalidTypes.join(', ')}`);
    }
  }

  // Validate dietary restrictions
  if (travelPreferences.dietaryRestrictions && Array.isArray(travelPreferences.dietaryRestrictions)) {
    const invalidRestrictions = travelPreferences.dietaryRestrictions.filter(restriction => !validDietaryRestrictions.includes(restriction));
    if (invalidRestrictions.length > 0) {
      errors.push(`Invalid dietary restrictions: ${invalidRestrictions.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Travel preferences validation failed',
      details: errors
    });
  }

  next();
};

// Sanitize common inputs
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return validator.escape(str.trim());
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateTravelPreferences,
  sanitizeInput,
  // Export individual validators for reuse
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validatePhone
};