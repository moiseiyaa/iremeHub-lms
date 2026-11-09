import { Request, Response, NextFunction } from 'express';
import { Progress, Course, Lesson, Certificate } from '../models';
import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import crypto from 'crypto';
import cloudinary from '../utils/cloudinary';
import mongoose from 'mongoose';
import { ILesson } from '../models/Lesson';
import { IProgress } from '../models/Progress';
import { ICertificate } from '../models/Certificate';
import { ICourse } from '../models/Course';
import { IUser } from '../models/User';
import { hasCompleteAnswers, isExamSessionActive, remainingMinutes } from '../utils/assessmentPolicy';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Define custom request interface with user property
interface UserRequest extends Request {
  user: IUser;
  files?: any;
}

interface ExamQuestion {
  question: string;
  options: string[];
  points: number;
}

interface GradedAnswer {
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
  points: number;
}

interface ExamResult {
  lesson: mongoose.Types.ObjectId;
  score: number;
  totalPoints: number;
  percentageScore: number;
  passed: boolean;
  answers: GradedAnswer[];
  startedAt: Date;
  completedAt: Date;
  timeSpent: number;
}

interface IAssignmentSubmission {
  lesson: mongoose.Types.ObjectId;
  submissionText: string;
  submittedAt: Date;
  graded: boolean;
  grade?: number;
  feedback?: string;
}

// @desc    Get progress for a user in a course
// @route   GET /api/v1/courses/:courseId/progress
// @access  Private
export const getProgress = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if user is enrolled in the course or is the instructor
  const enrolledStudents = course.enrolledStudents || [];
  const isEnrolled = enrolledStudents.some(student => student.toString() === req.user.id);
  const isInstructor = course.instructor.toString() === req.user.id;
  
  if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this resource', 401));
  }

  // Get the total number of lessons
  const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });

  // Get or create progress
  let progress = await Progress.findOne({
    user: req.user.id,
    course: req.params.courseId
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user.id,
      course: req.params.courseId
    });
  }

  // Calculate progress percentage
  const progressPercentage = totalLessons > 0 
    ? (progress.completedLessons.length / totalLessons * 100).toFixed(2) 
    : 0;

  // Return grades and completion state without revealing per-question answer keys.
  const result = progress.toObject();
  const withoutAnswers = (rows: Array<Record<string, unknown>> = []) =>
    rows.map(({ answers: _answers, ...safe }) => safe);
  result.quizResults = withoutAnswers(result.quizResults);
  result.examResults = withoutAnswers(result.examResults);

  res.status(200).json({
    success: true,
    data: {
      ...result,
      totalLessons,
      progressPercentage
    }
  });
});

