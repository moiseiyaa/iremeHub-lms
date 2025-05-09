const { Progress, Course, Lesson, Certificate } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const cloudinary = require('../utils/cloudinary');

// @desc    Get progress for a user in a course
// @route   GET /api/v1/courses/:courseId/progress
// @access  Private
exports.getProgress = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if user is enrolled in the course or is the instructor
  if (!course.enrolledStudents.includes(req.user.id) && 
      course.instructor.toString() !== req.user.id && 
      req.user.role !== 'admin') {
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

  res.status(200).json({
    success: true,
    data: {
      ...progress.toObject(),
      totalLessons,
      progressPercentage
    }
  });
});

// @desc    Mark lesson as completed
// @route   POST /api/v1/courses/:courseId/lessons/:id/complete
// @route   POST /api/v1/lessons/lessonId/:lessonId/complete
// @access  Private
exports.completeLesson = asyncHandler(async (req, res, next) => {
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

  const course = await Course.findById(lesson.course);

  // Check if user is enrolled in the course
  if (!course.enrolledStudents.includes(req.user.id)) {
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
  if (!progress.completedLessons.includes(lesson._id)) {
    progress.completedLessons.push(lesson._id);
    progress.lastAccessed = Date.now();
    await progress.save();
  }

  // Get total lessons in course to check if course is completed
  const totalLessons = await Lesson.countDocuments({ course: lesson.course });
  
  // Check if all lessons are completed
  if (progress.completedLessons.length === totalLessons && !progress.completed) {
    progress.completed = true;
    progress.completedAt = Date.now();
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
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if the lesson is a quiz
  if (lesson.contentType !== 'quiz') {
    return next(new ErrorResponse(`Lesson is not a quiz`, 400));
  }

  const course = await Course.findById(lesson.course);

  // Check if user is enrolled in the course
  if (!course.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('You must be enrolled to submit quiz answers', 401));
  }

  // Get user answers from request
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return next(new ErrorResponse('Please provide answers as an array', 400));
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

  // Grade the quiz
  const quizQuestions = lesson.content.quizQuestions;
  let score = 0;
  let totalPoints = 0;
  const gradedAnswers = [];

  answers.forEach((answer, index) => {
    if (index < quizQuestions.length) {
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
    }
  });

  // Find existing quiz result to update attempts count
  const existingQuizIndex = progress.quizResults.findIndex(
    quiz => quiz.lesson.toString() === lesson._id.toString()
  );

  const quizResult = {
    lesson: lesson._id,
    score,
    totalQuestions: quizQuestions.length,
    answers: gradedAnswers,
    attempts: 1,
    completedAt: Date.now()
  };

  if (existingQuizIndex > -1) {
    // Update existing quiz result
    quizResult.attempts = progress.quizResults[existingQuizIndex].attempts + 1;
    progress.quizResults[existingQuizIndex] = quizResult;
  } else {
    // Add new quiz result
    progress.quizResults.push(quizResult);
  }

  // Update total points
  progress.totalPoints = progress.quizResults.reduce((total, quiz) => total + quiz.score, 0);

  // Update lastAccessed
  progress.lastAccessed = Date.now();

  // Add to completedLessons if not already there
  if (!progress.completedLessons.includes(lesson._id)) {
    progress.completedLessons.push(lesson._id);
  }

  await progress.save();

  // Calculate percentage score
  const percentageScore = totalPoints > 0 ? (score / totalPoints * 100).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    data: {
      quizResult,
      score,
      totalPoints,
      percentageScore,
      isPassing: percentageScore >= 70 // Assuming 70% is passing
    }
  });
});

