import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePublishStatus,
  getEducatorAnnouncements
} from '../controllers/announcementController';

import { protect, authorize } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncement);

// Protected routes
router.use(protect);

// Educator/Admin routes
router.post('/', authorize('educator', 'admin'), createAnnouncement);
router.put('/:id', authorize('educator', 'admin'), updateAnnouncement);
router.delete('/:id', authorize('educator', 'admin'), deleteAnnouncement);
router.post('/:id/toggle-publish', authorize('educator', 'admin'), togglePublishStatus);

// Educator-specific routes
router.get('/educator/list', authorize('educator', 'admin'), getEducatorAnnouncements);

export default router; 