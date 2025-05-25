import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { ICourse } from './Course';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId | IUser;
  course: mongoose.Types.ObjectId | ICourse;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed';
  paymentMethod: string;
  stripePaymentId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
}

const PaymentSchema: Schema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  stripePaymentId: String,
  stripeCustomerId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment; 