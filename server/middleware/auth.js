const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { User } = require('../models');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devmode_secret_key_for_testing');

    // For development mode - allow test user without DB access
    if (process.env.NODE_ENV === 'development' && decoded.id === '60d0fe4f5311236168a109ca') {
      console.log('Development mode: Using test user bypass');
      req.user = {
        _id: '60d0fe4f5311236168a109ca',
        id: '60d0fe4f5311236168a109ca',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      };
      return next();
    }

    // Set user to req.user
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};