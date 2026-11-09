import express from 'express';
import { protect, authorize } from '../middleware/auth';
import EnrollmentRequest from '../models/EnrollmentRequest';
import Course from '../models/Course';
import User from '../models/User';
import Progress from '../models/Progress';
import { Notification } from '../models/Notification';
import ErrorResponse from '../utils/errorResponse';

const router = express.Router();

// Student: request enrollment
router.post('/courses/:id/request-enroll', protect, authorize('student'), async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ _id: courseId, isPublished: true }).select('instructor title price isPublished enrolledStudents');
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }
    if (course.price > 0) return next(new ErrorResponse('Paid course access requires verified payment. Enrollment requests are disabled for paid courses.', 409));
    if (course.enrolledStudents.some(id => id.toString() === req.user._id.toString())) return next(new ErrorResponse('Already enrolled in this course', 409));
    // Prevent instructor from requesting own course
    if (req.user && req.user._id.toString() === course.instructor.toString()) {
      return next(new ErrorResponse('Instructors cannot enroll in their own course', 400));
    }

    const existing = await EnrollmentRequest.findOne({ courseId, studentId: req.user._id });
    if (existing?.status === 'approved') return next(new ErrorResponse('Enrollment already approved', 409));
    if (existing?.status === 'pending') return res.json({ success: true, data: existing });

    const doc = await EnrollmentRequest.findOneAndUpdate(
      { courseId, studentId: req.user._id },
      { $set: { status: 'pending' }, $setOnInsert: { courseId, studentId: req.user._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify the instructor that a new request has arrived
    await Notification.create({
      user: course.instructor,
      message: `${req.user.name || 'A student'} requested to enroll in ${course.title}.`,
      link: `/dashboard/educator/requests`
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// Educator: get pending requests for their courses
router.get('/educator/requests', protect, authorize('educator', 'admin'), async (req, res, next) => {
  try {
    // find courses owned by educator
    let courses = await Course.find({ instructor: req.user._id }).select('_id');
    if (courses.length === 0 && req.user.createdCourses && req.user.createdCourses.length > 0) {
      courses = await Course.find({ _id: { $in: req.user.createdCourses } }).select('_id');
    }
    console.log(`[EnrollReq] educator ${req.user._id} owns ${courses.length} courses`);
    const courseIds = courses.map((c) => c._id);

    const requests = await EnrollmentRequest.find({ courseId: { $in: courseIds }, status: 'pending' })
      .populate('studentId', 'name email avatar')
      .populate('courseId', 'title');

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// Educator: approve or reject
router.patch('/educator/requests/:reqId', protect, authorize('educator', 'admin'), async (req, res, next) => {
  try {
    const { reqId } = req.params;
    const { status } = req.body; // approved or rejected
    if (!['approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    const request = await EnrollmentRequest.findById(reqId);
    if (!request) return next(new ErrorResponse('Request not found', 404));

    const course = await Course.findById(request.courseId);
    if (!course) return next(new ErrorResponse('Course not found', 404));
    if (course.instructor.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to approve enrollments for this course', 403));
    }
    if (request.status !== 'pending') return next(new ErrorResponse('Enrollment request has already been decided', 409));

    if (status === 'approved') {
      if (!course.isPublished || course.price > 0) {
        return next(new ErrorResponse('Approval requires a published, free course. Paid access must be verified through billing.', 409));
      }
      const student = await User.findById(request.studentId).select('role');
      if (!student || student.role !== 'student') {
        return next(new ErrorResponse('Valid student account required', 409));
      }
      // Idempotent writes; a cross-document transaction is a Phase 4 requirement.
      await Course.findByIdAndUpdate(course._id, { $addToSet: { enrolledStudents: request.studentId } });
      await User.findByIdAndUpdate(request.studentId, { $addToSet: { enrolledCourses: course._id } });
      await Progress.findOneAndUpdate(
        { user: request.studentId, course: course._id },
        { $setOnInsert: { status: 'active', completedLessons: [], completed: false } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    const updated = await EnrollmentRequest.findOneAndUpdate(
      { _id: request._id, status: 'pending' },
      { $set: { status } },
      { new: true }
    );
    if (!updated) return next(new ErrorResponse('Request was already decided by another action', 409));

    // A notification outage must not turn a successful enrollment into a false failure.
    try {
      await Notification.create({
        user: request.studentId,
        message: `Your enrollment request for ${course.title} was ${status}.`,
        link: `/courses/${course._id}/learn`
      });
    } catch (notificationError) {
      console.error('Enrollment notification could not be delivered');
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// Student: check if they have a pending enrollment
router.get('/courses/:id/enrollment-request-status', protect, authorize('student'), async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const existing = await EnrollmentRequest.findOne({ courseId, studentId: req.user._id });
    res.json({ success: true, data: existing?.status || null }); // null, 'pending', 'approved', 'rejected'
  } catch (err) {
    next(err);
  }
});

export default router;
