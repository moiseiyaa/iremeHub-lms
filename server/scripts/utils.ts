/**
 * TypeScript Utilities for Server Management
 * These functions handle common tasks like database connection and user management
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { User } from '../models';

// Load environment variables
dotenv.config();

// Connection options with increased timeouts
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
};

/**
 * Connect to MongoDB database
 * @param uri Optional MongoDB connection URI (uses .env MONGODB_URI if not provided)
 */
export const connectToDatabase = async (uri?: string): Promise<boolean> => {
  try {
    const connectionUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(connectionUri);
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`Database connection error: ${error.message}`);
    return false;
  }
};

/**
 * Create a test/demo user in the database
 * @param userData User data to create
 */
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'educator' | 'admin';
}): Promise<any> => {
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log(`User already exists: ${userData.email}`);
      return existingUser;
    }
    
    // Create new user
    const user = await User.create(userData);
    
    console.log(`User created: ${user.name} (${user.email})`);
    return user;
  } catch (error: any) {
    console.error(`Error creating user: ${error.message}`);
    throw error;
  }
};

/**
 * Reset password for specified user emails
 * @param emails Array of email addresses to reset passwords for
 * @param newPassword New password to set
 */
export const resetPasswords = async (
  emails: string[],
  newPassword: string = 'password123'
): Promise<number> => {
  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update passwords directly in the database
    const result = await User.updateMany(
      { email: { $in: emails } },
      { $set: { password: newHashedPassword } }
    );
    
    return result.modifiedCount;
  } catch (error: any) {
    console.error(`Error resetting passwords: ${error.message}`);
    throw error;
  }
};

/**
 * Test multiple database connections and update .env file
 * @param connectionStrings Array of connection strings to test
 */
export const testDatabaseConnections = async (
  connectionStrings: Array<{ name: string; uri: string }>
): Promise<{ success: boolean; name: string; uri: string; error?: string } | null> => {
  const results = [];
  
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Test each connection
  for (const conn of connectionStrings) {
    console.log(`\nTesting connection to: ${conn.name}`);
    
    try {
      await mongoose.connect(conn.uri);
      
      console.log(`✅ SUCCESS: Connected to ${conn.name}`);
      
      // Test if we can perform a simple operation
      try {
        await mongoose.connection.db.admin().ping();
        await mongoose.connection.close();
        
        results.push({
          success: true,
          name: conn.name,
          uri: conn.uri
        });
      } catch (dbError: any) {
        console.log(`⚠️ Connected but couldn't access database: ${dbError.message}`);
        await mongoose.connection.close();
        
        results.push({
          success: false,
          name: conn.name,
          uri: conn.uri,
          error: dbError.message
        });
      }
    } catch (error: any) {
      console.log(`❌ FAILED: Could not connect to ${conn.name}`);
      console.log(`   Error: ${error.message}`);
      
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      
      results.push({
        success: false,
        name: conn.name,
        uri: conn.uri,
        error: error.message
      });
    }
  }
  
  // Find first working connection
  return results.find(r => r.success) || null;
};

/**
 * Update .env file with the specified MongoDB URI
 * @param uri MongoDB connection URI
 */
export const updateEnvFile = (uri: string): boolean => {
  const envPath = path.join(__dirname, '../.env');
  
  try {
    let envContent = '';
    
    // Read existing .env if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace MONGODB_URI line if it exists
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(
          /MONGODB_URI=.*/,
          `MONGODB_URI=${uri}`
        );
      } else {
        // Add MONGODB_URI line if it doesn't exist
        envContent = `MONGODB_URI=${uri}\n${envContent}`;
      }
    } else {
      // Create basic .env content if file doesn't exist
      envContent = `# MongoDB Connection (auto-updated by fix script)
MONGODB_URI=${uri}

# JWT
JWT_SECRET=iremehub_secure_jwt_secret_key_2023
JWT_EXPIRE=30m

# Server
PORT=5000
NODE_ENV=development`;
    }
    
    // Write updated content to .env
    fs.writeFileSync(envPath, envContent);
    console.log(`\n✅ Updated .env file with working connection string`);
    
    return true;
  } catch (error: any) {
    console.error(`\n❌ Failed to update .env file: ${error.message}`);
    return false;
  }
}; 