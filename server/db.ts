import mongoose from 'mongoose';

/**
 * Establish the one required MongoDB connection.
 * A missing or unreachable database must abort application startup.
 * Credentials and connection strings must never be logged or written to disk.
 */
const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required for server startup.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
    });
    console.log('MongoDB connection established.');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error instanceof Error ? error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g, '[redacted connection]') : 'Unknown database error');
    return false;
  }
};

export default connectDB;
