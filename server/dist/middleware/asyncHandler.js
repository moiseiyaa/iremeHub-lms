"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Async handler to avoid try-catch blocks in route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.default = asyncHandler;
