import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { Course, User, Lesson, Progress, Announcement } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { 
  getStudentDetailsForEducator, 
  getStudentsForEducator,
  getEnrollmentsForEducator,
  updateEnrollmentStatus
} from '../controllers/educatorController';

const router = express.Router();

// Define custom request interface with user property
interface UserRequest extends Request {
  user?: any;
  files?: any;
}

// Get educator dashboard stats
router.get(
  '/dashboard-stats', 
  protect, 
  authorize('educator', 'admin'),
  asyncHandler(async (req: UserRequest, res: Response) => {
    const educatorId = req.user?._id;

    // Get total courses
    const totalCourses = await Course.countDocuments({ instructor: educatorId });

    // Get total students - we can count the unique users with progress on educator's courses
    const uniqueStudentCount = await Progress.distinct('user', { 
      course: { $in: await Course.find({ instructor: educatorId }).select('_id') } 
    }).then(users => users.length);

    // Get total lessons across all courses
    const courses = await Course.find({ instructor: educatorId });
    const courseIds = courses.map(course => course._id);
    const totalLessons = await Lesson.countDocuments({ course: { $in: courseIds } });

    // Get active enrollments (enrollments in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeEnrollments = await Progress.countDocuments({
      course: { $in: courseIds },
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calculate completion rate
    const completedCourseCount = await Progress.countDocuments({
      course: { $in: courseIds },
      completed: true
    });
    const completionRate = totalCourses > 0 ? Math.round((completedCourseCount / totalCourses) * 100) : 0;

    // Get recent courses
    const recentCourses = await Course.find({ instructor: educatorId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id title createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalStudents: uniqueStudentCount,
        totalLessons,
        activeEnrollments,
        completionRate,
        recentCoursesCreated: recentCourses
      }
    });
  })
);

// Get educator's courses
router.get(
  '/courses', 
  protect, 
  authorize('educator', 'admin'),
  asyncHandler(async (req: UserRequest, res: Response) => {
    // Using instructor field to match the field name in the Course model
    const courses = await Course.find({ instructor: req.user?._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: courses
    });
  })
);

// Create a new course
router.post(
  '/courses', 
  protect, 
  authorize('educator', 'admin'),
  asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
    console.log('Creating new course with data:', req.body);
    
    // Check for file upload
    let thumbnailUrl = null;
    if (req.files && req.files.thumbnail) {
      const file = req.files.thumbnail;
      
      // For now, we'll use a placeholder URL
      thumbnailUrl = `https://placehold.co/600x400?text=${encodeURIComponent(req.body.title || 'New Course')}`;
    }
    
    // Map front-end category to match the valid enum values in Course model if needed
    let category = req.body.category;
    // Check if category is "Programming" and map it to a valid value
    if (category === 'Programming') {
      category = 'Web Development'; // Map to a valid category
    }
    
    // Validate category is in the allowed values
    const validCategories = [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'AI',
      'Business',
      'Marketing',
      'IT & Software',
      'Personal Development',
      'Design',
      'Photography',
      'Music',
      'Other'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Category '${category}' is not valid. Valid options are: ${validCategories.join(', ')}`
      });
    }
    
    // Create the course
    const courseData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      category: category,
      level: req.body.level,
      price: parseFloat(req.body.price) || 0,
      prerequisites: req.body.prerequisites || [],
      outcomes: req.body.outcomes || [],
      isPublished: req.body.status === 'published',
      instructor: req.user._id, // Set instructor to the current user's ID
      thumbnail: thumbnailUrl ? { url: thumbnailUrl } : undefined
    };
    
    const course = await Course.create(courseData);
    
    // Update the educator's createdCourses array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdCourses: course._id } }
    );
    
    res.status(201).json({
      success: true,
      data: course
    });
  })
);

// Update a course
router.put('/courses/:id', protect, authorize('educator', 'admin'), asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    // Find the course
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    // Make sure educator owns the course
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this course'
      });
    }
    
    // Check for file upload
    let thumbnailUrl = course.thumbnail?.url || null;
    if (req.files && req.files.thumbnail) {
      const file = req.files.thumbnail;
      
      // For now, we'll use a placeholder URL
      // In a production environment, you would upload this to your storage service
      thumbnailUrl = `https://placehold.co/600x400?text=${encodeURIComponent(req.body.title || course.title)}`;
    } else if (req.body.thumbnailUrl) {
      thumbnailUrl = req.body.thumbnailUrl;
    }
    
    // Map front-end category to match the valid enum values in Course model if needed
    let category = req.body.category || course.category;
    // Check if category is "Programming" and map it to a valid value
    if (category === 'Programming') {
      category = 'Web Development'; // Map to a valid category
    }
    
    // Validate category is in the allowed values
    const validCategories = [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'AI',
      'Business',
      'Marketing',
      'IT & Software',
      'Personal Development',
      'Design',
      'Photography',
      'Music',
      'Other'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Category '${category}' is not valid. Valid options are: ${validCategories.join(', ')}`
      });
    }
    
    // Update the course with new values
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        category,
        price: parseFloat(req.body.price) || course.price,
        isPublished: req.body.status === 'published',
        thumbnail: thumbnailUrl ? { url: thumbnailUrl } : course.thumbnail,
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedCourse
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    next(error);
  }
}));

// Get a specific student's details for an educator
router.get(
  '/students/:studentId',
  protect,
  authorize('educator', 'admin'),
  getStudentDetailsForEducator
);

// Get all enrollments for an educator
router.get(
  '/enrollments',
  protect,
  authorize('educator', 'admin'),
  getEnrollmentsForEducator
);

// Update enrollment status
router.put(
  '/enrollments/:enrollmentId/status',
  protect,
  authorize('educator', 'admin'),
  updateEnrollmentStatus
);

// Get all students for an educator
router.get(
  '/students',
  protect,
  authorize('educator', 'admin'),
  getStudentsForEducator
);

// ... more routes

export default router; 