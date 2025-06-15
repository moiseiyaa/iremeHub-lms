import { Request, Response, NextFunction } from 'express';
import { Blog } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import mongoose from 'mongoose';
import cloudinary from '../utils/cloudinary';

// Define custom request interface with user property
interface UserRequest extends Request {
  user?: any;
  files?: any;
}

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  // Add pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Filter by status if not admin/editor
  const filter: any = {};
  if (!req.headers.authorization) {
    filter.status = 'published';
  }

  // Get total count
  const total = await Blog.countDocuments(filter);

  // Get blogs with pagination
  const blogs = await Blog.find(filter)
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit)
    .populate('author', 'name avatar');

  // Pagination result
  const pagination: any = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: blogs.length,
    pagination,
    data: blogs
  });
});

// @desc    Get single blog
// @route   GET /api/v1/blogs/:id
// @access  Public
export const getBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name avatar');

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  // Check if blog is published or user is authorized
  if (blog.status !== 'published') {
    const user = (req as UserRequest).user;
    if (!user || (user.role !== 'admin' && user.id !== blog.author.toString())) {
      return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Get blog by slug
// @route   GET /api/v1/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name avatar');

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with slug of ${req.params.slug}`, 404));
  }

  // Check if blog is published or user is authorized
  if (blog.status !== 'published') {
    const user = (req as UserRequest).user;
    if (!user || (user.role !== 'admin' && user.id !== blog.author.toString())) {
      return next(new ErrorResponse(`Blog not found with slug of ${req.params.slug}`, 404));
    }
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Create new blog
// @route   POST /api/v1/blogs
// @access  Private (Admin)
export const createBlog = asyncHandler(async (req: UserRequest, res: Response) => {
  // Add author to req.body
  req.body.author = req.user.id;

  // Handle image upload if present
  if (req.files && req.files.featuredImage) {
    const file = req.files.featuredImage;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'lms/blogs'
    });

    // Add image details to req.body
    req.body.featuredImage = {
      url: result.secure_url,
      public_id: result.public_id
    };
  }

  const blog = await Blog.create(req.body);

  res.status(201).json({
    success: true,
    data: blog
  });
});

// @desc    Update blog
// @route   PUT /api/v1/blogs/:id
// @access  Private (Admin)
export const updateBlog = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is blog owner or admin
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this blog`, 401));
  }

  // Handle image upload if present
  if (req.files && req.files.featuredImage) {
    const file = req.files.featuredImage;

    // Delete previous image if exists
    if (blog.featuredImage && blog.featuredImage.public_id) {
      await cloudinary.uploader.destroy(blog.featuredImage.public_id);
    }

    // Upload new image
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'lms/blogs'
    });

    // Add image details to req.body
    req.body.featuredImage = {
      url: result.secure_url,
      public_id: result.public_id
    };
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Delete blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private (Admin)
export const deleteBlog = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is blog owner or admin
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this blog`, 401));
  }

  // Delete image from cloudinary if exists
  if (blog.featuredImage && blog.featuredImage.public_id) {
    await cloudinary.uploader.destroy(blog.featuredImage.public_id);
  }

  await Blog.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like blog
// @route   POST /api/v1/blogs/:id/like
// @access  Private
export const likeBlog = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  // Increment likes
  blog.likes += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    data: {
      likes: blog.likes
    }
  });
});

// @desc    Add comment to blog
// @route   POST /api/v1/blogs/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  if (!req.user) {
    return next(new ErrorResponse('Not authorized to comment', 401));
  }

  // Create comment
  const comment = {
    user: req.user.id,
    name: req.user.name,
    comment: req.body.comment,
    date: new Date()
  };

  // Add comment to blog
  blog.comments.push(comment);
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog.comments
  });
});