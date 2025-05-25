"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = __importDefault(require("../utils/errorResponse"));
// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log to console for dev
    console.error(err);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new errorResponse_1.default(message, 404);
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new errorResponse_1.default(message, 400);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError' && err.errors) {
        const messages = Object.values(err.errors).map(val => {
            if (typeof val === 'object' && val !== null && 'message' in val) {
                return val.message;
            }
            return 'Invalid value';
        });
        error = new errorResponse_1.default(messages.join(', '), 400);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Not authorized to access this route';
        error = new errorResponse_1.default(message, 401);
    }
    // Token expired error
    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again';
        error = new errorResponse_1.default(message, 401);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};
exports.default = errorHandler;
