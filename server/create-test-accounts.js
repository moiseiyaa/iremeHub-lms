/**
 * Test Account Creation Script
 * 
 * This script creates test accounts for the LMS platform:
 * - Administrator account
 * - Educator account
 * - Student account
 * 
 * Run with: node create-test-accounts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const colors = require('colors');

// Models
let User, Course;

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    
    // Import models after connection to avoid model compilation errors
    User = require('./models/User');
    Course = require('./models/Course');
    
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    return false;
  }
}

async function createUsers() {
  try {
    // Check if users already exist
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    const educatorExists = await User.findOne({ email: 'educator@example.com' });
    const studentExists = await User.findOne({ email: 'student@example.com' });
    
    // Hash password once
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create users if they don't exist
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
        bio: 'System administrator with full access'
      });
      
      console.log(`Admin user created: ${admin.email}`.green);
    } else {
      console.log('Admin user already exists'.yellow);
    }
    
    if (!educatorExists) {
      const educator = await User.create({
        name: 'Educator User',
        email: 'educator@example.com',
        password: hashedPassword,
        role: 'educator',
        avatar: 'https://ui-avatars.com/api/?name=Educator+User&background=random',
        bio: 'Experienced educator with multiple courses',
        expertiseAreas: ['Web Development', 'Programming', 'Design']
      });
      
      console.log(`Educator user created: ${educator.email}`.green);
    } else {
      console.log('Educator user already exists'.yellow);
    }
    
    if (!studentExists) {
      const student = await User.create({
        name: 'Student User',
        email: 'student@example.com',
        password: hashedPassword,
        role: 'student',
        avatar: 'https://ui-avatars.com/api/?name=Student+User&background=random',
        bio: 'Eager learner exploring new topics'
      });
      
      console.log(`Student user created: ${student.email}`.green);
    } else {
      console.log('Student user already exists'.yellow);
    }
    
    console.log('\nAll test users created successfully!'.green.bold);
    console.log('\nLogin credentials for all users:'.cyan);
    console.log('- Email: admin@example.com, educator@example.com, or student@example.com'.cyan);
    console.log('- Password: password123'.cyan);
    
    return true;
  } catch (error) {
    console.error(`Error creating users: ${error.message}`.red);
    return false;
  }
}

async function main() {
  console.log('\n=== Test Account Creation ===\n'.blue.bold);
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to database. Exiting...'.red.bold);
    process.exit(1);
  }
  
  // Create test users
  await createUsers();
  
  // Disconnect from database
  await mongoose.disconnect();
  console.log('\nDatabase connection closed'.gray);
}

// Run the script
main().catch(err => {
  console.error(`Unhandled error: ${err.message}`.red.bold);
  process.exit(1);
}); 