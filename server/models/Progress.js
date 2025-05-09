const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLessons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }],
  quizResults: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson'
    },
    score: Number,
    totalQuestions: Number,
    answers: [{
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean,
      points: Number
    }],
    attempts: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignmentSubmissions: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson'
    },
    submissionText: String,
    submissionFiles: [{
      fileUrl: String,
      fileName: String,
      fileType: String
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    grade: Number,
    feedback: String,
    graded: {
      type: Boolean,
      default: false
    },
    gradedAt: Date
  }],
  examResults: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson'
    },
    score: Number,
    totalPoints: Number,
    percentageScore: Number,
    passed: Boolean,
    answers: [{
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean,
      points: Number
    }],
    startedAt: Date,
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: Number // in minutes
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String,
    certificateUrl: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
ProgressSchema.virtual('progressPercentage').get(function() {
  return this.completedLessons.length / this.totalLessons * 100;
});

module.exports = mongoose.model('Progress', ProgressSchema);