import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
import crypto from 'crypto';

// Define interfaces
interface UserRequest extends Request {
  user?: any; // Will be replaced with proper User type
  files?: any; // For file uploads
}

interface TokenPayload {
  id: string;
  iat?: number;
  exp?: number;
}

interface UpdateFields {
  [key: string]: any;
  name?: string;
  email?: string;
  bio?: string;
}

// Mock user for development
const createMockUser = (email: string, name: string, role: string = 'admin') => {
  return {
    _id: '60d0fe4f5311236168a109ca',
    id: '60d0fe4f5311236168a109ca',
    name,
    email,
    role,
    avatar: {
      url: 'https://via.placeholder.com/150'
    },
    bio: 'This is a development test user',
    getSignedJwtToken: function() {
      const secret = process.env.JWT_SECRET || 'devmode_secret_key_for_testing';
      // @ts-ignore - Ignoring TypeScript error for jwt.sign
      return jwt.sign(
        { id: this._id },
        secret,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );
    }
  };
};

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
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
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
      const testUser = createMockUser(devTestEmail, 'Test User');
      
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

    // Added detailed logging for admin user
    if (email === 'admin@example.com') {
      console.log(`Admin user found in DB: ${user.email}, Role: ${user.role}`);
      console.log('Attempting to match password for admin@example.com');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (email === 'admin@example.com') {
      console.log(`Password match result for admin@example.com: ${isMatch}`);
    }

    if (!isMatch) {
      console.log(`Password mismatch for email: ${email}`);
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    console.log(`Successful login for: ${email} (${user.name})`);
    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    console.error(`Database error during login: ${error.message}`);
    
    // DEVELOPMENT FALLBACK: If database error occurs in development, use test user
    if (process.env.NODE_ENV === 'development' && 
        email === 'test@example.com' && 
        password === 'password123') {
      
      console.log('🚨 Database error occurred, using development fallback login');
      
      const fallbackUser = createMockUser('test@example.com', 'Test User (Fallback)');
      
      return sendTokenResponse(fallbackUser, 200, res);
    }
    
    // For other users, return the error
    return next(new ErrorResponse('Login failed due to server error', 500));
  }
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const fieldsToUpdate: UpdateFields = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

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
export const updatePassword = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

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
export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
export const updateUserRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    // In a real application, you would send an email here
    // For now, we'll just log the token and URL for development purposes
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);

    // Simulate email sending (in production, use a proper email service)
    console.log(`Email would be sent to: ${user.email}`);
    console.log(`Email subject: Password Reset Request`);
    console.log(`Email message: ${message}`);

    res.status(200).json({
      success: true,
      message: 'Email sent',
      resetToken, // Only for development purposes - remove in production
      resetUrl // Only for development purposes - remove in production
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Refresh JWT token
// @route   POST /api/v1/auth/refresh-token
// @access  Private
export const refreshToken = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new ErrorResponse('No token provided', 401));
  }

  try {
    const secret = process.env.JWT_SECRET || 'devmode_secret_key_for_testing';
    // Verify existing token
    // @ts-ignore - Ignoring TypeScript error for jwt.verify
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
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
export const updateAvatar = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
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
  const maxSize = Number(process.env.MAX_FILE_UPLOAD) || 10000000; // Default to 10MB
  if (file.size > maxSize) {
    console.log('File too large:', file.size);
    return next(new ErrorResponse(`Please upload an image less than ${maxSize / 1000000}MB`, 400));
  }

  try {
    // Configure cloudinary
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log('Cloudinary configured, uploading image');
    
    // Upload image to cloudinary
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
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

    if (!updatedUser) {
      return next(new ErrorResponse('User not found', 404));
    }

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
const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  try {
    // Create token
    console.log(`Attempting to generate token for user: ${user.email} (ID: ${user._id})`);
    const token = user.getSignedJwtToken();
    console.log(`Token generated successfully for user: ${user.email}`);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio
    };

    console.log(`Sending token response for user: ${user.email}`);
    res.status(statusCode).json({
      success: true,
      token,
      user: userData
    });
    console.log(`Token response sent successfully for user: ${user.email}`);

  } catch (error: any) {
    console.error('Error in sendTokenResponse:', error.message);
    console.error('User data that caused error:', {
      id: user?._id,
      email: user?.email,
      name: user?.name
    });
    // To avoid sending an HTML error page, we send a JSON error response.
    // The global errorHandler might still override this if it processes before this response is sent.
    if (!res.headersSent) {
        res.status(500).json({
            success: false,
            message: 'Server error during token response generation.',
            error: error.message // Include specific error message for debugging
        });
    } else {
        // If headers already sent, we can't send a new JSON response.
        // Log and rely on global error handler or client to timeout.
        console.error('Headers already sent in sendTokenResponse, cannot send JSON error.');
    }
  }
};