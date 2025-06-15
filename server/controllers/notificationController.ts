import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import { IUser } from '../models/User';

// Define custom request interface with user property
interface UserRequest extends Request {
  user?: IUser;
}

// @desc    Get all notifications for a user
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this resource', 401));
  }

  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20); // Get latest 20 notifications

  const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
});

// @desc    Mark a notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this resource', 401));
  }

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the notification
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('User not authorized to update this notification', 401));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/readall
// @access  Private
export const markAllAsRead = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this resource', 401));
  }

  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});
