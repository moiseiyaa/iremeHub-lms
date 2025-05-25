import express from 'express';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get all blogs'
  });
});

// Protected routes
router.use(protect);

// Admin only routes
router.post('/', authorize('admin'), (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create blog'
  });
});

export default router;
