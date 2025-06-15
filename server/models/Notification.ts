import mongoose, { Document, Schema, model } from 'mongoose';
import { IUser } from './User';

export interface INotification extends Document {
  user: IUser['_id'];
  message: string;
  read: boolean;
  link: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    trim: true,
    maxlength: [200, 'Message can not be more than 200 characters'],
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = model<INotification>('Notification', NotificationSchema);
