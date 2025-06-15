import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';
import { Lesson, Course, Progress, Section } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import cloudinary from '../utils/cloudinary';
import mongoose from 'mongoose';
import { ICourse } from '../models/Course';
import { ILesson } from '../models/Lesson';
import { IUser } from '../models/User';

// Define custom request interface with user property
interface UserRequest extends Request {
  user?: IUser;
  files?: any;
}

// @desc    Get all lessons for a course
// @route   GET /api/v1/courses/:courseId/lessons
// @access  Private
export const getLessons = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
export const getLesson = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.id).populate('section');

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if lesson is a preview or if user is enrolled in the course
  const course = await Course.findById(lesson.course);
  
  if (!course) {
    return next(new ErrorResponse(`Course not found for this lesson`, 404));
  }

  const enrolledStudents = course.enrolledStudents || [];
  const isEnrolled = enrolledStudents.some(student => student.toString() === req.user?.id);
  const isInstructor = course.instructor.toString() === req.user?.id;
  
  if (!lesson.isPreview && 
      !isEnrolled &&
      !isInstructor &&
      req.user?.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this lesson', 401));
  }

  // If the user is enrolled, mark the lesson as accessed
  if (isEnrolled && req.user) {
    // Update lastAccessed in progress
    await Progress.findOneAndUpdate(
      { user: req.user.id, course: lesson.course },
      { lastAccessed: new Date() },
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
export const createLesson = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  req.body.course = req.params.courseId;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Make sure user is course instructor or admin
  if (req.user && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a lesson to this course`, 401));
  }

  // Handle YouTube videos
  if (req.body.contentType === 'youtube' && req.body.content && req.body.content.youtubeUrl) {
    // Extract video ID from YouTube URL
    const youtubeUrl = req.body.content.youtubeUrl;
    let videoId = '';
    
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = new URL(youtubeUrl).searchParams.get('v') || '';
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
export const updateLesson = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found for this lesson`, 404));
  }

  // Make sure user is course instructor or admin
  if (req.user && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this lesson`, 401));
  }

  // Handle YouTube URL updates
  if (req.body.contentType === 'youtube' && req.body.content && req.body.content.youtubeUrl) {
    // Extract video ID from YouTube URL
    const youtubeUrl = req.body.content.youtubeUrl;
    let videoId = '';
    
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = new URL(youtubeUrl).searchParams.get('v') || '';
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
export const deleteLesson = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found for this lesson`, 404));
  }

  // Make sure user is course instructor or admin
  if (req.user && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
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
export const uploadVideo = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found for this lesson`, 404));
  }

  // Make sure user is course instructor or admin
  if (req.user && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this lesson`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.video as UploadedFile;

  // Make sure the file is a video
  if (!file.mimetype.startsWith('video')) {
    return next(new ErrorResponse('Please upload a video file', 400));
  }

  // Check filesize
  const maxFileUpload = process.env.MAX_FILE_UPLOAD ? parseInt(process.env.MAX_FILE_UPLOAD) : 1000000;
  if (file.size > maxFileUpload) {
    return next(new ErrorResponse(`Please upload a video less than ${maxFileUpload}`, 400));
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