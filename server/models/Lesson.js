const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  section: {
    type: mongoose.Schema.ObjectId,
    ref: 'Section'
  },
  contentType: {
    type: String,
    enum: ['video', 'text', 'quiz', 'youtube', 'assignment', 'exam'],
    required: true
  },
  content: {
    // For video
    videoUrl: String,
    videoDuration: Number,
    videoPublicId: String,
    
    // For text
    textContent: String,
    
    // For YouTube
    youtubeUrl: String,
    youtubeVideoId: String,
    
    // For quiz
    quizQuestions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      points: {
        type: Number,
        default: 1
      }
    }],
    
    // For assignment
    assignmentInstructions: String,
    assignmentRubric: String,
    assignmentDueDate: Date,
    
    // For exam
    examQuestions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      points: {
        type: Number,
        default: 1
      }
    }],
    examDuration: {
      type: Number, // duration in minutes
      default: 60
    },
    passingScore: {
      type: Number, // percentage
      default: 85
    }
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  completionTime: {
    type: Number, // estimated completion time in minutes
    default: 15
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', LessonSchema);