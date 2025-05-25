import express from 'express';
import {
  // getCertificateById,  // Commented out due to missing export
  verifyCertificateById,
  getMyCertificates,
  downloadCertificate
} from '../controllers/certificateController';

import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
// router.get('/:certificateId', getCertificateById); // Commented out due to missing export
router.post('/verify', verifyCertificateById);

// Protected routes
router.use(protect);
router.get('/my', getMyCertificates);
router.get('/:id/download', downloadCertificate);

export default router; 