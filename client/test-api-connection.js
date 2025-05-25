const http = require('http');
const https = require('https');

console.log('Testing API connectivity from client...');

// Test servers
const servers = [
  { url: 'http://localhost:5000/api/health', name: 'Server on port 5000' },
  { url: 'http://localhost:5001/api/health', name: 'Server on port 5001' },
  { url: 'http://127.0.0.1:5000/api/health', name: 'Server on 127.0.0.1:5000' }
];

// Function to make a raw request without fetch
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    console.log(`Trying ${url}...`);
    
    const lib = url.startsWith('https') ? https : http;
    const reqOptions = new URL(url);
    
    const req = lib.get(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response from ${url}: ${res.statusCode}`);
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          data
        });
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error with ${url}: ${error.message}`);
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(3000, () => {
      req.abort();
      console.error(`Timeout when connecting to ${url}`);
      resolve({
        success: false,
        error: 'Request timed out'
      });
    });
  });
}

// Test all servers
async function testAllServers() {
  let anySuccess = false;
  let workingServer = null;
  
  for (const server of servers) {
    console.log(`Testing ${server.name}...`);
    const result = await makeRequest(server.url);
    
    if (result.success) {
      console.log(`✅ SUCCESS: ${server.name} is working!`);
      anySuccess = true;
      workingServer = server;
      break;
    } else {
      console.log(`❌ FAILED: ${server.name} - ${result.error || 'Unknown error'}`);
    }
  }
  
  if (anySuccess) {
    console.log(`\nWORKING SERVER FOUND: ${workingServer.name}`);
    console.log(`USE THIS URL IN YOUR CLIENT: ${workingServer.url.replace('/api/health', '')}`);
    
    // Create a quick .env.local file with the working URL
    const fs = require('fs');
    const path = require('path');
    
    const envContent = `# Auto-generated based on connection test
NEXT_PUBLIC_API_BASE_URL=${workingServer.url.replace('/api/health', '')}
`;
    
    try {
      fs.writeFileSync(path.join(__dirname, '.env.local'), envContent);
      console.log('\n.env.local file created with working server URL!');
    } catch (error) {
      console.error('Error creating .env.local file:', error.message);
    }
  } else {
    console.log('\n❌ NO SERVER IS RESPONDING!');
    console.log('Please make sure the server is running with:');
    console.log('cd server && node start-server.js');
  }
}

testAllServers(); 