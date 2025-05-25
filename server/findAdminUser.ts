import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User'; // Assuming User model is in models/User.ts

// Load environment variables
dotenv.config();

const findAdmin = async () => {
  let mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('MONGODB_URI is not defined in .env file. Using fallback: mongodb://localhost:27017/lms');
    mongoURI = 'mongodb://localhost:27017/lms';
  }

  console.log(`Connecting to MongoDB at ${mongoURI.substring(0, mongoURI.indexOf('@') > 0 ? mongoURI.indexOf('@') : 20)}...`);

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Short timeout for script
      connectTimeoutMS: 5000, // Short timeout for script
    } as mongoose.ConnectOptions);

    console.log('MongoDB Connected Successfully.');

    const adminUser = await User.findOne({ email: 'admin@example.com' });

    if (adminUser) {
      console.log('Admin user found:');
      console.log(JSON.stringify(adminUser.toObject(), null, 2));
      if (adminUser.role === 'admin') {
        console.log('User role is "admin".');
      } else {
        console.log(`User role is "${adminUser.role}", NOT "admin".`);
      }
    } else {
      console.log('Admin user with email "admin@example.com" NOT found.');
    }

  } catch (error: any) {
    console.error('Error during database operation:', error.message);
    if (error.name === 'MongoNetworkError' || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('Could not connect to MongoDB. Please ensure MongoDB is running and accessible.');
    } else if (error.name === 'MongooseServerSelectionError') {
        console.error('Mongoose server selection error. Check connection string and server status.');
        console.error('Details:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

findAdmin(); 