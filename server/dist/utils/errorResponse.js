"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorResponse extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Set prototype explicitly to maintain instanceof checks
        Object.setPrototypeOf(this, ErrorResponse.prototype);
    }
}
exports.default = ErrorResponse;
