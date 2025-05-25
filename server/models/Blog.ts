import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import slugify from 'slugify';

export interface IBlog extends mongoose.Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    public_id?: string;
  };
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  comments: Array<{
    user: mongoose.Types.ObjectId;
    name: string;
    comment: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
      type: String,
      unique: true
    },
    content: {
      type: String,
      required: [true, 'Please add content']
    },
    excerpt: {
      type: String,
      required: [true, 'Please add an excerpt'],
      maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    featuredImage: {
      url: {
        type: String
      },
      public_id: {
        type: String
      }
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category']
    },
    tags: {
      type: [String],
      default: []
    },
    likes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        comment: String,
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create slug from title before saving
BlogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true
    });
  }
  next();
});

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema); 