// @desc    Mark lesson as completed
// @route   POST /api/v1/courses/:courseId/lessons/:id/complete
// @route   POST /api/v1/lessons/lessonId/:lessonId/complete
// @access  Private
export const completeLesson = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  console.log('Complete lesson request params:', req.params);
  
  // Get the lesson ID from either the id or lessonId parameter
  const lessonId = req.params.id || req.params.lessonId;
  
  if (!lessonId) {
    return next(new ErrorResponse('Lesson ID is required', 400));
  }
  
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${lessonId}`, 404));
  }

  if (['quiz', 'exam', 'assignment'].includes(lesson.contentType)) {
    return next(new ErrorResponse('Complete this activity using its submission form', 403));
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${lesson.course}`, 404));
  }

  // Check if user is enrolled in the course
  const enrolledStudents = course.enrolledStudents || [];
  if (!enrolledStudents.some(student => student.toString() === req.user.id)) {
    return next(new ErrorResponse('You must be enrolled to mark lessons as complete', 401));
  }

  // Find or create progress record
  let progress = await Progress.findOne({
    user: req.user.id,
    course: lesson.course
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user.id,
      course: lesson.course,
      completedLessons: []
    });
  }

  // Ensure completedLessons is an array
  if (!progress.completedLessons) {
    progress.completedLessons = [];
  }

  // Add lesson to completedLessons if not already there
  const lessonIdString = lesson._id.toString();
  const isCompleted = progress.completedLessons.some(id => id.toString() === lessonIdString);
  
  if (!isCompleted) {
    progress.completedLessons.push(lesson._id);
    progress.lastAccessed = new Date();
    await progress.save();
  }

  // Get total lessons in course to check if course is completed
  const totalLessons = await Lesson.countDocuments({ course: lesson.course });
  
  // Check if all lessons are completed
  if (totalLessons > 0 && progress.completedLessons.length === totalLessons && !progress.completed) {
    progress.completed = true;
    progress.completedAt = new Date();
    await progress.save();
    
    // Could trigger certificate generation here if automatic
  }

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Submit quiz answers
// @route   POST /api/v1/lessons/:id/quiz
// @access  Private
export const submitQuiz = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if the lesson is a quiz
  if (lesson.contentType !== 'quiz') {
    return next(new ErrorResponse(`Lesson is not a quiz`, 400));
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${lesson.course}`, 404));
  }

  // Check if user is enrolled in the course
  const enrolledStudents = course.enrolledStudents || [];
  if (!enrolledStudents.some(student => student.toString() === req.user.id)) {
    return next(new ErrorResponse('You must be enrolled to submit quiz answers', 401));
  }

  // Get user answers from request
  const { answers } = req.body;

  const quizQuestions = lesson.content.quizQuestions || [];
  if (!hasCompleteAnswers(answers, quizQuestions)) {
    return next(new ErrorResponse('Provide one valid answer for each quiz question', 400));
  }

  // Find or create progress record
  let progress = await Progress.findOne({
    user: req.user.id,
    course: lesson.course
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user.id,
      course: lesson.course
    });
  }

  // Grade the complete, validated quiz on the server.
  let score = 0;
  let totalPoints = 0;
  const gradedAnswers: GradedAnswer[] = [];

  answers.forEach((answer: number, index: number) => {
      const question = quizQuestions[index];
      const isCorrect = answer === question.correctAnswer;
      const points = isCorrect ? (question.points || 1) : 0;
      
      score += points;
      totalPoints += (question.points || 1);
      
      gradedAnswers.push({
        questionIndex: index,
        selectedOption: answer,
        isCorrect,
        points
      });
  });

  // Find existing quiz result to update attempts count
  const existingQuizIndex = progress.quizResults 
    ? progress.quizResults.findIndex(
        quiz => quiz.lesson.toString() === lesson._id.toString()
      )
    : -1;

  // Limit repeated guessing of the assessment key.
  if (existingQuizIndex >= 0 && progress.quizResults[existingQuizIndex].attempts >= 5) {
    return next(new ErrorResponse('Maximum quiz attempts reached. Contact your educator.', 429));
  }

  const quizResult = {
    lesson: lesson._id,
    score,
    totalQuestions: quizQuestions.length,
    answers: gradedAnswers,
    attempts: 1,
    completedAt: new Date()
  };

  if (existingQuizIndex > -1 && Array.isArray(progress.quizResults)) {
    // Update existing quiz result
    quizResult.attempts = progress.quizResults[existingQuizIndex].attempts + 1;
    progress.quizResults[existingQuizIndex] = quizResult;
  } else {
    // Ensure quizResults array exists
    if (!progress.quizResults) {
      progress.quizResults = [];
    }
    // Add new quiz result
    progress.quizResults.push(quizResult);
  }

  // Update total points
  progress.totalPoints = progress.quizResults.reduce((total, quiz) => total + quiz.score, 0);

  // Update lastAccessed
  progress.lastAccessed = new Date();

  // Mark the quiz complete only when the server-side passing threshold is met.
  const percentageScore = totalPoints > 0 ? (score / totalPoints * 100).toFixed(2) : '0';
  const passed = totalPoints > 0 && score / totalPoints >= 0.7;
  if (passed && !progress.completedLessons.some(id => id.toString() === lesson._id.toString())) {
    progress.completedLessons.push(lesson._id);
  }
  await progress.save();

  res.status(200).json({
    success: true,
    data: {
      // The complete grading detail is retained internally but is not sent to learners.
      quizResult: {
        lesson: quizResult.lesson,
        score: quizResult.score,
        totalQuestions: quizResult.totalQuestions,
        attempts: quizResult.attempts,
        completedAt: quizResult.completedAt
      },
      score,
      totalPoints,
      percentageScore,
      isPassing: passed
    }
  });
});

// @desc    Submit assignment
// @route   POST /api/v1/lessons/:id/assignment
// @access  Private
export const submitAssignment = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if the lesson is an assignment
  if (lesson.contentType !== 'assignment') {
    return next(new ErrorResponse(`Lesson is not an assignment`, 400));
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${lesson.course}`, 404));
  }

  // Check if user is enrolled in the course
  const enrolledStudents = course.enrolledStudents || [];
  if (!enrolledStudents.some(student => student.toString() === req.user.id)) {
    return next(new ErrorResponse('You must be enrolled to submit assignments', 401));
  }

  const { submissionText } = req.body;

  // Find or create progress record
  let progress = await Progress.findOne({
    user: req.user.id,
    course: lesson.course
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user.id,
      course: lesson.course
    });
  }

  // Create assignment submission
  const submission: IAssignmentSubmission = {
    lesson: lesson._id,
    submissionText,
    submittedAt: new Date(),
    graded: false
  };

  // Check if there's an existing submission to update
  const existingSubmissionIndex = progress.assignmentSubmissions 
    ? progress.assignmentSubmissions.findIndex(sub => sub.lesson.toString() === lesson._id.toString())
    : -1;

  if (existingSubmissionIndex > -1 && Array.isArray(progress.assignmentSubmissions)) {
    progress.assignmentSubmissions[existingSubmissionIndex] = {
      ...progress.assignmentSubmissions[existingSubmissionIndex],
      ...submission
    };
  } else {
    // Ensure assignmentSubmissions array exists
    if (!progress.assignmentSubmissions) {
      progress.assignmentSubmissions = [];
    }
    
    progress.assignmentSubmissions.push(submission);
  }

  // Mark lesson as completed
  const lessonIdString = lesson._id.toString();
  const isCompleted = progress.completedLessons.some(id => id.toString() === lessonIdString);
  
  if (!isCompleted) {
    progress.completedLessons.push(lesson._id);
  }

  progress.lastAccessed = new Date();
  await progress.save();

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Start exam
// @route   POST /api/v1/lessons/:id/exam/start
// @access  Private
export const startExam = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return next(new ErrorResponse('Lesson not found', 404));
  if (lesson.contentType !== 'exam') return next(new ErrorResponse('Lesson is not an exam', 400));
  const course = await Course.findById(lesson.course);
  if (!course) return next(new ErrorResponse('Course not found', 404));
  if (!course.enrolledStudents.some(id => id.toString() === req.user.id)) {
    return next(new ErrorResponse('Enrollment required to take this exam', 403));
  }

  let progress = await Progress.findOne({ user: req.user.id, course: lesson.course });
  if (!progress) progress = await Progress.create({ user: req.user.id, course: lesson.course });
  const previousPass = progress.examResults?.find(result =>
    result.lesson.toString() === lesson._id.toString() && result.passed);
  if (previousPass) {
    return res.json({
      success: true,
      data: {
        message: 'Exam already completed and passed',
        data: {
          score: previousPass.score,
          totalPoints: previousPass.totalPoints,
          percentageScore: previousPass.percentageScore,
          passingScore: lesson.content.passingScore || 85
        }
      }
    });
  }

  if (!progress.examSessions) progress.examSessions = [];
  const history = progress.examSessions.filter(session =>
    session.lesson.toString() === lesson._id.toString());
  const now = new Date();
  let active = history.find(session => isExamSessionActive(session.startedAt, session.expiresAt, session.submittedAt, now.getTime()));

  // Re-opening the page cannot reset the timer; a learner gets at most
  // three server-issued attempts. Longer-term limits belong in policy settings.
  if (!active) {
    if (history.length >= 3) {
      return next(new ErrorResponse('Maximum exam attempts reached. Contact your educator.', 429));
    }
    const durationMinutes = Math.min(240, Math.max(1, Number(lesson.content.examDuration) || 60));
    const fresh = {
      lesson: lesson._id,
      startedAt: now,
      expiresAt: new Date(now.getTime() + durationMinutes * 60_000)
    };
    progress.examSessions.push(fresh);
    await progress.save();
    active = progress.examSessions[progress.examSessions.length - 1];
  }

  const examQuestions = lesson.content.examQuestions || [];
  if (!examQuestions.length) return next(new ErrorResponse('Exam has no questions', 409));
  return res.json({
    success: true,
    data: {
      examQuestions: examQuestions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points
      })),
      startedAt: active.startedAt,
      timeLimit: remainingMinutes(active.expiresAt, Date.now()),
      passingScore: lesson.content.passingScore || 85
    }
  });
});

