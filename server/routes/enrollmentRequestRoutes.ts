import express from 'express';
import { protect, authorize } from '../middleware/auth';
import EnrollmentRequest from '../models/EnrollmentRequest';
import Course from '../models/Course';
import { Notification } from '../models/Notification';
import ErrorResponse from '../utils/errorResponse';

const router = express.Router();

// Student: request enrollment
router.post('/courses/:id/request-enroll', protect, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).select('instructor');
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }
    // Prevent instructor from requesting own course
    if (req.user && req.user._id.toString() === course.instructor.toString()) {
      return next(new ErrorResponse('Instructors cannot enroll in their own course', 400));
    }

    const doc = await EnrollmentRequest.findOneAndUpdate(
      { courseId, studentId: req.user._id },
      { courseId, studentId: req.user._id, status: 'pending' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// Educator: get pending requests for their courses
router.get('/educator/requests', protect, authorize('educator'), async (req, res, next) => {
  try {
    // find courses owned by educator
    const courses = await Course.find({ instructor: req.user._id }).select('_id');
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
router.patch('/educator/requests/:reqId', protect, authorize('educator'), async (req, res, next) => {
  try {
    const { reqId } = req.params;
    const { status } = req.body; // approved or rejected
    if (!['approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    const request = await EnrollmentRequest.findById(reqId).populate('courseId');
    if (!request) return next(new ErrorResponse('Request not found', 404));

    // ensure educator owns the course
    if (request.courseId && request.courseId.instructor.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    request.status = status as any;
    await request.save();

    // If approved, add student to course enrollment list
    if (status === 'approved') {
      await Course.findByIdAndUpdate((request.courseId as any)._id || request.courseId, {
        $addToSet: { enrolledStudents: request.studentId }
      });
    }

    // Create notification for the student
    await Notification.create({
      user: request.studentId,
      message: `Your enrollment request for ${request.courseId.title} was ${status}.`,
      link: `/courses/${request.courseId._id}/learn`
    });

    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// Student: check if they have a pending enrollment
router.get('/courses/:id/enrollment-request-status', protect, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const existing = await EnrollmentRequest.findOne({ courseId, studentId: req.user._id });
    res.json({ success: true, data: existing?.status || null }); // null, 'pending', 'approved', 'rejected'
  } catch (err) {
    next(err);
  }
});

export default router;
