const express = require('express');
const {
  getCertificateById,
  verifyCertificate,
  getUserCertificates
} = require('../controllers/progressController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:certificateId', getCertificateById);
router.get('/:certificateId/verify', verifyCertificate);

// Protected routes
router.use(protect);
router.get('/', getUserCertificates);

module.exports = router; 