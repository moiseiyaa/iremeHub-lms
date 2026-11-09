import express from 'express';
import {
  getCertificateById,
  verifyCertificateById,
  getMyCertificates,
  downloadCertificate
} from '../controllers/certificateController';

import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/verify', verifyCertificateById);

// Protected routes
router.use(protect);
router.get('/my', getMyCertificates);
router.get('/:id', getCertificateById);
router.get('/:id/download', downloadCertificate);

export default router; 