// @desc    Grade a full exam submission against a server-issued attempt.
export const submitExam = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return next(new ErrorResponse('Lesson not found', 404));
  if (lesson.contentType !== 'exam') return next(new ErrorResponse('Lesson is not an exam', 400));

  const course = await Course.findById(lesson.course);
  if (!course) return next(new ErrorResponse('Course not found', 404));
  if (!course.enrolledStudents.some(id => id.toString() === req.user.id)) {
    return next(new ErrorResponse('Enrollment required to submit exams', 403));
  }

  const questions = lesson.content.examQuestions || [];
  const { answers } = req.body;
  if (!hasCompleteAnswers(answers, questions)) {
    return next(new ErrorResponse('Provide one valid answer for every exam question', 400));
  }

  const progress = await Progress.findOne({ user: req.user.id, course: lesson.course });
  if (!progress) return next(new ErrorResponse('Start the exam before submitting answers', 409));

  const now = new Date();
  const session = progress.examSessions?.find(attempt =>
    attempt.lesson.toString() === lesson._id.toString() &&
    isExamSessionActive(attempt.startedAt, attempt.expiresAt, attempt.submittedAt, now.getTime()));
  if (!session) return next(new ErrorResponse('Exam attempt expired or not started. Start a valid attempt first.', 409));

  let score = 0;
  let totalPoints = 0;
  const gradedAnswers: GradedAnswer[] = [];
  answers.forEach((answer: number, index: number) => {
    const question = questions[index];
    const value = Number(question.points) > 0 ? Number(question.points) : 1;
    const isCorrect = answer === question.correctAnswer;
    totalPoints += value;
    if (isCorrect) score += value;
    gradedAnswers.push({
      questionIndex: index,
      selectedOption: answer,
      isCorrect,
      points: isCorrect ? value : 0
    });
  });

  const percentageScore = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  const requiredPassingScore = lesson.content.passingScore || 85;
  const passed = percentageScore >= requiredPassingScore;
  const examResult: ExamResult = {
    lesson: lesson._id,
    score,
    totalPoints,
    percentageScore,
    passed,
    answers: gradedAnswers,
    startedAt: session.startedAt,
    completedAt: now,
    timeSpent: (now.getTime() - session.startedAt.getTime()) / 60_000
  };

  if (!progress.examResults) progress.examResults = [];
  progress.examResults.push(examResult);
  session.submittedAt = now;
  if (passed && !progress.completedLessons.some(id => id.toString() === lesson._id.toString())) {
    progress.completedLessons.push(lesson._id);
  }
  progress.lastAccessed = now;
  await progress.save();

  return res.json({
    success: true,
    data: {
      // Answer-by-answer grading is private; return score and pass/fail only.
      examResult: {
        lesson: examResult.lesson,
        score,
        totalPoints,
        percentageScore,
        passed,
        startedAt: examResult.startedAt,
        completedAt: examResult.completedAt
      },
      passed,
      percentageScore,
      requiredPassingScore
    }
  });
});

