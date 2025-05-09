const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'AI',
      'Business',
      'Marketing',
      'IT & Software',
      'Personal Development',
      'Design',
      'Photography',
      'Music',
      'Other'
    ]
  },
  level: {
    type: String,
    required: [true, 'Please add a level'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/sample/default-course.jpg'
    }
  },
  certificateTemplate: {
    public_id: String,
    url: String
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  ratings: [{
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to create slug from title
CourseSchema.pre('save', function(next) {
  // Only generate slug if title is modified or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    
    // Add a timestamp to make slug unique
    if (this.isNew) {
      this.slug = `${this.slug}-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Virtual for average rating
CourseSchema.virtual('averageRating').get(function() {
  if (!this.ratings || !Array.isArray(this.ratings) || this.ratings.length === 0) {
    return 0;
  }
  
  const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual for total students
CourseSchema.virtual('studentsCount').get(function() {
  return this.enrolledStudents && Array.isArray(this.enrolledStudents) ? this.enrolledStudents.length : 0;
});

module.exports = mongoose.model('Course', CourseSchema);