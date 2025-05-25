import { Request, Response, NextFunction } from 'express';
import { Certificate, Course, Progress } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { ICertificate } from '../models/Certificate';
import { IUser } from '../models/User';
import { ICourse } from '../models/Course';

// Define custom request interface with user property
interface UserRequest extends Request {
  user?: any;
  files?: any;
}

// @desc    Generate a certificate PDF
// @route   GET /api/v1/certificates/:id/download
// @access  Private
export const downloadCertificate = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('user', 'name email')
    .populate('course', 'title');

  if (!certificate) {
    return next(new ErrorResponse(`Certificate not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authorized to download this certificate
  if (certificate.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this certificate', 401));
  }

  // In a real implementation, we would generate a PDF here
  // For now, we'll just send the certificate data
  res.status(200).json({
    success: true,
    data: certificate
  });
});

// @desc    Verify certificate authenticity
// @route   POST /api/v1/certificates/verify
// @access  Public
export const verifyCertificateById = asyncHandler(async (req: Request, res: Response) => {
  const { certificateId } = req.body;

  if (!certificateId) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a certificate ID'
    });
  }

  const certificate = await Certificate.findOne({ certificateId })
    .populate('user', 'name')
    .populate('course', 'title');

  if (!certificate) {
    return res.status(200).json({
      success: true,
      isValid: false,
      message: 'Certificate does not exist'
    });
  }

  res.status(200).json({
    success: true,
    isValid: true,
    message: 'Certificate is valid',
    data: {
      certificateId: certificate.certificateId,
      issuedAt: certificate.issuedAt,
      recipient: (certificate.user as IUser).name,
      course: (certificate.course as ICourse).title
    }
  });
});

// @desc    List certificates for the current user
// @route   GET /api/v1/certificates/my
// @access  Private
export const getMyCertificates = asyncHandler(async (req: UserRequest, res: Response) => {
  const certificates = await Certificate.find({ user: req.user.id })
    .populate('course', 'title description category level');

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
}); 