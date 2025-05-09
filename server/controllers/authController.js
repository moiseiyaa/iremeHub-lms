const { User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if role is valid and enforce admin restrictions
  if (role === 'admin' && req.user?.role !== 'admin') {
    return next(new ErrorResponse('Admin role cannot be assigned during registration', 403));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student' // Default to student if role not provided
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // DEVELOPMENT MODE: Allow test user login
  if (process.env.NODE_ENV === 'development') {
    // Default test credentials
    const devTestEmail = 'test@example.com';
    const devTestPassword = 'password123';
    
    if (email === devTestEmail && password === devTestPassword) {
      console.log('👋 Development mode: Allowing test user login without database check');
      
      // Create mock user for development testing
      const testUser = {
        _id: '60d0fe4f5311236168a109ca',
        id: '60d0fe4f5311236168a109ca', // Some functions use id instead of _id
        name: 'Test User',
        email: devTestEmail,
        role: 'admin',
        avatar: {
          url: 'https://via.placeholder.com/150'
        },
        bio: 'This is a development test user that works without database access',
        getSignedJwtToken: function() {
          return jwt.sign(
            { id: this._id },
            process.env.JWT_SECRET || 'devmode_secret_key_for_testing',
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
          );
        }
      };
      
      return sendTokenResponse(testUser, 200, res);
    }
  }

  try {
    // Regular authentication flow
    console.log(`Attempting database login for email: ${email}`);
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`User not found for email: ${email}`);
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log(`Password mismatch for email: ${email}`);
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    console.log(`Successful login for: ${email} (${user.name})`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(`Database error during login: ${error.message}`);
    
    // DEVELOPMENT FALLBACK: If database error occurs in development, use test user
    if (process.env.NODE_ENV === 'development' && 
        email === 'test@example.com' && 
        password === 'password123') {
      
      console.log('🚨 Database error occurred, using development fallback login');
      
      const fallbackUser = {
        _id: '60d0fe4f5311236168a109ca',
        id: '60d0fe4f5311236168a109ca',
        name: 'Test User (Fallback)',
        email: 'test@example.com',
        role: 'admin',
        avatar: {
          url: 'https://via.placeholder.com/150'
        },
        bio: 'This is a fallback test user for when database access fails',
        getSignedJwtToken: function() {
          return jwt.sign(
            { id: this._id },
            process.env.JWT_SECRET || 'devmode_secret_key_for_testing',
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
          );
        }
      };
      
      return sendTokenResponse(fallbackUser, 200, res);
    }
    
    // For other users, return the error
    return next(new ErrorResponse('Login failed due to server error', 500));
  }
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private (Admin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/auth/users/:id
// @access  Private (Admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user role
// @route   PUT /api/v1/auth/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  // Check if role is valid
  if (!['student', 'educator', 'admin'].includes(req.body.role)) {
    return next(new ErrorResponse('Invalid role specified', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Refresh JWT token
// @route   POST /api/v1/auth/refresh-token
// @access  Private
exports.refreshToken = asyncHandler(async (req, res, next) => {
  // Get token from header
  const token = req.headers.authorization.split(' ')[1];
  
  try {
    // Verify existing token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Generate a new token
    const newToken = user.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    return next(new ErrorResponse('Invalid token', 401));
  }
});

// @desc    Update user avatar
// @route   PUT /api/v1/auth/updateavatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res, next) => {
  console.log('Update avatar request received');
  
  // Check if file is uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No files were uploaded');
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.avatar;
  console.log('File received:', { name: file.name, size: file.size, mimetype: file.mimetype });

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    console.log('Invalid file type:', file.mimetype);
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  const maxSize = process.env.MAX_FILE_UPLOAD || 10000000; // Default to 10MB
  if (file.size > maxSize) {
    console.log('File too large:', file.size);
    return next(new ErrorResponse(`Please upload an image less than ${maxSize / 1000000}MB`, 400));
  }

  try {
    // Configure cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log('Cloudinary configured, uploading image');
    
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'avatars',
      width: 200,
      crop: "fill",
      public_id: `avatar-${req.user._id}-${Date.now()}`
    });

    console.log('Cloudinary upload result:', { 
      public_id: result.public_id,
      url: result.secure_url
    });

    // Update user avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        avatar: {
          public_id: result.public_id,
          url: result.secure_url
        }
      },
      { new: true }
    );

    console.log('User updated with new avatar:', {
      userId: updatedUser._id,
      avatar: updatedUser.avatar
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return next(new ErrorResponse('Error uploading image', 500));
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio
    }
  });
};