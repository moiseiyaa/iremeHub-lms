const { Lesson, Course, Progress, Section } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../utils/cloudinary');

// @desc    Get all lessons for a course
// @route   GET /api/v1/courses/:courseId/lessons
// @access  Private
exports.getLessons = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  const lessons = await Lesson.find({ course: req.params.courseId })
    .sort('order')
    .populate('section');

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons
  });
});

// @desc    Get single lesson
// @route   GET /api/v1/lessons/:id
// @access  Private
exports.getLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id).populate('section');

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if lesson is a preview or if user is enrolled in the course
  const course = await Course.findById(lesson.course);
  
  if (!lesson.isPreview && 
      !course.enrolledStudents.includes(req.user.id) &&
      course.instructor.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this lesson', 401));
  }

  // If the user is enrolled, mark the lesson as accessed
  if (course.enrolledStudents.includes(req.user.id)) {
    // Update lastAccessed in progress
    await Progress.findOneAndUpdate(
      { user: req.user.id, course: lesson.course },
      { lastAccessed: Date.now() },
      { upsert: true }
    );
  }

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Create lesson
// @route   POST /api/v1/courses/:courseId/lessons
// @access  Private (Educator/Admin)
exports.createLesson = asyncHandler(async (req, res, next) => {
  req.body.course = req.params.courseId;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a lesson to this course`, 401));
  }

  // Handle YouTube videos
  if (req.body.contentType === 'youtube' && req.body.content && req.body.content.youtubeUrl) {
    // Extract video ID from YouTube URL
    const youtubeUrl = req.body.content.youtubeUrl;
    let videoId = '';
    
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = new URL(youtubeUrl).searchParams.get('v');
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
      if (!req.body.content) req.body.content = {};
      req.body.content.youtubeVideoId = videoId;
    }
  }

  // Get the count of existing lessons to set the order
  const lessonCount = await Lesson.countDocuments({ course: req.params.courseId });
  req.body.order = req.body.order || lessonCount + 1;

  const lesson = await Lesson.create(req.body);

  res.status(201).json({
    success: true,
    data: lesson
  });
});

// @desc    Update lesson
// @route   PUT /api/v1/lessons/:id
// @access  Private (Educator/Admin)
exports.updateLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(lesson.course);

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this lesson`, 401));
  }

  // Handle YouTube URL updates
  if (req.body.contentType === 'youtube' && req.body.content && req.body.content.youtubeUrl) {
    // Extract video ID from YouTube URL
    const youtubeUrl = req.body.content.youtubeUrl;
    let videoId = '';
    
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = new URL(youtubeUrl).searchParams.get('v');
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
      if (!req.body.content) req.body.content = {};
      req.body.content.youtubeVideoId = videoId;
    }
  }

  lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Delete lesson
// @route   DELETE /api/v1/lessons/:id
// @access  Private (Educator/Admin)
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(lesson.course);

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this lesson`, 401));
  }

  // If the lesson has uploaded video content, delete from cloudinary
  if (lesson.contentType === 'video' && lesson.content && lesson.content.videoPublicId) {
    await cloudinary.uploader.destroy(lesson.content.videoPublicId);
  }

  await Lesson.deleteOne({ _id: lesson._id });

  // Reorder the remaining lessons
  const lessons = await Lesson.find({ course: lesson.course })
    .sort('order');
  
  for (let i = 0; i < lessons.length; i++) {
    await Lesson.findByIdAndUpdate(lessons[i]._id, { order: i + 1 });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload video for lesson
// @route   PUT /api/v1/lessons/:id/video
// @access  Private (Educator/Admin)
exports.uploadVideo = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(lesson.course);

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this lesson`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.video;

  // Make sure the file is a video
  if (!file.mimetype.startsWith('video')) {
    return next(new ErrorResponse('Please upload a video file', 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload a video less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  // Delete previous video if exists
  if (lesson.content && lesson.content.videoPublicId) {
    await cloudinary.uploader.destroy(lesson.content.videoPublicId, { resource_type: 'video' });
  }

  // Upload video to cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: 'video',
    folder: 'lms/videos'
  });

  // Update lesson
  lesson.contentType = 'video';
  
  if (!lesson.content) {
    lesson.content = {};
  }
  
  lesson.content.videoUrl = result.secure_url;
  lesson.content.videoPublicId = result.public_id;
  lesson.content.videoDuration = result.duration;

  await lesson.save();

  res.status(200).json({
    success: true,
    data: lesson
  });
}); 