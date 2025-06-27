import mongoose, { Document, Schema } from 'mongoose';

export interface EnrollmentRequestDocument extends Document {
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const EnrollmentRequestSchema = new Schema<EnrollmentRequestDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

EnrollmentRequestSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.EnrollmentRequest ||
  mongoose.model<EnrollmentRequestDocument>('EnrollmentRequest', EnrollmentRequestSchema);
