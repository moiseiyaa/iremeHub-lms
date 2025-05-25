import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadThumbnail,
  getCoursesByInstructor,
  addRating,
  getCourseRatings,
  getSingleRating,
  updateRating,
  deleteRating,
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCourses,
  getCourseWithProgress
} from '../controllers/courseController';

import { 
  getProgress,
  generateCertificate,
  uploadCertificateTemplate
} from '../controllers/progressController';

import { protect, authorize } from '../middleware/auth';

// Include other resource routers
import lessonRouter from './lessons';

const router = express.Router();

// Re-route into other resource routers
router.use('/:courseId/lessons', lessonRouter);

// Public routes
router.get('/', getCourses);
router.get('/instructor/:instructorId', getCoursesByInstructor);
router.get('/:id/ratings', getCourseRatings);
router.get('/:id/ratings/:ratingId', getSingleRating);

// Protected routes
router.use(protect);

// Student routes
router.get('/my/enrolled', getEnrolledCourses);
router.get('/:id/with-progress', getCourseWithProgress);
router.get('/:id', getCourse);
router.post('/:id/ratings', authorize('student'), addRating);
router.put('/:id/ratings/:ratingId', authorize('student'), updateRating);
router.delete('/:id/ratings/:ratingId', authorize('student'), deleteRating);
router.post('/:id/enroll', authorize('student'), enrollInCourse);
router.delete('/:id/enroll', authorize('student', 'educator', 'admin'), unenrollFromCourse);

// Progress and certificate routes
router.get('/:courseId/progress', getProgress);
router.post('/:courseId/certificate', authorize('student'), generateCertificate);
router.post('/:courseId/certificate-template', authorize('educator', 'admin'), uploadCertificateTemplate);

// Educator/Admin routes
router.post('/', authorize('educator', 'admin'), createCourse);
router.put('/:id', authorize('educator', 'admin'), updateCourse);
router.delete('/:id', authorize('educator', 'admin'), deleteCourse);
router.put('/:id/thumbnail', authorize('educator', 'admin'), uploadThumbnail);

export default router; 