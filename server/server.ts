import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fileUpload from 'express-fileupload';
import connectDB from './db';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/auth';
import blogRoutes from './routes/blogs';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import sectionRoutes from './routes/sections';
import progressRoutes from './routes/progress';
import certificateRoutes from './routes/certificates';
import announcementRoutes from './routes/announcements';
import educatorRoutes from './routes/educator';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app: Express = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// File upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/educator', educatorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'IremehHub LMS API',
    version: '1.0.0'
  });
});

// Error handler
app.use(errorHandler);

// Export the Express app for Vercel to handle.
// Vercel will manage the server lifecycle, so we don't call app.listen().
export default app; 
