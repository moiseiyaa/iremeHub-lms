/**
 * MongoDB Connection Test Utility
 * 
 * This script helps diagnose MongoDB connection issues by testing multiple connection strings.
 * It will attempt to connect to different MongoDB endpoints and report which ones work.
 * 
 * Run with: npx ts-node scripts/fix-connection.ts
 */

import { testDatabaseConnections, updateEnvFile } from './utils';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test connection strings
const connectionStrings = [
  // Try environment variable first if available
  ...(process.env.MONGODB_URI ? [{
    name: 'Current Environment Connection',
    uri: process.env.MONGODB_URI
  }] : []),
  
  // Fallback option - Local MongoDB
  {
    name: 'Local MongoDB',
    uri: 'mongodb://localhost:27017/lms'
  }
];

// Main function
async function main() {
  console.log('MongoDB Connection Test Utility');
  console.log('===============================');
  
  console.log('Testing available MongoDB connections...');
  
  // Test all connection strings
  const workingConnection = await testDatabaseConnections(connectionStrings);
  
  if (workingConnection) {
    console.log(`\n✅ Found a working connection: ${workingConnection.name}`);
    
    // Update .env file with working connection
    updateEnvFile(workingConnection.uri);
    
    console.log('\n🎉 Connection fixed! You can now start your server normally.');
    console.log('   Run: npm run dev or npm start');
  } else {
    console.log('\n❌ No working connections found.');
    console.log('\nPossible solutions:');
    console.log('1. Check your internet connection');
    console.log('2. Install MongoDB locally (https://www.mongodb.com/try/download/community)');
    console.log('3. Create a new MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)');
    console.log('4. Check firewall settings and allow MongoDB connections');
    
    // Create .env with local MongoDB as a fallback
    console.log('\nCreating .env file with local MongoDB as fallback...');
    updateEnvFile('mongodb://localhost:27017/lms');
    console.log('Please install MongoDB locally or update the .env file with a valid connection string.');
  }
}

// Run the script
main().catch(console.error); 