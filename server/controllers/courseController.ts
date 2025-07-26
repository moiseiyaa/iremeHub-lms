import { Request, Response, NextFunction } from 'express';
import { Course, Section, Lesson, Progress, Payment, User as UserModel } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import cloudinary from '../utils/cloudinary';
import mongoose from 'mongoose';
import { ICourse, IRating } from '../models/Course';
import { ILesson } from '../models/Lesson';
import { IProgress } from '../models/Progress';
import { IUser } from '../models/User';

// Define custom request interface with user property
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  tempFilePath?: string; // for express-fileupload
}

interface UserRequest extends Request {
  user: IUser;
  files?: any;
}

interface CourseWithProgress extends ICourse {
  progress?: {
    completedLessons: mongoose.Types.ObjectId[] | ILesson[];
    lastAccessed: Date | null;
    completed: boolean;
    totalLessons: number;
    progressPercentage: string | number;
    nextLesson?: ILesson | null;
  };
}

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
export const getCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const courses = await Course.find()
    .populate('instructor', 'name email avatar')
    .populate('ratings.user', 'name avatar');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar bio')
      .populate('sections')
      .populate('ratings.user', 'name avatar')
      .populate('enrolledStudents', 'name email avatar');

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Get all lessons for the course
    const lessons = await Lesson.find({
      course: course._id
    })
    .select('title description contentType order completionTime section');

    // Group lessons by section
    const lessonsBySection = lessons.reduce((acc, lesson) => {
      if (lesson.section) {
        const sectionId = lesson.section.toString();
        if (!acc[sectionId]) {
          acc[sectionId] = [];
        }
        acc[sectionId].push(lesson);
      }
      return acc;
    }, {} as { [key: string]: any[] });

    // Attach lessons to each populated section
    if (course.sections && course.sections.length > 0) {
      const populatedSections = (course.sections as any[]).map((sectionDoc: any) => {
        const sectionId = sectionDoc._id.toString();
        return {
          ...sectionDoc.toObject(),
          lessons: lessonsBySection[sectionId] || []
        };
      });

      const courseWithSections = {
        ...course.toObject(),
        sections: populatedSections
      };

      return res.status(200).json({
        success: true,
        data: courseWithSections
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error in getCourse:', error);
    return next(new ErrorResponse('Error fetching course details', 500));
  }
});

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private (Educator/Admin)
export const createCourse = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  // Add instructor to req.body
  req.body.instructor = req.user.id;
  
  // Extract lessons data if provided
  const lessonsData = req.body.lessons || [];
  delete req.body.lessons;

  const course = await Course.create(req.body);

  // Add course to instructor's createdCourses
  await UserModel.findByIdAndUpdate(req.user.id, {
    $push: { createdCourses: course._id }
  });

  // Create lessons if provided
  if (lessonsData.length > 0) {
    for (let i = 0; i < lessonsData.length; i++) {
      const lessonData = lessonsData[i];
      lessonData.course = course._id;
      lessonData.order = i + 1;
      
      // Handle YouTube videos
      if (lessonData.contentType === 'youtube' && lessonData.content && lessonData.content.youtubeUrl) {
        // Extract video ID from YouTube URL
        const youtubeUrl = lessonData.content.youtubeUrl;
        let videoId = '';
        
        if (youtubeUrl.includes('youtube.com/watch?v=')) {
          videoId = new URL(youtubeUrl).searchParams.get('v') || '';
        } else if (youtubeUrl.includes('youtu.be/')) {
          videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
          if (!lessonData.content) lessonData.content = {};
          lessonData.content.youtubeVideoId = videoId;
        }
      }
      
      await Lesson.create(lessonData);
    }
    
    // Refresh course to include the lessons
    course.populate('lessons');
  }

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private (Educator/Admin)
export const updateCourse = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private (Educator/Admin)
export const deleteCourse = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
  }

  // Delete course thumbnail from cloudinary if exists
  if (course.thumbnail.public_id) {
    await cloudinary.uploader.destroy(course.thumbnail.public_id);
  }

  // Use deleteOne instead of remove
  await Course.deleteOne({ _id: course._id });

  // Remove course from instructor's createdCourses
  await UserModel.findByIdAndUpdate(req.user.id, {
    $pull: { createdCourses: course._id }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload course thumbnail
// @route   PUT /api/v1/courses/:id/thumbnail
// @access  Private (Educator/Admin)
export const uploadThumbnail = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.thumbnail as MulterFile;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  const maxFileUpload = process.env.MAX_FILE_UPLOAD ? parseInt(process.env.MAX_FILE_UPLOAD) : 1000000;
  if (file.size > maxFileUpload) {
    return next(new ErrorResponse(`Please upload an image less than ${maxFileUpload}`, 400));
  }

  // Delete previous thumbnail if exists
  if (course.thumbnail.public_id) {
    await cloudinary.uploader.destroy(course.thumbnail.public_id);
  }

  // Upload new thumbnail
  const result = await cloudinary.uploader.upload((file as any).tempFilePath!, {
    folder: 'lms/thumbnails',
    width: 1280,
    crop: 'scale'
  });

  course.thumbnail = {
    public_id: result.public_id,
    url: result.secure_url
  };

  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Get courses by instructor
// @route   GET /api/v1/courses/instructor/:instructorId
// @access  Public
export const getCoursesByInstructor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const courses = await Course.find({ instructor: req.params.instructorId })
    .populate('instructor', 'name email avatar')
    .populate('ratings.user', 'name avatar');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Add rating to course
// @route   POST /api/v1/courses/:id/ratings
// @access  Private (Enrolled Students)
export const addRating = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if user is enrolled in the course
  if (!course.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('You must be enrolled in the course to add a rating', 401));
  }

  // Check if user has already rated
  const existingRating = course.ratings.find(
    rating => rating.user.toString() === req.user.id
  );

  if (existingRating) {
    return next(new ErrorResponse('You have already rated this course', 400));
  }

  const rating = {
    rating: req.body.rating,
    review: req.body.review,
    user: req.user.id,
    createdAt: new Date()
  };

  course.ratings.push(rating as IRating);
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Update rating for a course
// @route   PUT /api/v1/courses/:id/ratings/:ratingId
// @access  Private (Owner of rating)
export const updateRating = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Find the rating in the course's ratings array
  const ratingIndex = course.ratings.findIndex(
    rating => rating._id && rating._id.toString() === req.params.ratingId
  );

  if (ratingIndex === -1) {
    return next(new ErrorResponse(`Rating not found with id of ${req.params.ratingId}`, 404));
  }

  // Check if the user is the owner of the rating
  if (course.ratings[ratingIndex].user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this rating', 401));
  }

  // Update the rating
  if (req.body.rating) {
    course.ratings[ratingIndex].rating = req.body.rating;
  }
  
  if (req.body.review) {
    course.ratings[ratingIndex].review = req.body.review;
  }

  await course.save();

  res.status(200).json({
    success: true,
    data: course.ratings[ratingIndex]
  });
});