// @desc    Generate certificate for completed course
// @route   POST /api/v1/courses/:courseId/certificate
// @access  Private
export const generateCertificate = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if user is enrolled in the course
  const enrolledStudents = course.enrolledStudents || [];
  if (!enrolledStudents.some(student => student.toString() === req.user.id)) {
    return next(new ErrorResponse('You must be enrolled in this course to get a certificate', 401));
  }

  // Find progress record
  const progress = await Progress.findOne({
    user: req.user.id,
    course: req.params.courseId
  });

  if (!progress) {
    return next(new ErrorResponse('No progress found for this course', 404));
  }

  // Check if course is completed
  const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
  
  if (progress.completedLessons.length < totalLessons) {
    return next(new ErrorResponse('You must complete all lessons to receive a certificate', 400));
  }

  // Check if final exam is passed (if exists)
  const finalExam = await Lesson.findOne({ 
    course: req.params.courseId,
    contentType: 'exam'
  }).sort('-order'); // Get the last exam in the course

  if (finalExam) {
    // Check if user has a passing result for the final exam
    const hasPassed = progress.examResults && 
      progress.examResults.some(
        exam => exam.lesson.toString() === finalExam._id.toString() && exam.passed === true
      );
    
    if (!hasPassed) {
      return next(new ErrorResponse('You must pass the final exam to receive a certificate', 400));
    }
  }

  // Check if certificate already exists
  if (progress.certificate && progress.certificate.issued) {
    return next(new ErrorResponse('Certificate has already been issued', 400));
  }

  // Generate certificate
  const certificateId = crypto.randomBytes(16).toString('hex');
  
  // Extract exam grade if available
  let grade = 'N/A';
  let percentageScore = 0;
  
  if (finalExam && progress.examResults) {
    const examResult = progress.examResults.find(
      exam => exam.lesson.toString() === finalExam._id.toString() && exam.passed === true
    );
    
    if (examResult) {
      percentageScore = examResult.percentageScore;
      
      if (percentageScore >= 90) {
        grade = 'A';
      } else if (percentageScore >= 80) {
        grade = 'B';
      } else if (percentageScore >= 70) {
        grade = 'C';
      } else {
        grade = 'Pass';
      }
    }
  }
  
  const certificate = await Certificate.create({
    user: req.user.id,
    course: req.params.courseId,
    certificateId,
    metadata: {
      courseCompletionDate: progress.completedAt || new Date(),
      grade,
      hoursCompleted: totalLessons * 0.5 // Estimate 30 minutes per lesson
    }
  });

  // Update progress with certificate info
  progress.certificate = {
    issued: true,
    issuedAt: new Date(),
    certificateId: certificate.certificateId,
    certificateUrl: `/api/v1/certificates/${certificate.certificateId}`
  };
  
  await progress.save();

  res.status(200).json({
    success: true,
    data: certificate
  });
});

