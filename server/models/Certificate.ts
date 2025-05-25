import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { ICourse } from './Course';

interface ICertificateMetadata {
  courseCompletionDate?: Date;
  grade?: string;
  hoursCompleted?: number;
}

export interface ICertificate extends Document {
  user: mongoose.Types.ObjectId | IUser;
  course: mongoose.Types.ObjectId | ICourse;
  certificateId: string;
  issuedAt: Date;
  imageUrl?: string;
  templateUsed?: string;
  metadata: ICertificateMetadata;
  customFields?: Map<string, string>;
}

const CertificateSchema: Schema = new mongoose.Schema({
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
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  imageUrl: String,
  templateUsed: String,
  metadata: {
    courseCompletionDate: Date,
    grade: String,
    hoursCompleted: Number
  },
  customFields: {
    type: Map,
    of: String
  }
});

const Certificate: Model<ICertificate> = mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default Certificate;