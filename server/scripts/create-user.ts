/**
 * Simple script to create a test user in MongoDB Atlas
 * Run with: npx ts-node scripts/create-user.ts
 */

import connectDB from '../db';
import { createUser } from './utils';

// Main function
async function main() {
  console.log('User Creation Script');
  console.log('===================');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  // Create test user
  try {
    const user = await createUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    console.log('You can log in with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (err: any) {
    console.error('Error creating user:', err.message);
    process.exit(1);
  }
}

// Run the script
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 