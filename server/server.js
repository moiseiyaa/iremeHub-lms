// Load environment variables first - before any other imports
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

// Load configuration (this will set environment variables)
require('./config/config');

// Verify environment variables are loaded
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Import database connection
const connectDB = require('./db');

// Import route files
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const progressRoutes = require('./routes/progress');
const paymentRoutes = require('./routes/payments');
const sectionRoutes = require('./routes/sections');
const certificateRoutes = require('./routes/certificates');
const educatorRoutes = require('./routes/educator');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Initialize Express
const app = express();

// Parse Stripe webhook
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/educator', educatorRoutes);

// Mount nested routes
app.use('/api/v1/courses/:courseId/lessons', lessonRoutes);
app.use('/api/v1/courses/:courseId/sections', sectionRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('LMS API is running!');
});

// Health check route to verify MongoDB connection status
app.get('/api/health', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({
        status: 'success',
        message: 'API is healthy',
        dbStatus: 'connected',
        dbName: mongoose.connection.name
      });
    } else {
      res.status(503).json({
        status: 'warning',
        message: 'API is running but database is disconnected',
        dbStatus: 'disconnected',
        readyState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Error handler
app.use(errorHandler);

// Function to start the server
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  
  // Check if port is already in use in development
  if (process.env.NODE_ENV === 'development') {
    const server = require('net').createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use, trying port 5001`);
        app.listen(5001, () => {
          console.log(`Server running on port 5001`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
    
    server.once('listening', () => {
      server.close();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    });
    
    server.listen(PORT);
  } else {
    // In production, just start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

// Connect to database and start server
const startApp = async () => {
  try {
    // Connect to MongoDB with our new module
    const dbConnected = await connectDB();
    
    // Start server regardless of DB connection in development
    startServer();
    
    if (!dbConnected && process.env.NODE_ENV !== 'development') {
      console.warn('Warning: Running without database connection. Some features will not work.');
      console.warn('Please check your .env file and update the MONGODB_URI if needed.');
      console.warn('You can try one of the alternative MongoDB connection options in the .env file.');
    }
  } catch (error) {
    console.error('Failed to start the application:', error);
        
    // In development, start server anyway for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('Starting server without database for troubleshooting...');
      startServer();
    }
  }
};

// Start the application
startApp();

module.exports = app;