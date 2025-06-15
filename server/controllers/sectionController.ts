import { Request, Response, NextFunction } from 'express';
import { Section, Course } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import mongoose from 'mongoose';
import { ICourse } from '../models/Course';
import { ISection } from '../models/Section';
import { IUser } from '../models/User';

// Define custom request interface with user property
interface UserRequest extends Request {
  user?: IUser;
}

// @desc    Get all sections for a course
// @route   GET /api/v1/courses/:courseId/sections
// @access  Private
export const getSections = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  const sections = await Section.find({ course: req.params.courseId }).sort('order');

  res.status(200).json({
    success: true,
    count: sections.length,
    data: sections
  });
});

// @desc    Get single section
// @route   GET /api/v1/sections/:id
// @access  Private
export const getSection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return next(new ErrorResponse(`Section not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: section
  });
});

// @desc    Create section
// @route   POST /api/v1/courses/:courseId/sections
// @access  Private (Educator/Admin)
export const createSection = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  req.body.course = req.params.courseId;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Make sure user is course instructor or admin
  if (req.user && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a section to this course`, 401));
  }

  // Get the count of existing sections to set the order
  const sectionCount = await Section.countDocuments({ course: req.params.courseId });
  req.body.order = req.body.order || sectionCount + 1;

  const section = await Section.create(req.body);

  res.status(201).json({
    success: true,
    data: section
  });
});

// @desc    Update section
// @route   PUT /api/v1/sections/:id
// @access  Private (Educator/Admin)
export const updateSection = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  let section = await Section.findById(req.params.id);

  if (!section) {
    return next(new ErrorResponse(`Section not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(section.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found for this section`, 404));
  }

  // Make sure user is course instructor or admin
  if (req.user && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this section`, 401));
  }

  section = await Section.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: section
  });
});

// @desc    Delete section
// @route   DELETE /api/v1/sections/:id
// @access  Private (Educator/Admin)
export const deleteSection = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return next(new ErrorResponse(`Section not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(section.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found for this section`, 404));
  }

  // Make sure user is course instructor or admin
  if (req.user && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this section`, 401));
  }

  await Section.deleteOne({ _id: section._id });

  // Reorder the remaining sections
  const sections = await Section.find({ course: section.course })
    .sort('order');
  
  for (let i = 0; i < sections.length; i++) {
    await Section.findByIdAndUpdate(sections[i]._id, { order: i + 1 });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});