// @desc    Get all certificates for a user
// @route   GET /api/v1/certificates
// @access  Private
export const getUserCertificates = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const certificates = await Certificate.find({ user: req.user.id })
    .populate('course', 'title description category level');

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

// @desc    Upload certificate template (for educator)
// @route   POST /api/v1/courses/:courseId/certificate-template
// @access  Private (Educator/Admin)
export const uploadCertificateTemplate = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Make sure user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User is not authorized to upload certificate template`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.certificate;

  // Make sure the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  const maxFileUpload = process.env.MAX_FILE_UPLOAD ? parseInt(process.env.MAX_FILE_UPLOAD) : 1000000;
  if (file.size > maxFileUpload) {
    return next(new ErrorResponse(`Please upload an image less than ${maxFileUpload}`, 400));
  }

  // Upload to cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'lms/certificates'
  });

  // Update course with certificate template
  if (!course.certificateTemplate) {
    course.certificateTemplate = {};
  }
  
  // Delete old template if exists
  if (course.certificateTemplate.public_id) {
    await cloudinary.uploader.destroy(course.certificateTemplate.public_id);
  }
  
  course.certificateTemplate.public_id = result.public_id;
  course.certificateTemplate.url = result.secure_url;
  
  await course.save();

  res.status(200).json({
    success: true,
    data: course.certificateTemplate
  });
});

// @desc    Get certificate by ID
// @route   GET /api/v1/certificates/:certificateId
// @access  Public
export const getCertificateById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate('user', 'name email avatar')
    .populate('course', 'title description category level instructor');

  if (!certificate) {
    return next(new ErrorResponse(`Certificate not found with id of ${req.params.certificateId}`, 404));
  }

  // Get instructor details
  await certificate.populate({
    path: 'course.instructor',
    select: 'name email'
  });

  res.status(200).json({
    success: true,
    data: certificate
  });
});

// @desc    Verify certificate
// @route   GET /api/v1/certificates/:certificateId/verify
// @access  Public
export const verifyCertificate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate<{ user: IUser }>('user', 'name')
    .populate<{ course: ICourse }>('course', 'title');

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
      recipient: certificate.user.name,
      course: certificate.course.title
    }
  });
});