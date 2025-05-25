import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { ICourse } from './Course';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  educator: mongoose.Types.ObjectId | IUser;
  courseId: mongoose.Types.ObjectId | ICourse | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true,
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  published: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set updatedAt before update
AnnouncementSchema.pre('save', function(this: IAnnouncement, next) {
  this.updatedAt = new Date();
  next();
});

const Announcement: Model<IAnnouncement> = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement; 