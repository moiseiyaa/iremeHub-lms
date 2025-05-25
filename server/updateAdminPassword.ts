import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User'; // Assuming User model is in models/User.ts
import bcrypt from 'bcryptjs'; // For hashing the new password

// Load environment variables
dotenv.config();

const NEW_ADMIN_PASSWORD = 'newadminpassword123'; // Choose a strong password

const updateAdminPassword = async () => {
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
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    } as mongoose.ConnectOptions);

    console.log('MongoDB Connected Successfully.');

    const adminEmail = 'admin@example.com';
    const user = await User.findOne({ email: adminEmail });

    if (user) {
      console.log(`Found user: ${user.email}`);
      // Directly set the password. The 'save' hook in User.ts should handle hashing.
      user.password = NEW_ADMIN_PASSWORD;
      await user.save();
      console.log(`Password for ${user.email} has been updated to: ${NEW_ADMIN_PASSWORD}`);
      console.log('Please try logging in with the new password.');
    } else {
      console.log(`User with email "${adminEmail}" NOT found. Cannot update password.`);
    }

  } catch (error: any) {
    console.error('Error during password update operation:', error.message);
    if (error.name === 'MongoNetworkError' || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('Could not connect to MongoDB. Please ensure MongoDB is running and accessible.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

updateAdminPassword(); 