// @desc    Submit assignment
// @route   POST /api/v1/lessons/:id/assignment
// @access  Private
exports.submitAssignment = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if the lesson is an assignment
  if (lesson.contentType !== 'assignment') {
    return next(new ErrorResponse(`Lesson is not an assignment`, 400));
  }

  const course = await Course.findById(lesson.course);

  // Check if user is enrolled in the course
  if (!course.enrolledStudents.includes(req.user.id)) {
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
  const submission = {
    lesson: lesson._id,
    submissionText,
    submittedAt: Date.now()
  };

  // Check if there's an existing submission to update
  const existingSubmissionIndex = progress.assignmentSubmissions 
    ? progress.assignmentSubmissions.findIndex(sub => sub.lesson.toString() === lesson._id.toString())
    : -1;

  if (existingSubmissionIndex > -1) {
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
  if (!progress.completedLessons.includes(lesson._id)) {
    progress.completedLessons.push(lesson._id);
  }

  progress.lastAccessed = Date.now();
  await progress.save();

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Start exam
// @route   POST /api/v1/lessons/:id/exam/start
// @access  Private
exports.startExam = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if the lesson is an exam
  if (lesson.contentType !== 'exam') {
    return next(new ErrorResponse(`Lesson is not an exam`, 400));
  }

  const course = await Course.findById(lesson.course);

  // Check if user is enrolled in the course
  if (!course.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('You must be enrolled to take exams', 401));
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

  // Check if exam has already been completed and passed
  const existingExamResult = progress.examResults 
    ? progress.examResults.find(
        exam => exam.lesson.toString() === lesson._id.toString() && exam.passed === true
      )
    : null;

  if (existingExamResult) {
    return res.status(200).json({
      success: true,
      message: 'Exam already completed and passed',
      data: existingExamResult
    });
  }

  // Start a new exam attempt
  const startedAt = new Date();
  
  // Return exam questions and start time
  res.status(200).json({
    success: true,
    data: {
      examQuestions: lesson.content.examQuestions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points
      })), // Send questions without answers
      startedAt,
      timeLimit: lesson.content.examDuration,
      passingScore: lesson.content.passingScore || 85
    }
  });
});

// @desc    Submit exam
// @route   POST /api/v1/lessons/:id/exam/submit
// @access  Private
exports.submitExam = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check if the lesson is an exam
  if (lesson.contentType !== 'exam') {
    return next(new ErrorResponse(`Lesson is not an exam`, 400));
  }

  const course = await Course.findById(lesson.course);

  // Check if user is enrolled in the course
  if (!course.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('You must be enrolled to submit exams', 401));
  }

  // Get user answers and start time from request
  const { answers, startedAt } = req.body;

  if (!answers || !Array.isArray(answers) || !startedAt) {
    return next(new ErrorResponse('Please provide answers array and start time', 400));
  }

  // Check if time limit exceeded
  const now = new Date();
  const startTime = new Date(startedAt);
  const timeSpentMinutes = (now.getTime() - startTime.getTime()) / 60000;
  
  if (timeSpentMinutes > lesson.content.examDuration) {
    return next(new ErrorResponse('Time limit exceeded for this exam', 400));
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

  // Grade the exam
  const examQuestions = lesson.content.examQuestions;
  let score = 0;
  let totalPoints = 0;
  const gradedAnswers = [];

  answers.forEach((answer, index) => {
    if (index < examQuestions.length) {
      const question = examQuestions[index];
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
    }
  });

  // Calculate percentage score
  const percentageScore = totalPoints > 0 ? (score / totalPoints * 100) : 0;
  
  // Check if passing score achieved
  const passingScore = lesson.content.passingScore || 85;
  const passed = percentageScore >= passingScore;

  // Create exam result
  const examResult = {
    lesson: lesson._id,
    score,
    totalPoints,
    percentageScore,
    passed,
    answers: gradedAnswers,
    startedAt: startTime,
    completedAt: now,
    timeSpent: timeSpentMinutes
  };

  // Ensure examResults array exists
  if (!progress.examResults) {
    progress.examResults = [];
  }

  // Add exam result to progress
  progress.examResults.push(examResult);

  // Mark lesson as completed if passed
  if (passed && !progress.completedLessons.includes(lesson._id)) {
    progress.completedLessons.push(lesson._id);
  }

  progress.lastAccessed = Date.now();
  await progress.save();

  res.status(200).json({
    success: true,
    data: {
      examResult,
      passed,
      percentageScore,
      requiredPassingScore: passingScore
    }
  });
});

// @desc    Generate certificate for completed course
// @route   POST /api/v1/courses/:courseId/certificate
// @access  Private
exports.generateCertificate = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if user is enrolled in the course
  if (!course.enrolledStudents.includes(req.user.id)) {
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
      examScore: percentageScore || 'N/A',
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
exports.getUserCertificates = asyncHandler(async (req, res, next) => {
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
exports.uploadCertificateTemplate = asyncHandler(async (req, res, next) => {
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
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
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
exports.getCertificateById = asyncHandler(async (req, res, next) => {
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
exports.verifyCertificate = asyncHandler(async (req, res, next) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
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
      recipient: certificate.user.name,
      course: certificate.course.title
    }
  });
}); 