import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// User interface
export interface IUser extends Document {
  name: string;
  email: string;
  role: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  sessionVersion: number;
  avatar?: {
    public_id?: string;
    url: string;
  };
  bio?: string;
  enrolledCourses?: mongoose.Types.ObjectId[];
  createdCourses?: mongoose.Types.ObjectId[];
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
}

// User schema
const UserSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['student', 'educator', 'admin'],
    default: 'student'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false
  },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  // Incremented on logout and credential changes to revoke prior tokens.
  sessionVersion: { type: Number, default: 0, min: 0, select: false },
  createdAt: {
    type: Date,
    default: Date.now
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/sample/default-avatar.jpg'
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(this: IUser): string {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined. Please set it in your environment variables.');
      throw new Error('JWT_SECRET is not defined');
    }
    // @ts-ignore - Ignoring TypeScript error for jwt.sign
    const token = jwt.sign(
      { id: this._id, sv: this.sessionVersion ?? 0 },
      secret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    if (!token) {
      console.error('jwt.sign returned undefined or null');
      throw new Error('Token generation failed');
    }
    return token;
  } catch (error: any) {
    console.error('Error in getSignedJwtToken:', error.message);
    // Re-throw the error to be caught by the controller or global error handler
    // Or, to prevent HTML error page, return a specific error that can be handled
    throw new Error('Token generation failed');
  }
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(this: IUser, enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function(this: IUser): string {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User; 