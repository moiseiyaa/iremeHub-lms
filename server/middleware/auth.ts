import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import asyncHandler from './asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import { isSessionVersionValid } from '../utils/sessionPolicy';
import { allowCookieRequest } from '../utils/cookieOriginPolicy';



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
  let usedCookie = false;

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
    usedCookie = true;
  }

  // Cookie-backed writes must originate from the actual frontend. Calls using
  // explicit Bearer tokens are not authenticated by ambient browser cookies.
  // Configure FRONTEND_URL to the exact browser origin for each environment.
  if (usedCookie && !allowCookieRequest(
    req.method, req.headers.origin, process.env.FRONTEND_URL || 'http://localhost:3000'
  )) {
    return next(new ErrorResponse('Untrusted origin for cookie-authenticated request', 403));
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    // A stored per-account version revokes every previously issued JWT.
    // JWTs issued before this migration lack 'sv' and must reauthenticate.
    req.user = await User.findById(decoded.id).select('+sessionVersion');
    if (!req.user ||
        !isSessionVersionValid(decoded.sv, req.user.sessionVersion ?? 0)) {
      return next(new ErrorResponse('Session expired. Please sign in again.', 401));
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