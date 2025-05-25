import express from 'express';
import {
  getProgress,
  generateCertificate,
  getUserCertificates,
  uploadCertificateTemplate
} from '../controllers/progressController';

import { protect, authorize } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protect);

// Student routes
router.get('/certificates', getUserCertificates);
router.post('/:courseId/certificate', authorize('student'), generateCertificate);

// Course progress routes (for students, educators, admins)
router.get('/:courseId/progress', getProgress);

// Educator/Admin routes
router.post('/:courseId/certificate-template', authorize('educator', 'admin'), uploadCertificateTemplate);

export default router; 