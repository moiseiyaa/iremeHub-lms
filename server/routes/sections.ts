import express from 'express';
import {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/sectionController';

import { protect, authorize } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', getSections);
router.get('/:id', getSection);

// Educator/Admin routes
router.post('/', authorize('educator', 'admin'), createSection);
router.put('/:id', authorize('educator', 'admin'), updateSection);
router.delete('/:id', authorize('educator', 'admin'), deleteSection);

export default router; 