// @desc    Delete rating for a course
// @route   DELETE /api/v1/courses/:id/ratings/:ratingId
// @access  Private (Owner of rating or Admin)
export const deleteRating = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Find the rating in the course's ratings array
  const ratingIndex = course.ratings.findIndex(
    rating => rating._id && rating._id.toString() === req.params.ratingId
  );

  if (ratingIndex === -1) {
    return next(new ErrorResponse(`Rating not found with id of ${req.params.ratingId}`, 404));
  }

  // Check if the user is the owner of the rating or an admin
  if (course.ratings[ratingIndex].user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this rating', 401));
  }

  // Remove the rating from the array
  course.ratings.splice(ratingIndex, 1);
  await course.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get single rating for a course
// @route   GET /api/v1/courses/:id/ratings/:ratingId
// @access  Public
export const getSingleRating = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Find the rating in the course's ratings array
  const rating = course.ratings.find(
    rating => rating._id && rating._id.toString() === req.params.ratingId
  );

  if (!rating) {
    return next(new ErrorResponse(`Rating not found with id of ${req.params.ratingId}`, 404));
  }

  // Populate user data
  await course.populate({
    path: 'ratings.user',
    select: 'name avatar',
    match: { _id: rating.user }
  });

  // Get the populated rating
  const populatedRating = course.ratings.find(
    r => r._id && r._id.toString() === req.params.ratingId
  );

  res.status(200).json({
    success: true,
    data: populatedRating
  });
});

