import { Request, Response, NextFunction, CookieOptions } from 'express';
import { User, IUser } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
import crypto from 'crypto';

// Define interfaces
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

interface UserRequest extends Request {
  user?: IUser;
  files?: any;
}

interface TokenPayload {
  id: string;
  iat?: number;
  exp?: number;
}

interface UpdateFields {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
  bio?: string;
}

// Mock user for development
// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // Public registration cannot assign privileged roles.

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: 'student'
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Validate credentials without writing account identifiers to logs.
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // Regular authentication flow
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    console.error(`Database error during login: ${error.message}`);
    
    // For other users, return the error
    return next(new ErrorResponse('Login failed due to server error', 500));
  }
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  // Invalidate all JWTs issued under the previous account version.
  await User.updateOne({ _id: req.user!._id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.status(200).json({ success: true, message: 'All existing sessions have been signed out' });
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

  const user = await User.findByIdAndUpdate(req.user!.id, fieldsToUpdate, {
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
  const user = await User.findById(req.user!.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
    return next(new ErrorResponse('Provide a current password and a new password of 8–128 characters', 400));
  }
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = newPassword;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
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
export const updateUserRole = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  // Check if role is valid
  if (!['student', 'educator', 'admin'].includes(req.body.role)) {
    return next(new ErrorResponse('Invalid role specified', 400));
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    return next(new ErrorResponse('User not found', 404));
  }
  // Avoid accidental loss of the administrator's own access.
  if (req.user?.id === target.id && req.body.role !== 'admin') {
    return next(new ErrorResponse('Cannot change your own administrator role', 403));
  }
  if (target.role === 'admin' && req.body.role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(new ErrorResponse('Cannot demote the last administrator', 409));
    }
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role: req.body.role }, $inc: { sessionVersion: 1 } },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) return next(new ErrorResponse('User not found', 404));

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  if (req.user?.id === user.id) {
    return next(new ErrorResponse('Cannot delete your own administrator account', 403));
  }
  if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
    return next(new ErrorResponse('Cannot delete the last administrator', 409));
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
export const forgotPassword = asyncHandler(async (_req: Request, res: Response) => {
  // SECURITY HOLD: Old implementation exposed live reset tokens/URLs to callers.
  // Re-enable only after configuring real outbound email, generic responses,
  // single-use token redemption and endpoint rate limiting.
  res.status(503).json({
    success: false,
    error: 'Password recovery is temporarily unavailable. Contact support.'
  });
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

  if (typeof req.body.password !== 'string' || req.body.password.length < 8 || req.body.password.length > 128) {
    return next(new ErrorResponse('Password must be 8–128 characters', 400));
  }
  // Set new password
  user.password = req.body.password;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
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
    const secret = process.env.JWT_SECRET;
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
      public_id: `avatar-${req.user!._id}-${Date.now()}`
    });

    console.log('Cloudinary upload result:', { 
      public_id: result.public_id,
      url: result.secure_url
    });

    // Update user avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
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
const sendTokenResponse = (user: IUser, statusCode: number, res: Response): void => {
  // Create token
  const token = user.getSignedJwtToken();

  // Determine cookie security settings
  const isProd = process.env.NODE_ENV === 'production';
  const sameSiteOption: 'lax' = 'lax';

  const options: CookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE ? parseInt(process.env.JWT_COOKIE_EXPIRE) : 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: sameSiteOption
  };

  // Ensure password is not sent with the user object
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.sessionVersion;
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userObj
    });
};