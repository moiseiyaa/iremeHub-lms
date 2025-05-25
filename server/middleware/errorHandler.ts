import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';

interface MongooseError extends Error {
  code?: number;
  errors?: Record<string, { message: string }>;
  value?: string;
  statusCode?: number;
}

// Error handler middleware
const errorHandler = (err: MongooseError, req: Request, res: Response, next: NextFunction): void => {
  let error = { ...err } as MongooseError;
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map(val => {
      if (typeof val === 'object' && val !== null && 'message' in val) {
        return val.message;
      }
      return 'Invalid value';
    });
    error = new ErrorResponse(messages.join(', '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route';
    error = new ErrorResponse(message, 401);
  }

  // Token expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export default errorHandler; 