const express = require('express');
const {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/sectionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Protected routes
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', getSections);
router.get('/:id', getSection);

// Educator/Admin routes
router.post('/', authorize('educator', 'admin'), createSection);
router.put('/:id', authorize('educator', 'admin'), updateSection);
router.delete('/:id', authorize('educator', 'admin'), deleteSection);

module.exports = router; 