"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const auth_1 = __importDefault(require("./routes/auth"));
// Load environment variables
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
// Initialize Express
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
}
// Set static folder
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Mount routes
app.use('/api/v1/auth', auth_1.default);
// Basic route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'IremehHub LMS API',
        version: '1.0.0'
    });
});
// Error handler
app.use(errorHandler_1.default);
// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
exports.default = server;
