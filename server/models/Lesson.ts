import mongoose, { Document, Schema, Model } from 'mongoose';
import { ICourse } from './Course';

// Forward declaration of ISection to resolve circular dependency
export interface ISection extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  course: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  // Omitting lessons property to avoid circular reference
}

// Interface for Quiz/Exam questions
interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

// Interface for lesson content types
interface ILessonContent {
  // For video
  videoUrl?: string;
  videoDuration?: number;
  videoPublicId?: string;
  
  // For text
  textContent?: string;
  
  // For YouTube
  youtubeUrl?: string;
  youtubeVideoId?: string;
  
  // For quiz
  quizQuestions?: IQuestion[];
  
  // For assignment
  assignmentInstructions?: string;
  assignmentRubric?: string;
  assignmentDueDate?: Date;
  
  // For exam
  examQuestions?: IQuestion[];
  examDuration?: number;
  passingScore?: number;
}

export interface ILesson extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId | ICourse;
  section?: mongoose.Types.ObjectId | ISection;
  contentType: 'video' | 'text' | 'quiz' | 'youtube' | 'assignment' | 'exam';
  content: ILessonContent;
  isPreview: boolean;
  order: number;
  completionTime: number;
  createdAt: Date;
}

const LessonSchema: Schema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
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

const Lesson: Model<ILesson> = mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson; 