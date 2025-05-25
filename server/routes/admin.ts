import express from 'express';
import { getDashboardStats } from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth'; // Adjust path if your middleware is elsewhere

const router = express.Router();

// All routes in this file will be protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/dashboard-stats').get(getDashboardStats);

export default router; 