import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import asyncHandler from './asyncHandler';
import ErrorResponse from '../utils/errorResponse';



// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Fallback: check cookie named "token"
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token as string;
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devmode_secret_key_for_testing') as jwt.JwtPayload;

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
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};