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
  user?: IUser;
  files?: any;
}

// The backend must authorize access before returning any credential details.
export const getCertificateById = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new ErrorResponse('Authentication required', 401));
  const certificate = await Certificate.findById(req.params.id)
    .populate('user', 'name')
    .populate('course', 'title description category level');
  if (!certificate) return next(new ErrorResponse('Certificate not found', 404));
  const ownerId = (certificate.user as IUser)._id.toString();
  if (ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this certificate', 403));
  }
  res.status(200).json({success:true,data:certificate});
});

// Generate a genuine downloadable PDF. Never present JSON as a PDF attachment.
export const downloadCertificate = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new ErrorResponse('Authentication required', 401));
  const certificate = await Certificate.findById(req.params.id)
    .populate('user', 'name')
    .populate('course', 'title');
  if (!certificate) return next(new ErrorResponse('Certificate not found', 404));
  const ownerId = (certificate.user as IUser)._id.toString();
  if (ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to download this certificate', 403));
  }
  // pdfkit is an existing runtime dependency of the legacy Express server.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({size:'A4',margin:60,info:{Title:'iremehub+ Certificate',Author:'iremehub+'}});
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition',`attachment; filename="iremehub-certificate-${String(certificate.certificateId).replace(/[^a-zA-Z0-9-]/g,'')}.pdf"`);
  res.setHeader('Cache-Control','private, no-store');
  doc.pipe(res);
  doc.rect(0,0,595.28,841.89).fill('#f5f7f2');
  doc.rect(26,26,543,790).strokeColor('#19654e').lineWidth(2).stroke();
  doc.fillColor('#19654e').font('Helvetica-Bold').fontSize(25).text('iremehub+',60,110,{align:'center'});
  doc.fillColor('#17372d').font('Helvetica-Bold').fontSize(31).text('CERTIFICATE OF COMPLETION',60,210,{align:'center'});
  doc.font('Helvetica').fontSize(15).fillColor('#61736b').text('This certificate is awarded to',60,295,{align:'center'});
  doc.font('Helvetica-Bold').fontSize(26).fillColor('#17372d').text((certificate.user as IUser).name,60,340,{align:'center'});
  doc.font('Helvetica').fontSize(15).fillColor('#61736b').text('for completing the course',60,405,{align:'center'});
  doc.font('Helvetica-Bold').fontSize(21).fillColor('#19654e').text((certificate.course as ICourse).title,60,445,{align:'center'});
  doc.font('Helvetica').fontSize(12).fillColor('#61736b').text(`Issued: ${new Date(certificate.issuedAt).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}`,60,545,{align:'center'});
  doc.fontSize(10).text(`Verification ID: ${certificate.certificateId}`,60,580,{align:'center'});
  doc.moveTo(160,655).lineTo(435,655).strokeColor('#dfe7e0').stroke();
  doc.fontSize(10).text('Verify credentials through the iremehub+ platform.',60,675,{align:'center'});
  doc.end();
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
export const getMyCertificates = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this resource', 401));
  }
  const certificates = await Certificate.find({ user: req.user.id })
    .populate('course', 'title description category level');

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
}); 