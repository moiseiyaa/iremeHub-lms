import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';

import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications);
router.route('/readall').put(markAllAsRead);
router.route('/:id/read').put(markAsRead);

export default router; 