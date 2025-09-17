const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`🚨 Error in ${req.method} ${req.path}:`, err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      isOperational: true
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const value = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${value}. Please use another value`;
    error = {
      message,
      statusCode: 400,
      isOperational: true
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(error => error.message).join(', ');
    error = {
      message,
      statusCode: 400,
      isOperational: true
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = {
      message,
      statusCode: 401,
      isOperational: true
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = {
      message,
      statusCode: 401,
      isOperational: true
    };
  }

  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    let message = 'Authentication error';
    
    switch (err.code) {
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Invalid credentials';
        break;
      case 'auth/email-already-in-use':
        message = 'Email is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      default:
        message = err.message || 'Authentication error';
    }

    error = {
      message,
      statusCode: 400,
      isOperational: true
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    requestId: req.id,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

module.exports = errorHandler;