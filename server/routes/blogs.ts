import express from 'express';
import {
  getBlogs, // Assuming you might have this for GET all
  getBlog,  // Assuming for GET single by ID
  getBlogBySlug, // Assuming for GET single by slug
  createBlog, 
  updateBlog, 
  deleteBlog,
  likeBlog,
  addComment // Assuming these are all from your blogController
} from '../controllers/blogController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.route('/').get(getBlogs); // Changed to use controller
router.route('/:id').get(getBlog);
router.route('/slug/:slug').get(getBlogBySlug);

// Protected routes (for actions like liking, commenting)
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comments', protect, addComment);

// Admin/Educator/Author routes (for creating, updating, deleting)
// For creating, ensure only specific roles can access
router.route('/').post(protect, authorize('admin', 'educator'), createBlog); // Changed to use createBlog and allow 'educator' too

router.route('/:id')
  .put(protect, authorize('admin', 'educator'), updateBlog) // Assuming educators can also update their blogs
  .delete(protect, authorize('admin', 'educator'), deleteBlog); // Assuming educators can also delete their blogs

export default router;
