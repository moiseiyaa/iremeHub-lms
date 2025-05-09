/**
 * MongoDB Connection Test Script
 * Run with: node test-db.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB URI from environment variable
const mongoURI = process.env.MONGODB_URI;

console.log('=== MongoDB Connection Test ===');

// Check if MongoDB URI is defined
if (!mongoURI) {
  console.error('❌ ERROR: MONGODB_URI not found in environment variables');
  console.log('Please check that your .env file includes the MONGODB_URI variable');
  process.exit(1);
}

// Display connection info
console.log(`MongoDB URI starts with: ${mongoURI.substring(0, 20)}...`);
console.log(`MongoDB URI length: ${mongoURI.length} characters`);

// Check the URI format
if (!mongoURI.startsWith('mongodb+srv://') && !mongoURI.startsWith('mongodb://')) {
  console.error('❌ ERROR: MongoDB URI format is invalid. Should start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

console.log('Attempting connection...');

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
};

// Test the connection
mongoose.connect(mongoURI, options)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test database operations
    try {
      // Get list of collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`Found ${collections.length} collections:`);
      collections.forEach(col => console.log(`- ${col.name}`));
      
      // Count documents in each collection
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`Collection "${col.name}" has ${count} documents`);
      }
      
      console.log('Database operations successful');
    } catch (err) {
      console.error('❌ Database operation failed:', err.message);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('Connection closed');
    }
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    
    // Provide specific guidance based on error message
    if (err.message.includes('ENOTFOUND')) {
      console.log('The hostname in your connection string could not be found.');
      console.log('Please verify the cluster name is correct.');
    } else if (err.message.includes('Authentication failed')) {
      console.log('Username or password is incorrect.');
      console.log('Please check your credentials in the connection string.');
    } else if (err.message.includes('timed out')) {
      console.log('Connection timed out. Possible reasons:');
      console.log('1. Your IP address is not whitelisted in MongoDB Atlas');
      console.log('2. Network connectivity issues or firewall blocking the connection');
      console.log('3. MongoDB Atlas might be experiencing issues');
    } else if (err.message.includes('not authorized')) {
      console.log('Your user does not have permission to access this database.');
      console.log('Check your user permissions in MongoDB Atlas.');
    }
    
    process.exit(1);
  }); 