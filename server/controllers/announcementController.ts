import { Request, Response, NextFunction } from 'express';
import { Announcement, Course, Notification } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import mongoose from 'mongoose';
import { IUser } from '../models/User';

// Define custom request interface with user property
interface UserRequest extends Request {
  user?: IUser;
  files?: any;
}

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Public
export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const announcements = await Announcement.find({ published: true })
    .sort('-createdAt')
    .populate('educator', 'name')
    .populate('courseId', 'title');

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements
  });
});

// @desc    Get single announcement
// @route   GET /api/v1/announcements/:id
// @access  Public
export const getAnnouncement = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('educator', 'name')
    .populate('courseId', 'title');

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // If announcement is not published and requester is not the creator or admin,
  // don't allow access
  if (!announcement.published) {
    const user = (req as UserRequest).user;
    const isAuthorized = user && (
      user.role === 'admin' || 
      announcement.educator.toString() === user.id
    );

    if (!isAuthorized) {
      return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
    }
  }

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Create new announcement
// @route   POST /api/v1/announcements
// @access  Private (Educator/Admin)
export const createAnnouncement = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this resource', 401));
  }
  // Add educator to req.body
  req.body.educator = req.user.id;

  const announcement = await Announcement.create(req.body);

  // If the announcement is for a course and is published, create notifications
  if (announcement.courseId && announcement.published) {
    const course = await Course.findById(announcement.courseId);
    if (course && course.enrolledStudents) {
      const notifications = course.enrolledStudents.map(studentId => ({
        user: studentId,
        message: `New announcement in ${course.title}: "${announcement.title}"`,
        link: `/courses/${course._id}/announcements`,
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  }

  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Update announcement
// @route   PUT /api/v1/announcements/:id
// @access  Private (Educator/Admin)
export const updateAnnouncement = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is the announcement creator or admin
  if (req.user && announcement.educator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this announcement`, 401));
  }

  const wasPublished = announcement.published;

  // Update the announcement
  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // If the announcement was just published, create notifications
  if (announcement && !wasPublished && announcement.published && announcement.courseId) {
    const course = await Course.findById(announcement.courseId);
    if (course && course.enrolledStudents) {
      const notifications = course.enrolledStudents.map(studentId => ({
        user: studentId,
        message: `New announcement in ${course.title}: "${announcement.title}"`,
        link: `/courses/${course._id}/announcements`,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  }

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private (Educator/Admin)
export const deleteAnnouncement = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is the announcement creator or admin
  if (req.user && announcement.educator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this announcement`, 401));
  }

  // Use deleteOne instead of remove() which is deprecated
  await Announcement.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get announcements for a course
// @route   GET /api/v1/courses/:courseId/announcements
// @access  Public
export const getCourseAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  
  const announcements = await Announcement.find({ 
    courseId,
    published: true 
  })
    .sort('-createdAt')
    .populate('educator', 'name');

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements
  });
});

// @desc    Toggle announcement publish status
// @route   POST /api/v1/announcements/:id/toggle-publish
// @access  Private (Educator/Admin)
export const togglePublishStatus = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is the announcement creator or admin
  if (req.user && announcement.educator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this announcement`, 401));
  }

  // Toggle the published status
  announcement.published = !announcement.published;
  await announcement.save();

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Get announcements by educator
// @route   GET /api/v1/educator/announcements
// @access  Private (Educator)
export const getEducatorAnnouncements = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this resource', 401));
  }
  const announcements = await Announcement.find({ educator: req.user.id })
    .sort('-createdAt')
    .populate('courseId', 'title');

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements
  });
}); 