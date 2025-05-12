/**
 * API Testing Script
 * 
 * This script tests key API endpoints to verify database connectivity and functionality
 * Run with: node scripts/test-api.js
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const readline = require('readline');

// Test configuration
const config = {
  baseUrl: `http://localhost:${process.env.PORT || 5000}/api/v1`,
  timeout: 5000,
  credentials: {
    admin: {
      email: 'admin@example.com',
      password: 'Admin123!'
    },
    educator: {
      email: 'educator@example.com',
      password: 'Educator123!'
    },
    student: {
      email: 'student@example.com',
      password: 'Student123!'
    }
  }
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// HTTP client for API requests
const apiClient = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store tokens for authenticated requests
const tokens = {};

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Run a test and track results
const runTest = async (name, testFn) => {
  console.log(`\n⏳ Testing: ${name}`);
  testResults.tests.push({ name, status: 'running' });
  const testIndex = testResults.tests.length - 1;
  
  try {
    const startTime = Date.now();
    await testFn();
    const duration = Date.now() - startTime;
    
    console.log(`✅ Passed: ${name} (${duration}ms)`);
    testResults.passed++;
    testResults.tests[testIndex].status = 'passed';
    testResults.tests[testIndex].duration = duration;
    return true;
  } catch (error) {
    const errorMsg = error.response ? 
      `${error.response.status} ${error.response.statusText}: ${JSON.stringify(error.response.data)}` : 
      error.message;
    
    console.log(`❌ Failed: ${name}\n   Error: ${errorMsg}`);
    testResults.failed++;
    testResults.tests[testIndex].status = 'failed';
    testResults.tests[testIndex].error = errorMsg;
    return false;
  }
};

// Skip a test and track results
const skipTest = (name, reason) => {
  console.log(`⏭️ Skipped: ${name}\n   Reason: ${reason}`);
  testResults.skipped++;
  testResults.tests.push({ name, status: 'skipped', reason });
};

// Test API server connection
const testServerConnection = async () => {
  const response = await apiClient.get('/');
  console.log(`Server response: ${response.data}`);
  
  return true;
};

// Test health endpoint
const testHealthEndpoint = async () => {
  const response = await apiClient.get('/health');
  console.log(JSON.stringify(response.data, null, 2));
  
  if (response.data.dbStatus !== 'connected') {
    throw new Error(`Database is not connected: ${response.data.dbStatus}`);
  }
  
  return true;
};

// Test user authentication
const testAuthentication = async (role = 'admin') => {
  const credentials = config.credentials[role];
  
  if (!credentials) {
    throw new Error(`Unknown role: ${role}`);
  }
  
  console.log(`Attempting to login as ${role} (${credentials.email})`);
  const response = await apiClient.post('/auth/login', credentials);
  
  if (!response.data.token) {
    throw new Error('No token received in response');
  }
  
  tokens[role] = response.data.token;
  console.log(`${role} token received`);
  
  // Test getting user profile with token
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokens[role]}`;
  const profileResponse = await apiClient.get('/auth/me');
  
  console.log(`Profile response for ${role}:`);
  console.log(JSON.stringify(profileResponse.data, null, 2));
  
  return true;
};

// Test course endpoints
const testCourseEndpoints = async () => {
  // Get all courses
  console.log('Fetching all courses...');
  const coursesResponse = await apiClient.get('/courses');
  
  if (!coursesResponse.data.data || !Array.isArray(coursesResponse.data.data)) {
    throw new Error('Invalid courses response format');
  }
  
  if (coursesResponse.data.data.length === 0) {
    console.log('No courses found. Consider running the seed script.');
  } else {
    // Get a specific course
    const courseId = coursesResponse.data.data[0]._id;
    console.log(`Fetching details for course ID: ${courseId}`);
    
    const courseResponse = await apiClient.get(`/courses/${courseId}`);
    console.log(JSON.stringify(courseResponse.data, null, 2));
  }
  
  return true;
};

// Test database connection directly
const testDatabaseConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    console.log(`Checking MongoDB connection: ${mongoURI.substring(0, mongoURI.indexOf('@') > 0 ? mongoURI.indexOf('@') : 20)}...`);
    
    await mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`✅ Direct MongoDB connection successful`);
    console.log(`Connected to database: ${mongoose.connection.name}`);
    
    // Count documents in collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
    
    // Close connection
    await mongoose.connection.close();
    return true;
    
  } catch (error) {
    console.log(`❌ Direct MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  console.log('🧪 API Testing Script');
  console.log('==================');
  console.log(`Base URL: ${config.baseUrl}`);
  
  try {
    // First check direct database connection
    const dbConnected = await runTest('Direct database connection', testDatabaseConnection);
    
    if (!dbConnected) {
      const continueTests = await question('Database connection failed. Continue with API tests anyway? (y/n): ');
      if (continueTests.toLowerCase() !== 'y') {
        console.log('Aborting tests.');
        rl.close();
        return;
      }
    }
    
    // API Tests
    const serverRunning = await runTest('Server connection', testServerConnection);
    
    if (serverRunning) {
      await runTest('Health endpoint', testHealthEndpoint);
      
      // Authentication tests
      const adminAuthSuccess = await runTest('Admin authentication', () => testAuthentication('admin'));
      
      if (adminAuthSuccess) {
        await runTest('Educator authentication', () => testAuthentication('educator'));
        await runTest('Student authentication', () => testAuthentication('student'));
        
        // Course tests
        await runTest('Course endpoints', testCourseEndpoints);
      } else {
        skipTest('Educator authentication', 'Admin authentication failed');
        skipTest('Student authentication', 'Admin authentication failed');
        skipTest('Course endpoints', 'Authentication failed');
      }
    } else {
      skipTest('Health endpoint', 'Server not running');
      skipTest('Authentication tests', 'Server not running');
      skipTest('Course endpoints', 'Server not running');
    }
    
  } catch (error) {
    console.log(`Error running tests: ${error.message}`);
  } finally {
    // Print test summary
    console.log('\n📊 Test Summary');
    console.log('=============');
    console.log(`Total tests: ${testResults.passed + testResults.failed + testResults.skipped}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Skipped: ${testResults.skipped}`);
    
    rl.close();
  }
};

// Run the tests
runTests().catch(error => {
  console.error(`Script error: ${error.message}`);
  rl.close();
}); 