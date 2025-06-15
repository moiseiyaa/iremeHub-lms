import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import User, { IUser } from '../models/User';
import Progress, { IProgress } from '../models/Progress';
import Course, { ICourse } from '../models/Course';
import mongoose, { Document } from 'mongoose';

interface UserRequest extends Request {
  user?: IUser; // Assuming IUser is your user interface from the User model
}

// Define a more specific type for populated progress/enrollment documents
interface PopulatedProgress extends IProgress { // IProgress already extends Document and has all schema fields
  user: IUser; // Populated user
  course: ICourse; // Populated course
  // No need to redeclare createdAt, updatedAt, or status if they are correctly in IProgress
}

interface StudentDetails {
  _id: string;
  name: string;
  email: string;
  profileImage?: { url: string };
  createdAt: string;
}

interface EnrolledCourse {
  _id: string; // This will be the Progress record ID
  title: string;
  category?: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  completedAt?: string;
  courseId: string; // The actual ID of the Course
}

interface StudentPageData {
  student: StudentDetails;
  courses: EnrolledCourse[];
}

// @desc    Get a specific student's details and their enrollments in the educator's courses
// @route   GET /api/v1/educator/students/:studentId
// @access  Private (Educator, Admin)
export const getStudentDetailsForEducator = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const studentId = req.params.studentId;
  const educatorId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return next(new ErrorResponse('Invalid student ID format', 400));
  }

  const student = await User.findById(studentId).select('-password');

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${studentId}`, 404));
  }

  // Find courses taught by the current educator
  const educatorCourses = await Course.find({ instructor: educatorId }).select('_id');
  const educatorCourseIds = educatorCourses.map(course => course._id);

  // Find progress records for this student only in the educator's courses
  const progressRecords = await Progress.find({
    user: studentId,
    course: { $in: educatorCourseIds }
  }).populate<{ course: ICourse }>('course') as (IProgress & { course: ICourse })[]; // Adjusted type for progressRecords

  const studentDetails: StudentDetails = {
    _id: student._id.toString(),
    name: student.name,
    email: student.email,
    profileImage: student.avatar ? { url: student.avatar.url } : undefined,
    createdAt: student.createdAt.toISOString(),
  };

  const enrolledCourses: EnrolledCourse[] = progressRecords.map(p => {
    const course = p.course as ICourse; // p.course is now directly ICourse from the cast above
    return {
      _id: p._id.toString(),
      courseId: course._id.toString(),
      title: course.title,
      category: course.category,
      progress: p.progressPercentage !== undefined ? parseFloat(p.progressPercentage.toFixed(2)) : 0,
      completed: p.completed,
      enrolledAt: p.createdAt.toISOString(),
      completedAt: p.completedAt?.toISOString(),
    };
  });

  res.status(200).json({
    success: true,
    data: {
      student: studentDetails,
      courses: enrolledCourses,
    },
  });
});

// @desc    Get all students enrolled in courses taught by the educator
// @route   GET /api/v1/educator/students
// @access  Private (Educator, Admin)
export const getStudentsForEducator = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const educatorId = req.user?._id;

  if (!educatorId) {
    return next(new ErrorResponse('User not found, authorization denied', 401));
  }

  // Find courses taught by the current educator
  const educatorCourses = await Course.find({ instructor: educatorId }).select('_id');
  if (!educatorCourses.length) {
    return res.status(200).json({
      success: true,
      data: [], // No courses, so no students
    });
  }
  const educatorCourseIds = educatorCourses.map(course => course._id);

  // Find unique user IDs from progress records in the educator's courses
  const studentIds = await Progress.distinct('user', {
    course: { $in: educatorCourseIds },
  });

  if (!studentIds.length) {
    return res.status(200).json({
      success: true,
      data: [], // No students enrolled in these courses
    });
  }

  // Fetch student details
  // Ensure IUser includes all necessary fields like 'avatar' and 'createdAt'
  const students = await User.find({ _id: { $in: studentIds } })
    .select('name email avatar createdAt'); // Adjust fields as necessary

  const formattedStudents = students.map(student => ({
    _id: student._id.toString(),
    name: student.name,
    email: student.email,
    profileImage: student.avatar ? { url: student.avatar.url } : undefined,
    memberSince: student.createdAt.toISOString(), // Or any other relevant date
    // Add any other summary fields you need for the student list
  }));

  res.status(200).json({
    success: true,
    count: formattedStudents.length,
    data: formattedStudents,
  });
});

// @desc    Get all enrollments for courses taught by the educator
// @route   GET /api/v1/educator/enrollments
// @access  Private (Educator, Admin)
export const getEnrollmentsForEducator = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const educatorId = req.user?._id;

  if (!educatorId) {
    return next(new ErrorResponse('User not found, authorization denied', 401));
  }

  const educatorCourses = await Course.find({ instructor: educatorId }).select('_id');
  if (!educatorCourses.length) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }
  const educatorCourseIds = educatorCourses.map(course => course._id);

  const enrollments = await Progress.find({ course: { $in: educatorCourseIds } })
    .populate('user', 'name email avatar') // Populate user with specific fields
    .populate('course', 'title') // Populate course with specific fields
    .sort({ createdAt: -1 }) as PopulatedProgress[]; // Assert to the more specific type

  const formattedEnrollments = enrollments.map((enrollment: PopulatedProgress) => {
    return {
      _id: enrollment._id.toString(),
      user: {
        _id: enrollment.user._id.toString(),
        name: enrollment.user.name,
        email: enrollment.user.email,
        profileImage: enrollment.user.avatar ? { url: enrollment.user.avatar.url } : undefined,
      },
      course: {
        _id: enrollment.course._id.toString(),
        title: enrollment.course.title,
      },
      status: enrollment.status, // Direct access, type should be from PopulatedProgress/IProgress
      progress: enrollment.progressPercentage !== undefined ? parseFloat(enrollment.progressPercentage.toFixed(2)) : 0,
      lastActive: enrollment.updatedAt.toISOString(),
      enrolledAt: enrollment.createdAt.toISOString(),
    };
  });

  res.status(200).json({
    success: true,
    count: formattedEnrollments.length,
    data: formattedEnrollments,
  });
});

// @desc    Update enrollment status (approve/reject by educator)
// @route   PUT /api/v1/educator/enrollments/:enrollmentId/status
// @access  Private (Educator, Admin)
export const updateEnrollmentStatus = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const { enrollmentId } = req.params;
  const { status: newStatusFromFrontend } = req.body; // e.g., 'approved', 'rejected', 'pending'
  const educatorId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return next(new ErrorResponse('Invalid enrollment ID format', 400));
  }

  if (!['approved', 'rejected', 'pending'].includes(newStatusFromFrontend)) {
    return next(new ErrorResponse(`Invalid status value: ${newStatusFromFrontend}. Expected 'approved', 'rejected', or 'pending'.`, 400));
  }

  const progress = await Progress.findById(enrollmentId).populate('course') as (IProgress & { course: ICourse }) | null; // Assert type

  if (!progress) {
    return next(new ErrorResponse(`Enrollment not found with id of ${enrollmentId}`, 404));
  }

  const courseInstructorId = progress.course.instructor;
  if (courseInstructorId.toString() !== educatorId?.toString() && req.user?.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this enrollment', 403));
  }

  // Map frontend status to backend Progress model status
  let newDbStatus = progress.status;
  if (newStatusFromFrontend === 'approved') {
    newDbStatus = 'active'; // 'approved' from frontend maps to 'active' in DB
  } else if (newStatusFromFrontend === 'rejected') {
    newDbStatus = 'rejected';
  } else if (newStatusFromFrontend === 'pending') {
    newDbStatus = 'pending';
  }
  // Add other mappings if necessary e.g. if frontend can directly set to 'completed'

  progress.status = newDbStatus;
  // Optionally: if changing to 'active' from 'pending', set an 'approvedAt' timestamp
  // if (newDbStatus === 'active' && progress.status === 'pending') { progress.approvedAt = new Date(); }

  await progress.save();

  // Re-populate to return the full updated enrollment data, consistent with getEnrollmentsForEducator
  const updatedEnrollmentData = await Progress.findById(enrollmentId)
    .populate('user', 'name email avatar')
    .populate('course', 'title') as PopulatedProgress | null; // Assert to the more specific type

  if (!updatedEnrollmentData) { // Should not happen
      return next(new ErrorResponse('Failed to retrieve updated enrollment details after saving.', 500));
  }
  
  const formattedEnrollment = {
    _id: updatedEnrollmentData._id.toString(),
    user: {
      _id: updatedEnrollmentData.user._id.toString(),
      name: updatedEnrollmentData.user.name,
      email: updatedEnrollmentData.user.email,
      profileImage: updatedEnrollmentData.user.avatar ? { url: updatedEnrollmentData.user.avatar.url } : undefined,
    },
    course: {
      _id: updatedEnrollmentData.course._id.toString(),
      title: updatedEnrollmentData.course.title,
    },
    status: updatedEnrollmentData.status, // Direct access
    progress: updatedEnrollmentData.progressPercentage !== undefined ? parseFloat(updatedEnrollmentData.progressPercentage.toFixed(2)) : 0,
    lastActive: updatedEnrollmentData.updatedAt.toISOString(),
    enrolledAt: updatedEnrollmentData.createdAt.toISOString(),
  };

  res.status(200).json({
    success: true,
    data: formattedEnrollment,
  });
}); 