// @desc    Get ratings for a course
// @route   GET /api/v1/courses/:id/ratings
// @access  Public
export const getCourseRatings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id)
    .select('ratings')
    .populate('ratings.user', 'name avatar');

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    count: course.ratings.length,
    data: course.ratings
  });
});

// @desc    Enroll in course
// @route   POST /api/v1/courses/:id/enroll
// @access  Private (Students)
export const enrollInCourse = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if user is already enrolled
  if (course.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('You are already enrolled in this course', 400));
  }

  // For free courses, enroll directly
  if (course.price <= 0) {
    // Add user to enrolledStudents
    course.enrolledStudents.push(req.user.id);
    await course.save();

    // Add course to user's enrolledCourses
    await UserModel.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id }
    });

    // Create initial progress record
    await Progress.create({
      user: req.user.id,
      course: course._id,
      completedLessons: [],
      completed: false
    });

    return res.status(200).json({
      success: true,
      data: course
    });
  }
  
  // For paid courses, check if payment exists
  const payment = await Payment.findOne({
    user: req.user.id,
    course: course._id,
    status: 'successful'
  });

  if (!payment) {
    return next(new ErrorResponse('You need to purchase this course before enrolling', 402));
  }

  // Add user to enrolledStudents
  course.enrolledStudents.push(req.user.id);
  await course.save();

  // Add course to user's enrolledCourses
  await UserModel.findByIdAndUpdate(req.user.id, {
    $push: { enrolledCourses: course._id }
  });

  // Create initial progress record
  await Progress.create({
    user: req.user.id,
    course: course._id,
    completedLessons: [],
    completed: false
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Unenroll from course
// @route   DELETE /api/v1/courses/:id/enroll
// @access  Private (Students)
export const unenrollFromCourse = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if user is enrolled
  if (!course.enrolledStudents.some(student => student.toString() === req.user.id)) {
    return next(new ErrorResponse('You are not enrolled in this course', 400));
  }

  // Remove user from enrolledStudents
  course.enrolledStudents = course.enrolledStudents.filter(
    student => student.toString() !== req.user.id
  ) as mongoose.Types.ObjectId[];
  await course.save();

  // Remove course from user's enrolledCourses
  await UserModel.findByIdAndUpdate(req.user.id, {
    $pull: { enrolledCourses: course._id }
  });

  res.status(200).json({
    success: true,
    data: course
  });
});



