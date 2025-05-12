/**
 * MongoDB Connection Test Utility
 * 
 * This script tests MongoDB connection with detailed diagnostics
 * Run with: node scripts/test-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const { exec } = require('child_process');

console.log('🔍 MongoDB Connection Diagnostics Tool');
console.log('======================================');

// Function to run a ping command
const pingHost = (host) => {
  return new Promise((resolve) => {
    exec(`ping ${process.platform === 'win32' ? '-n 3' : '-c 3'} ${host}`, (error, stdout) => {
      if (error) {
        resolve({ success: false, output: error.message });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
};

// Function to test DNS resolution
const testDns = async (host) => {
  try {
    console.log(`\nAttempting DNS lookup for: ${host}`);
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve(host, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log(`✅ DNS Resolution successful: ${addresses.join(', ')}`);
    return { success: true, addresses };
  } catch (error) {
    console.log(`❌ DNS Resolution failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Extract connection string from environment or use defaults
const getConnectionOptions = () => {
  const mongoURI = process.env.MONGODB_URI;
  console.log('\nConnection Configuration:');
  
  if (!mongoURI) {
    console.log('❌ MONGODB_URI is not defined in .env file');
    return [
      { 
        name: 'Local MongoDB Default', 
        uri: 'mongodb://localhost:27017/lms',
        host: 'localhost'
      },
      {
        name: 'MongoDB Atlas (from fix-mongodb-connection.js)',
        uri: 'mongodb+srv://iremehub:02.06.02@cluster0.ewfskt9.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0',
        host: 'cluster0.ewfskt9.mongodb.net'
      }
    ];
  }
  
  try {
    // Parse MongoDB URI - safely handle both standard and SRV format
    let host = '';
    if (mongoURI.includes('@')) {
      // Extract host from connection string with username/password
      host = mongoURI.split('@')[1].split('/')[0];
      if (host.includes(':')) {
        host = host.split(':')[0]; // Remove port if present
      }
    } else if (mongoURI.includes('localhost')) {
      host = 'localhost';
    }
    
    console.log(`- Connection String: ${mongoURI.substring(0, mongoURI.indexOf('@') > 0 ? mongoURI.indexOf('@') : 20)}...`);
    console.log(`- Host: ${host}`);
    
    return [
      {
        name: 'Primary Connection (from .env)',
        uri: mongoURI,
        host
      },
      { 
        name: 'Fallback - Local MongoDB', 
        uri: 'mongodb://localhost:27017/lms',
        host: 'localhost'
      }
    ];
  } catch (error) {
    console.log(`❌ Error parsing MongoDB URI: ${error.message}`);
    return [{ 
      name: 'Local MongoDB (Fallback)', 
      uri: 'mongodb://localhost:27017/lms',
      host: 'localhost'
    }];
  }
};

// Test MongoDB connection
const testConnection = async (name, uri) => {
  console.log(`\n📡 Testing connection to: ${name}`);
  
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    family: 4 // Force IPv4
  };
  
  try {
    // Close any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Connect to MongoDB
    const startTime = Date.now();
    await mongoose.connect(uri, connectionOptions);
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ CONNECTION SUCCESSFUL (${connectionTime}ms)`);
    console.log(`- MongoDB version: ${mongoose.connection.db.serverConfig.s.options.serverApi?.version || 'unknown'}`);
    console.log(`- Database name: ${mongoose.connection.db.databaseName}`);
    
    // Test database operations
    try {
      // Get list of collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`- Collections found: ${collections.length}`);
      
      if (collections.length > 0) {
        console.log('- Collections: ' + collections.map(c => c.name).join(', '));
        
        // Sample one collection to check document count
        const sampleCollection = collections[0].name;
        const count = await mongoose.connection.db.collection(sampleCollection).countDocuments();
        console.log(`- Collection "${sampleCollection}" has ${count} documents`);
      }
      
      // Ping database
      const pingResult = await mongoose.connection.db.admin().ping();
      console.log(`- Ping result: ${JSON.stringify(pingResult)}`);
    } catch (opError) {
      console.log(`- Database operations failed: ${opError.message}`);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('- Connection closed properly');
    
    return { success: true, name, uri };
  } catch (error) {
    console.log(`❌ CONNECTION FAILED: ${error.message}`);
    
    // Additional error diagnostics
    if (error.message.includes('ENOTFOUND')) {
      console.log('- Error type: Host not found (DNS resolution failed)');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('- Error type: Connection timeout');
    } else if (error.message.includes('Authentication failed')) {
      console.log('- Error type: Authentication failed (check username/password)');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('- Error type: Connection refused (server not running or firewall issue)');
    }
    
    // Close connection if it's still open
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } catch (e) {
      // Ignore errors on close
    }
    
    return { success: false, name, uri, error: error.message };
  }
};

// Main function
const main = async () => {
  try {
    // Get connection options
    const connectionOptions = getConnectionOptions();
    
    // System network check
    console.log('\n🌐 Network Configuration Check:');
    console.log(`- Platform: ${process.platform}`);
    console.log(`- Node.js version: ${process.version}`);
    console.log(`- Current working directory: ${process.cwd()}`);
    
    // Basic internet check - ping dns server
    const googleDns = await pingHost('8.8.8.8');
    console.log(`- Internet connectivity: ${googleDns.success ? '✅ Available' : '❌ Limited or unavailable'}`);
    
    // DNS checks for MongoDB hosts
    const dnsResults = [];
    for (const option of connectionOptions) {
      if (option.host && option.host !== 'localhost') {
        const dnsResult = await testDns(option.host);
        dnsResults.push({ host: option.host, result: dnsResult });
      }
    }
    
    // Test all connections
    let foundWorkingConnection = false;
    for (const option of connectionOptions) {
      const result = await testConnection(option.name, option.uri);
      if (result.success) {
        foundWorkingConnection = true;
        console.log(`\n✅ SUCCESS: Found working connection to ${option.name}`);
        console.log(`Connection string: ${option.uri.substring(0, option.uri.indexOf('@') > 0 ? option.uri.indexOf('@') : 20)}...`);
        
        // Suggest updating .env if this wasn't the primary connection
        if (option.name !== 'Primary Connection (from .env)') {
          console.log('\nRECOMMENDATION: Update your .env file with this working connection string.');
          console.log(`MONGODB_URI=${option.uri}`);
        }
        
        break;
      }
    }
    
    if (!foundWorkingConnection) {
      console.log('\n❌ All connection attempts failed.');
      console.log('\nTROUBLESHOOTING STEPS:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas IP whitelist settings (add 0.0.0.0/0 for testing)');
      console.log('3. Check username and password in connection string');
      console.log('4. For local MongoDB, ensure the service is running:');
      console.log('   - Windows: net start MongoDB');
      console.log('   - Linux/macOS: sudo systemctl start mongod');
      console.log('5. Check for firewall or network restrictions');
    }
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    // Ensure we exit the process
    process.exit(0);
  }
};

// Run the main function
main(); 