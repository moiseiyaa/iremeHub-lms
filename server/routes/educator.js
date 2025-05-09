const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Course, User, Lesson, Progress, Announcement } = require('../models');

// Get educator dashboard stats
router.get('/dashboard-stats', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    const educatorId = req.user._id;

    // Get total courses
    const totalCourses = await Course.countDocuments({ instructor: educatorId });

    // For now, we'll calculate these metrics without the Enrollment model
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
      progress: 100
    });
    const completionRate = totalCourses > 0 ? Math.round((completedCourseCount / totalCourses) * 100) : 0;

    // Get recent courses
    const recentCourses = await Course.find({ instructor: educatorId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id title createdAt');

    res.json({
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
  } catch (error) {
    console.error('Error fetching educator dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get educator's courses
router.get('/courses', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    // Using instructor field to match the field name in the Course model
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching educator courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

// Create a new course
router.post('/courses', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    console.log('Creating new course with data:', req.body);
    
    // Check for file upload
    let thumbnailUrl = null;
    if (req.files && req.files.thumbnail) {
      const file = req.files.thumbnail;
      
      // For now, we'll use a placeholder URL
      // In a production environment, you would upload this to your storage service
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
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create course'
    });
  }
});

// Update a course
router.put('/courses/:id', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
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
    
    // Parse arrays from form data
    let prerequisites = [];
    let outcomes = [];
    
    // Handle prerequisites
    for (const key in req.body) {
      if (key.startsWith('prerequisites[') && key.endsWith(']')) {
        const value = req.body[key];
        if (value && value.trim()) {
          prerequisites.push(value.trim());
        }
      }
    }
    
    // Handle outcomes
    for (const key in req.body) {
      if (key.startsWith('outcomes[') && key.endsWith(']')) {
        const value = req.body[key];
        if (value && value.trim()) {
          outcomes.push(value.trim());
        }
      }
    }
    
    // If no prerequisites or outcomes were extracted from request body, use existing values
    if (prerequisites.length === 0) prerequisites = course.prerequisites || [];
    if (outcomes.length === 0) outcomes = course.outcomes || [];
    
    // Prepare update data
    const courseData = {
      title: req.body.title || course.title,
      shortDescription: req.body.shortDescription || course.shortDescription,
      description: req.body.description || course.description,
      category: category,
      level: req.body.level || course.level,
      price: parseFloat(req.body.price) || course.price || 0,
      prerequisites: prerequisites,
      outcomes: outcomes,
      isPublished: req.body.status === 'published',
      thumbnail: thumbnailUrl ? { url: thumbnailUrl } : course.thumbnail,
      updatedAt: Date.now()
    };
    
    // Update the course
    course = await Course.findByIdAndUpdate(
      req.params.id,
      courseData,
      { new: true }
    );
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update course'
    });
  }
});

// Get educator's students
router.get('/students', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, courseId } = req.query;
    const skip = (page - 1) * limit;

    // Get courses by educator
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(course => course._id);
    
    // Build query for progress to find students
    const query = { course: courseId || { $in: courseIds } };

    // Get student progress data
    const progressData = await Progress.find(query)
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Extract unique students
    const uniqueStudents = [];
    const studentIds = new Set();
    
    progressData.forEach(progress => {
      if (progress.user && !studentIds.has(progress.user._id.toString())) {
        studentIds.add(progress.user._id.toString());
        uniqueStudents.push({
          _id: progress.user._id,
          name: progress.user.name,
          email: progress.user.email,
          profileImage: progress.user.profileImage,
          progress: progress.progress,
          lastActive: progress.updatedAt,
          joinedAt: progress.createdAt
        });
      }
    });

    // Get total count for pagination
    const total = await Progress.distinct('user', query).then(arr => arr.length);

    res.json({
      success: true,
      data: uniqueStudents,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching educator students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
});

// Get all announcements for an educator
router.get('/announcements', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    console.log('Fetching announcements for educator');
    
    // Return dummy data for now
    const dummyAnnouncements = [
      {
        _id: '1',
        title: 'Server Announcement 1',
        content: 'This is a test announcement from the server',
        courseId: null,
        educator: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        published: true
      },
      {
        _id: '2',
        title: 'Server Announcement 2',
        content: 'Another test announcement from the server',
        courseId: null,
        educator: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        published: true
      }
    ];
    
    // Return dummy data
    res.json({
      success: true,
      data: dummyAnnouncements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch announcements'
    });
  }
});

// Create new announcement
router.post('/announcements', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    const { title, content, courseId, published } = req.body;
    
    // Create announcement
    const announcement = await Announcement.create({
      title,
      content,
      educator: req.user._id,
      courseId: courseId || null,
      published
    });
    
    // Add course name if there's a courseId
    const responseAnnouncement = announcement.toObject();
    if (courseId) {
      const course = await Course.findById(courseId).select('title');
      if (course) {
        responseAnnouncement.courseName = course.title;
      }
    }
    
    res.status(201).json({
      success: true,
      data: responseAnnouncement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create announcement'
    });
  }
});

// Update an announcement
router.post('/announcements/:id', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    const { title, content, courseId, published } = req.body;
    
    // Find announcement and check ownership
    let announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }
    
    // Make sure educator owns the announcement
    if (announcement.educator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this announcement'
      });
    }
    
    // Update the announcement
    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        courseId: courseId || null,
        published,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    // Add course name if there's a courseId
    const responseAnnouncement = announcement.toObject();
    if (announcement.courseId) {
      const course = await Course.findById(announcement.courseId).select('title');
      if (course) {
        responseAnnouncement.courseName = course.title;
      }
    }
    
    res.json({
      success: true,
      data: responseAnnouncement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update announcement'
    });
  }
});

// Delete an announcement
router.delete('/announcements/:id', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    // Find announcement and check ownership
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }
    
    // Make sure educator owns the announcement
    if (announcement.educator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this announcement'
      });
    }
    
    // Delete the announcement
    await announcement.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete announcement'
    });
  }
});

// Toggle announcement publish status
router.post('/announcements/:id/toggle-publish', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    // Find announcement and check ownership
    let announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }
    
    // Make sure educator owns the announcement
    if (announcement.educator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this announcement'
      });
    }
    
    // Toggle published status
    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        published: !announcement.published,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    // Add course name if there's a courseId
    const responseAnnouncement = announcement.toObject();
    if (announcement.courseId) {
      const course = await Course.findById(announcement.courseId).select('title');
      if (course) {
        responseAnnouncement.courseName = course.title;
      }
    }
    
    res.json({
      success: true,
      data: responseAnnouncement
    });
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update announcement'
    });
  }
});

module.exports = router; 