/**
 * Client-side API Connection Test
 * 
 * This script tests the connection between the client and server API,
 * verifying that the database is properly connected
 * 
 * Run with: node client/scripts/test-api-connection.js
 */

import fetch from 'node-fetch';
import readline from 'readline';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Default configuration
const DEFAULT_CONFIG = {
  serverUrl: 'http://localhost:5000/api/v1',
  productionUrl: 'https://iremehub-server.vercel.app/api/v1'
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  endpoints: {}
};

// Test an API endpoint
const testEndpoint = async (url, name, options = {}) => {
  console.log(`\n⏳ Testing ${name}...`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`✅ ${name} - Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
    
    testResults.passed++;
    testResults.endpoints[name] = {
      status: 'passed',
      statusCode: response.status,
      data
    };
    
    return { success: true, data };
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    
    testResults.failed++;
    testResults.endpoints[name] = {
      status: 'failed',
      error: error.message
    };
    
    return { success: false, error };
  }
};

// Main test function
const runTests = async () => {
  console.log('🔄 API Connection Test');
  console.log('===================');
  
  // Ask which environment to test
  const env = await question('Which environment do you want to test? (local/production): ');
  
  // Set base URL based on environment
  const baseUrl = env.toLowerCase() === 'production' ? 
    DEFAULT_CONFIG.productionUrl : 
    DEFAULT_CONFIG.serverUrl;
  
  console.log(`\nUsing API base URL: ${baseUrl}`);
  
  // 1. Test base API endpoint
  await testEndpoint(`${baseUrl}/`, 'Base API');
  
  // 2. Test health endpoint
  const healthResult = await testEndpoint(`${baseUrl}/health`, 'Health Check');
  
  if (healthResult.success) {
    // Check if database is connected
    const dbStatus = healthResult.data.dbStatus;
    
    if (dbStatus === 'connected') {
      console.log(`\n✅ Database is connected successfully! (${healthResult.data.dbName})`);
    } else {
      console.log(`\n❌ Database is not connected properly. Status: ${dbStatus}`);
    }
  }
  
  // 3. Test courses endpoint
  await testEndpoint(`${baseUrl}/courses`, 'Courses API');
  
  // 4. Ask if user wants to test authentication
  const testAuth = await question('\nTest authentication? (y/n): ');
  
  if (testAuth.toLowerCase() === 'y') {
    // Credentials
    const email = await question('Email (default: admin@example.com): ') || 'admin@example.com';
    const password = await question('Password (default: Admin123!): ') || 'Admin123!';
    
    // Test login
    const loginResult = await testEndpoint(`${baseUrl}/auth/login`, 'Authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (loginResult.success && loginResult.data.token) {
      // Test user profile
      await testEndpoint(`${baseUrl}/auth/me`, 'User Profile', {
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  // Print summary
  console.log('\n📊 Test Summary');
  console.log('=============');
  console.log(`Total tests: ${testResults.passed + testResults.failed}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  
  // Recommendations
  console.log('\n📋 Recommendations:');
  
  if (testResults.failed > 0) {
    console.log('- Check that your server is running');
    console.log('- Verify that your database is properly connected');
    console.log('- Check the server logs for any errors');
    console.log('- Ensure environment variables are properly set');
  } else {
    console.log('✅ All tests passed! Your client can connect to the server and database successfully.');
  }
  
  rl.close();
};

// Run the tests
runTests().catch(error => {
  console.error(`Script error: ${error.message}`);
  rl.close();
}); 