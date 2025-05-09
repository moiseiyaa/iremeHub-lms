/**
 * MongoDB Connection Test Utility
 * 
 * This script helps diagnose MongoDB connection issues by testing multiple connection strings.
 * It will attempt to connect to different MongoDB endpoints and report which ones work.
 * 
 * Run with: node fix-mongodb-connection.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connection options with increased timeouts
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
};

// Test connection strings
const connectionStrings = [
  {
    name: 'Original Atlas Connection',
    uri: 'mongodb+srv://iremehub:02.06.02@cluster0.ewfskt9.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0'
  },
  {
    name: 'Local MongoDB',
    uri: 'mongodb://localhost:27017/lms'
  },
  {
    name: 'MongoDB Atlas Free Tier (Demo)',
    uri: 'mongodb+srv://demo:ql0lm96vQpN0l52v@cluster0.mongodb.net/lms?retryWrites=true&w=majority'
  }
];

// Function to test a MongoDB connection
async function testConnection(name, uri) {
  console.log(`\nTesting connection to: ${name}`);
  
  try {
    // Close any existing connections first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Connect to MongoDB
    await mongoose.connect(uri, connectionOptions);
    
    console.log(`✅ SUCCESS: Connected to ${name}`);
    console.log(`   Database name: ${mongoose.connection.name}`);
    console.log(`   Server: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Test if we can perform a simple operation
    try {
      const ping = await mongoose.connection.db.admin().ping();
      console.log(`   Ping successful: ${JSON.stringify(ping)}`);
      
      const result = { success: true, name, uri };
      
      // Close connection
      await mongoose.connection.close();
      return result;
    } catch (dbError) {
      console.log(`⚠️ Connected but couldn't access database: ${dbError.message}`);
      
      // Close connection
      await mongoose.connection.close();
      return { success: false, name, uri, error: dbError.message };
    }
  } catch (error) {
    console.log(`❌ FAILED: Could not connect to ${name}`);
    console.log(`   Error: ${error.message}`);
    
    // Try to close connection if it exists
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } catch (e) {
      // Ignore errors when closing
    }
    
    return { success: false, name, uri, error: error.message };
  }
}

// Function to update .env file with working URI
async function updateEnvFile(workingUri) {
  const envPath = path.join(__dirname, '.env');
  
  try {
    let envContent = '';
    
    // Read existing .env if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace MONGODB_URI line if it exists
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(
          /MONGODB_URI=.*/,
          `MONGODB_URI=${workingUri}`
        );
      } else {
        // Add MONGODB_URI line if it doesn't exist
        envContent = `MONGODB_URI=${workingUri}\n${envContent}`;
      }
    } else {
      // Create basic .env content if file doesn't exist
      envContent = `# MongoDB Connection (auto-updated by fix script)
MONGODB_URI=${workingUri}

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
  } catch (error) {
    console.error(`\n❌ Failed to update .env file: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('MongoDB Connection Test Utility');
  console.log('===============================');
  
  const results = [];
  
  // Test all connection strings
  for (const conn of connectionStrings) {
    const result = await testConnection(conn.name, conn.uri);
    results.push(result);
  }
  
  // Find the first working connection
  const workingConnection = results.find(r => r.success);
  
  if (workingConnection) {
    console.log(`\n✅ Found a working connection: ${workingConnection.name}`);
    
    // Update .env file with working connection
    await updateEnvFile(workingConnection.uri);
    
    console.log('\n🎉 Connection fixed! You can now start your server normally.');
    console.log('   Run: npm run dev or node server.js');
  } else {
    console.log('\n❌ No working connections found.');
    console.log('\nPossible solutions:');
    console.log('1. Check your internet connection');
    console.log('2. Install MongoDB locally (https://www.mongodb.com/try/download/community)');
    console.log('3. Create a new MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)');
    console.log('4. Check firewall settings and allow MongoDB connections');
    
    // Create .env with local MongoDB as a fallback
    console.log('\nCreating .env file with local MongoDB as fallback...');
    await updateEnvFile('mongodb://localhost:27017/lms');
    console.log('Please install MongoDB locally or update the .env file with a valid connection string.');
  }
}

// Run the script
main().catch(console.error); 