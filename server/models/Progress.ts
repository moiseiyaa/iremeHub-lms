import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { ICourse } from './Course';
import { ILesson } from './Lesson';

interface IQuizAnswer {
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
  points: number;
}

interface IQuizResult {
  lesson: mongoose.Types.ObjectId | ILesson;
  score: number;
  totalQuestions: number;
  answers: IQuizAnswer[];
  attempts: number;
  completedAt: Date;
}

interface ISubmissionFile {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

interface IAssignmentSubmission {
  lesson: mongoose.Types.ObjectId | ILesson;
  submissionText?: string;
  submissionFiles?: ISubmissionFile[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  graded: boolean;
  gradedAt?: Date;
}

interface IExamResult {
  lesson: mongoose.Types.ObjectId | ILesson;
  score: number;
  totalPoints: number;
  percentageScore: number;
  passed: boolean;
  answers: IQuizAnswer[];
  startedAt?: Date;
  completedAt: Date;
  timeSpent?: number; // in minutes
}

interface IExamSession {
  lesson: mongoose.Types.ObjectId;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date;
}

interface ICertificate {
  issued: boolean;
  issuedAt?: Date;
  certificateId?: string;
  certificateUrl?: string;
}

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId | IUser;
  course: mongoose.Types.ObjectId | ICourse;
  status: 'pending' | 'active' | 'completed' | 'rejected' | 'cancelled';
  completedLessons: mongoose.Types.ObjectId[] | ILesson[];
  quizResults: IQuizResult[];
  assignmentSubmissions: IAssignmentSubmission[];
  examResults: IExamResult[];
  examSessions: IExamSession[];
  totalPoints: number;
  lastAccessed: Date;
  completed: boolean;
  completedAt?: Date;
  certificate: ICertificate;
  createdAt: Date;
  updatedAt: Date;
  progressPercentage: number; // Virtual
}

// Defense in depth: raw grading answers remain available for server-side
// evaluation but are excluded from standard JSON and plain-object responses.
const hideGradingAnswers = (_doc: unknown, value: Record<string, unknown>) => {
  for (const field of ['quizResults', 'examResults']) {
    const rows = value[field];
    if (!Array.isArray(rows)) continue;
    value[field] = rows.map(row => {
      if (!row || typeof row !== 'object') return row;
      const clone = { ...row };
      delete clone.answers;
      return clone;
    });
  }
  return value;
};

const ProgressSchema: Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  quizResults: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
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
  examSessions: [{
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    submittedAt: Date
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
}, {
  toJSON: { virtuals: true, transform: hideGradingAnswers },
  toObject: { virtuals: true, transform: hideGradingAnswers },
  timestamps: true
});

// Virtual for progress percentage
ProgressSchema.virtual('progressPercentage').get(function(this: IProgress) {
  // Need to ensure totalLessons is defined or use a fallback
  const totalLessons = (this as any).totalLessons || 1; // Cast to any to avoid TypeScript errors
  return this.completedLessons.length / totalLessons * 100;
});

const Progress: Model<IProgress> = mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress; 