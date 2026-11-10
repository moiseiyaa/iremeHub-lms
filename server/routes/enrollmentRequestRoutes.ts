import express from 'express';
import mongoose from 'mongoose';
import { protect, authorize } from '../middleware/auth';
import EnrollmentRequest from '../models/EnrollmentRequest';
import Course from '../models/Course';
import User from '../models/User';
import Progress from '../models/Progress';
import { Notification } from '../models/Notification';
import ErrorResponse from '../utils/errorResponse';
import { canApproveFreeEnrollment } from '../utils/courseAccessPolicy';

const router = express.Router();

// Student: request enrollment
router.post('/courses/:id/request-enroll', protect, authorize('student'), async (req, res, next) => {
  try {
    const courseId = req.params.id;
    if (!mongoose.isValidObjectId(courseId)) return next(new ErrorResponse('Invalid course ID', 400));
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

    // Do not turn a recorded enrollment request into a false failure if
    // notification delivery is temporarily unavailable.
    try {
      await Notification.create({
        user: course.instructor,
        message: `${req.user.name || 'A student'} requested to enroll in ${course.title}.`,
        link: '/dashboard/educator/requests'
      });
    } catch {
      console.warn('Enrollment notification was not delivered');
    }

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// Educator: get pending requests for their courses
router.get('/educator/requests', protect, authorize('educator', 'admin'), async (req, res, next) => {
  try {
    // Instructor ownership must come from the course, not a stale user-side list.
    const courses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = courses.map(course => course._id);

    const requests = await EnrollmentRequest.find({ courseId: { $in: courseIds }, status: 'pending' })
      .populate('studentId', 'name email avatar')
      .populate('courseId', 'title');

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// Educator: approve or reject
// All membership changes are committed atomically. A replica-set-capable
// MongoDB deployment is required (single-node replica sets work for local dev).
router.patch('/educator/requests/:reqId', protect, authorize('educator', 'admin'), async (req, res, next) => {
  const { reqId } = req.params;
  const { status } = req.body;
  if (!mongoose.isValidObjectId(reqId)) return next(new ErrorResponse('Invalid request ID', 400));
  if (status !== 'approved' && status !== 'rejected') {
    return next(new ErrorResponse('Decision must be approved or rejected', 400));
  }

  type Decision = {
    decided: { _id: mongoose.Types.ObjectId; status: string };
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    courseTitle: string;
  };
  let outcome: Decision | undefined;
  const session = await mongoose.startSession().catch(error => {
    next(error);
    return null;
  });
  if (!session) return;

  try {
    outcome = await session.withTransaction(async (): Promise<Decision> => {
      let decided: Decision['decided'] | null = null;
      // Load the decision facts within the transaction; never trust role or
      // payment eligibility provided in the browser's request body.
      const request = await EnrollmentRequest.findById(reqId).session(session);
      if (!request) throw new ErrorResponse('Enrollment request not found', 404);
      const course = await Course.findById(request.courseId).session(session);
      if (!course) throw new ErrorResponse('Course not found', 404);
      if (course.instructor.toString() !== req.user._id.toString()) {
        throw new ErrorResponse('Not authorized to manage this enrollment', 403);
      }
      if (request.status !== 'pending') {
        throw new ErrorResponse('Enrollment request has already been decided', 409);
      }

      if (status === 'approved') {
        const student = await User.findById(request.studentId).select('role').session(session);
        if (!canApproveFreeEnrollment({
          published: course.isPublished,
          price: course.price,
          pending: request.status === 'pending',
          ownedByApprover: course.instructor.toString() === req.user._id.toString(),
          requesterIsStudent: student?.role === 'student'
        })) {
          throw new ErrorResponse('Only published free courses may be approved; paid access requires verified billing', 409);
        }

        // Claim the pending request first. Concurrent decisions cannot both
        // win, and the claim rolls back if a membership write fails.
        const claimed = await EnrollmentRequest.findOneAndUpdate(
          { _id: request._id, status: 'pending' },
          { $set: { status: 'approved' } },
          { new: true, session }
        );
        if (!claimed) throw new ErrorResponse('Request was decided concurrently', 409);

        const updatedCourse = await Course.updateOne(
          { _id: course._id, isPublished: true, price: { $lte: 0 } },
          { $addToSet: { enrolledStudents: request.studentId } },
          { session }
        );
        if (updatedCourse.matchedCount !== 1) {
          throw new ErrorResponse('Course is no longer eligible for enrollment', 409);
        }

        const updatedUser = await User.updateOne(
          { _id: request.studentId, role: 'student' },
          { $addToSet: { enrolledCourses: course._id } },
          { session }
        );
        if (updatedUser.matchedCount !== 1) {
          throw new ErrorResponse('Student account is no longer eligible', 409);
        }

        await Progress.findOneAndUpdate(
          { user: request.studentId, course: course._id },
          {
            $set: { status: 'active' },
            $setOnInsert: { completedLessons: [], completed: false }
          },
          { upsert: true, setDefaultsOnInsert: true, runValidators: true, session }
        );
        decided = { _id: claimed._id, status: claimed.status };
      } else {
        const claimed = await EnrollmentRequest.findOneAndUpdate(
          { _id: request._id, status: 'pending' },
          { $set: { status: 'rejected' } },
          { new: true, session }
        );
        if (!claimed) throw new ErrorResponse('Request was decided concurrently', 409);
        decided = { _id: claimed._id, status: claimed.status };
      }
      if (!decided) throw new ErrorResponse('Enrollment decision was not committed', 503);
      return {
        decided,
        studentId: request.studentId,
        courseId: course._id,
        courseTitle: course.title
      };
    }, {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    });
  } catch (error) {
    if (error instanceof ErrorResponse) return next(error);
    // Standalone MongoDB cannot run multi-document transactions. Fail closed
    // rather than reverting to unsafe partial writes.
    if (error instanceof Error &&
        /transaction numbers are only allowed|replica set|not supported in a transaction/i.test(error.message)) {
      return next(new ErrorResponse('Enrollment approvals require a transaction-enabled MongoDB replica set', 503));
    }
    return next(error);
  } finally {
    await session.endSession();
  }

  if (!outcome) {
    return next(new ErrorResponse('Enrollment decision was not committed', 503));
  }
  const { decided, studentId, courseId, courseTitle } = outcome;

  // Notification is deliberately outside the transaction: it cannot change
  // course access or cause a transaction to repeat.
  try {
    await Notification.create({
      user: studentId,
      message: `Your enrollment request for ${courseTitle} was ${status}.`,
      link: status === 'approved' ? `/courses/${courseId}/learn` : `/courses/${courseId}`
    });
  } catch {
    console.warn('Enrollment decision notification was not delivered');
  }

  return res.json({ success: true, data: decided });
});

// Student: check if they have a pending enrollment
router.get('/courses/:id/enrollment-request-status', protect, authorize('student'), async (req, res, next) => {
  try {
    const courseId = req.params.id;
    if (!mongoose.isValidObjectId(courseId)) return next(new ErrorResponse('Invalid course ID', 400));
    const existing = await EnrollmentRequest.findOne({ courseId, studentId: req.user._id });
    res.json({ success: true, data: existing?.status || null }); // null, 'pending', 'approved', 'rejected'
  } catch (err) {
    next(err);
  }
});

export default router;
