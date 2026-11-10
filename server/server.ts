import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
import enrollmentRequestRoutes from './routes/enrollmentRequestRoutes';

// Load environment variables
dotenv.config();

// Database and signing-key readiness are checked before listening.

// Initialize Express
const app: Express = express();

// Provider-neutral API security defaults.
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// File upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per uploaded file
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Health endpoints are independent of any deployment provider.
// Liveness answers whether this Node process is serving HTTP; readiness
// requires a usable MongoDB connection before accepting normal traffic.
app.get('/api/v1/health/live', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', service: 'iremehub-api' });
});
app.get('/api/v1/health/ready', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
});

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
app.use('/api/v1', enrollmentRequestRoutes);

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

// Start only after critical configuration and database availability are verified.
const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  if (!(await connectDB())) {
    throw new Error('Database connection unavailable; refusing to accept requests.');
  }

  const server = app.listen(PORT, () => {
    console.log(`iremehub+ API listening on port ${PORT}`);
  });

  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled rejection:', err?.message || 'Unknown failure');
    server.close(() => { process.exitCode = 1; });
  });
};

// Importing the app for tests does not open a listening socket.
if (require.main === module) {
  void startServer().catch(error => {
    console.error('Startup aborted:', error instanceof Error ? error.message : 'Unknown error');
    process.exitCode = 1;
  });
}

export { startServer };
export default app; 
