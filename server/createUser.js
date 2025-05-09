/**
 * Simple script to create a test user in MongoDB Atlas
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection URI (hardcoded for reliability)
const MONGODB_URI = 'mongodb+srv://iremehub:02.06.02@cluster0.ewfskt9.mongodb.net/lms?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000
})
.then(() => console.log('MongoDB connected...'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error('Please check your MongoDB Atlas credentials and network connection');
  console.error('Make sure your IP address is whitelisted in MongoDB Atlas');
  process.exit(1);
});

// Create User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'educator', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password middleware
UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create model
const User = mongoose.model('User', UserSchema);

// Create test user
const createUser = async () => {
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('User already exists');
      process.exit(0);
    }
    
    // Create new user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    console.log(`User created: ${user.name} (${user.email})`);
    console.log('You can log in with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err.message);
    process.exit(1);
  }
};

// Run the function
createUser(); 