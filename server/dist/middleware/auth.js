"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const asyncHandler_1 = __importDefault(require("./asyncHandler"));
const errorResponse_1 = __importDefault(require("../utils/errorResponse"));
// Protect routes
exports.protect = (0, asyncHandler_1.default)(async (req, res, next) => {
    let token;
    // Check if auth header exists and starts with Bearer
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // Check if token exists
    if (!token) {
        return next(new errorResponse_1.default('Not authorized to access this route', 401));
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'devmode_secret_key_for_testing');
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
        req.user = await User_1.default.findById(decoded.id);
        if (!req.user) {
            return next(new errorResponse_1.default('User not found', 404));
        }
        next();
    }
    catch (err) {
        return next(new errorResponse_1.default('Not authorized to access this route', 401));
    }
});
// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new errorResponse_1.default(`User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
