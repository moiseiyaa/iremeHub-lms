import mongoose, { Document, Schema, Model } from 'mongoose';
import { ICourse } from './Course';
import { ILesson } from './Lesson';

export interface ISection extends Document {
  title: string;
  description?: string;
  course: mongoose.Types.ObjectId | ICourse;
  order: number;
  createdAt: Date;
  lessons?: ILesson[];
}

const SectionSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a section title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for lessons in this section
SectionSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'section',
  justOne: false
});

const Section: Model<ISection> = mongoose.model<ISection>('Section', SectionSchema);

export default Section;