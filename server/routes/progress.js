const express = require('express');
const {
  getProgress,
  generateCertificate,
  getUserCertificates,
  uploadCertificateTemplate
} = require('../controllers/progressController');

const { protect, authorize } = require('../middleware/auth');

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

module.exports = router; 