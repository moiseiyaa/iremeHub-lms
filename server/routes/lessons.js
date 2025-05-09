const express = require('express');
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadVideo
} = require('../controllers/lessonController');

const {
  completeLesson,
  submitQuiz,
  submitAssignment,
  startExam,
  submitExam
} = require('../controllers/progressController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protect);

// Student routes
router.post('/:id/complete', authorize('student'), completeLesson);
router.post('/:id/quiz', authorize('student'), submitQuiz);
router.post('/:id/assignment', authorize('student'), submitAssignment);
router.post('/:id/exam/start', authorize('student'), startExam);
router.post('/:id/exam/submit', authorize('student'), submitExam);

// Add a special route just for direct lesson completion with lessonId param
router.post('/lessonId/:lessonId/complete', authorize('student'), completeLesson);

// Get lessons (enrolled students, educators, admins)
router.get('/', getLessons);
router.get('/:id', getLesson);

// Educator/Admin routes
router.post('/', authorize('educator', 'admin'), createLesson);
router.put('/:id', authorize('educator', 'admin'), updateLesson);
router.delete('/:id', authorize('educator', 'admin'), deleteLesson);
router.put('/:id/video', authorize('educator', 'admin'), uploadVideo);

module.exports = router; 