/**
 * Database Seeding Script
 * 
 * Populates the MongoDB database with sample data for testing and development
 * Run with: node scripts/seed-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    name: 'Educator Smith',
    email: 'educator@example.com',
    password: 'Educator123!',
    role: 'educator',
    bio: 'Experienced educator with 10+ years in web development teaching.'
  },
  {
    name: 'Student Jones',
    email: 'student@example.com',
    password: 'Student123!',
    role: 'student',
    bio: 'Eager learner trying to master web development.'
  }
];

const sampleCourses = [
  {
    title: 'Introduction to Web Development',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
    category: 'Web Development',
    level: 'Beginner',
    price: 0,
    isPublished: true
  },
  {
    title: 'Advanced React Programming',
    description: 'Master React, Redux, and Next.js for building professional web applications.',
    category: 'Web Development',
    level: 'Advanced',
    price: 49.99,
    isPublished: true
  },
  {
    title: 'Mobile App Development with React Native',
    description: 'Create cross-platform mobile apps with React Native and JavaScript.',
    category: 'Mobile Development',
    level: 'Intermediate',
    price: 39.99,
    isPublished: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    
    console.log(`Connecting to MongoDB: ${mongoURI.substring(0, mongoURI.indexOf('@') > 0 ? mongoURI.indexOf('@') : 20)}...`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Create user model schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'educator', 'admin'],
    default: 'student'
  },
  bio: String,
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create course model schema
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
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed database
const seedDatabase = async () => {
  try {
    // Define models
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    
    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    
    for (const user of sampleUsers) {
      const hashedPassword = await hashPassword(user.password);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      // Don't include password in the returned user object
      const userWithoutPassword = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        bio: newUser.bio
      };
      
      createdUsers.push(userWithoutPassword);
    }
    
    // Find educator user
    const educator = createdUsers.find(user => user.role === 'educator');
    
    // Create courses
    console.log('Creating courses...');
    const createdCourses = [];
    
    for (const course of sampleCourses) {
      const slug = generateSlug(course.title);
      
      const newCourse = await Course.create({
        ...course,
        slug,
        instructor: educator._id
      });
      
      createdCourses.push(newCourse);
    }
    
    // Update educator with created courses
    await User.findByIdAndUpdate(
      educator._id,
      { $push: { createdCourses: { $each: createdCourses.map(course => course._id) } } }
    );
    
    // Enroll student in first course
    const student = createdUsers.find(user => user.role === 'student');
    
    await User.findByIdAndUpdate(
      student._id,
      { $push: { enrolledCourses: createdCourses[0]._id } }
    );
    
    // Update course with enrolled student
    await Course.findByIdAndUpdate(
      createdCourses[0]._id,
      { $push: { enrolledStudents: student._id } }
    );
    
    console.log('✅ Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdCourses.length} courses`);
    
    // Print out credentials for testing
    console.log('\nAccess Credentials:');
    for (const user of sampleUsers) {
      console.log(`- ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}: ${user.email} / ${user.password}`);
    }
    
    return { users: createdUsers, courses: createdCourses };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectDB();
    
    if (!connected) {
      console.error('Failed to connect to MongoDB. Database seeding aborted.');
      process.exit(1);
    }
    
    // Seed database
    await seedDatabase();
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    // Exit process
    process.exit(0);
  }
};

// Run main function
main(); 