import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import User from '../models/User';
import Course from '../models/Course';
import { Blog } from '../models/Blog';
import ErrorResponse from '../utils/errorResponse';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEducators = await User.countDocuments({ role: 'educator' });
    const totalCourses = await Course.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    // Fetch recent users (e.g., last 5 created)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt avatar'); // Select necessary fields

    // Fetch recent blogs (e.g., last 5 created)
    const recentBlogs = await Blog.find()
      .populate('author', 'name') // Assuming author field in Blog model stores user ID
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author status createdAt'); // Select necessary fields
    
    // Active users might be more complex to calculate (e.g., based on last login or activity)
    // For now, we can use totalUsers or a placeholder if true active user count is not critical yet
    const activeUsers = totalUsers; // Placeholder

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalEducators,
        totalCourses,
        totalBlogs,
        activeUsers,
        recentUsers,
        recentBlogs,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return next(new ErrorResponse('Failed to fetch dashboard statistics', 500));
  }
}); 
/**
 * Institution management view in the legacy single-tenant backend.
 * Phase 2 must replace this with tenant-scoped organization queries.
 */
export const getAdminCourses = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Math.min(10000, Number.parseInt(String(req.query.page ?? '1'), 10) || 1));
  const limit = Math.max(1, Math.min(50, Number.parseInt(String(req.query.limit ?? '20'), 10) || 20));
  const search = String(req.query.search ?? '').slice(0, 100).trim();
  const status = String(req.query.status ?? '');
  const filter: Record<string, unknown> = {};
  if (status === 'published') filter.isPublished = true;
  if (status === 'draft') filter.isPublished = false;
  if (search) filter.title = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const [total, courses] = await Promise.all([
    Course.countDocuments(filter),
    Course.find(filter).select('-enrolledStudents -ratings').populate('instructor', 'name email')
      .sort({createdAt: -1}).skip((page - 1) * limit).limit(limit)
  ]);
  res.json({ success: true, data: courses, total, page, pages: Math.ceil(total/limit) });
});