// @desc    Get enrolled courses for current user with progress
// @route   GET /api/v1/courses/my/enrolled
// @access  Private
export const getEnrolledCourses = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    // Just get the user (no population yet - to identify the issue)
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Handle case where user has no enrolled courses array
    if (!user.enrolledCourses || !Array.isArray(user.enrolledCourses)) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Handle case where user has empty enrolled courses
    if (user.enrolledCourses.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Get the actual courses
    const courses = await Course.find({ 
      _id: { $in: user.enrolledCourses } 
    })
    .select('title description thumbnail level category createdAt')
    .populate({
      path: 'instructor',
      select: 'name avatar'
    })
    .populate('sections')
    .populate('lessons');
    
    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Get or create progress records for each course
    const courseIds = courses.map(course => course._id);
    
    // Get existing progress records
    const existingProgress = await Progress.find({
      user: req.user.id,
      course: { $in: courseIds }
    });
    
    // Prepare final results array
    const coursesWithProgress: CourseWithProgress[] = [];
    
    // Process each course one by one (safer approach)
    for (const course of courses) {
      try {
        // Find existing progress or create placeholder
        let progress = existingProgress.find(p => 
          p.course.toString() === course._id.toString()
        );
        
        // If no progress found, create one
        if (!progress) {
          try {
            progress = await Progress.create({
              user: req.user.id,
              course: course._id,
              completedLessons: [],
              completed: false
            });
          } catch (createError) {
            console.error(`Failed to create progress for course ${course._id}:`, createError);
            // Create a local placeholder instead of failing
            progress = {
              completedLessons: [],
              lastAccessed: null,
              completed: false
            } as any;
          }
        }
        
        // Ensure completedLessons is always an array
        const completedLessons = progress && progress.completedLessons ? 
          (Array.isArray(progress.completedLessons) ? progress.completedLessons : []) : 
          [];
        
        // Get lessons count
        let totalLessons = 0;
        try {
          totalLessons = await Lesson.countDocuments({ course: course._id });
        } catch (countError) {
          console.error(`Error counting lessons for course ${course._id}:`, countError);
        }
        
        // Calculate progress percentage safely
        const progressPercentage = totalLessons > 0 ? 
          Number(((completedLessons.length / totalLessons) * 100).toFixed(2)) : 
          0;
        
        // Add to results
        const courseWithProgress = course.toObject() as CourseWithProgress;
        courseWithProgress.progress = {
          completedLessons: completedLessons,
          lastAccessed: progress ? progress.lastAccessed : null,
          completed: progress ? progress.completed : false,
          totalLessons,
          progressPercentage
        };
        
        coursesWithProgress.push(courseWithProgress);
      } catch (courseError) {
        console.error(`Error processing course ${course._id}:`, courseError);
        // Continue with other courses instead of failing completely
      }
    }
    
    return res.status(200).json({
      success: true,
      count: coursesWithProgress.length,
      data: coursesWithProgress
    });
  } catch (error: any) {
    console.error('Error in getEnrolledCourses:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving enrolled courses',
      details: error.message
    });
  }
});

// @desc    Get course details with resume status
// @route   GET /api/v1/courses/:id/with-progress
// @access  Private
export const getCourseWithProgress = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email avatar bio')
    .populate('ratings.user', 'name avatar')
    .populate('enrolledStudents', 'name email avatar');

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if enrolled
  const isEnrolled = course.enrolledStudents.some(student => student.toString() === req.user.id);

  let progress = null;
  let nextLesson = null;

  if (isEnrolled) {
    // Get progress
    progress = await Progress.findOne({
      user: req.user.id,
      course: course._id
    });

    // Get total lessons
    const totalLessons = await Lesson.countDocuments({ course: course._id });
    
    // Get all lessons sorted by order
    const lessons = await Lesson.find({ course: course._id }).sort('order');
    
    // Calculate progress percentage
    const progressPercentage = totalLessons > 0 && progress
      ? Number(((progress.completedLessons.length / totalLessons) * 100).toFixed(2))
      : 0;
    
    // Find next lesson to watch (first incomplete lesson)
    if (progress && progress.completedLessons.length < totalLessons) {
      for (const lesson of lessons) {
        if (!progress.completedLessons.some(id => id.toString() === lesson._id.toString())) {
          nextLesson = lesson;
          break;
        }
      }
    }
    
    // Package progress data
    progress = {
      completedLessons: progress ? progress.completedLessons : [],
      lastAccessed: progress ? progress.lastAccessed : null,
      progressPercentage,
      totalLessons,
      completed: progress ? progress.completed : false,
      nextLesson
    };
  }

  res.status(200).json({
    success: true,
    data: {
      course,
      isEnrolled,
      progress
    }
  });
}); 