/**
 * Vercel Environment Setup Script
 * 
 * Generates a JSON file with environment variables to import into Vercel
 * Run with: node scripts/setup-vercel-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Paths
const envPath = path.join(__dirname, '..', '.env');
const outputPath = path.join(__dirname, '..', 'vercel.env.json');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Default environment variables
const defaultEnv = {
  // MongoDB
  MONGODB_URI: 'mongodb+srv://iremehub:02.06.02@cluster0.ewfskt9.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0',
  
  // JWT
  JWT_SECRET: crypto.randomBytes(32).toString('hex'),
  JWT_EXPIRE: '7d',
  
  // Server
  PORT: '8080', // Vercel typically ignores this and uses its own port
  NODE_ENV: 'production',
  
  // Frontend URL
  FRONTEND_URL: 'https://iremehub.vercel.app'
};

// Main function
const generateVercelEnv = async () => {
  console.log('🔧 Vercel Environment Variables Generator');
  console.log('========================================');
  
  // Check if .env file exists
  const envExists = fs.existsSync(envPath);
  let currentEnv = {};
  
  if (envExists) {
    console.log('Found existing .env file');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse existing environment variables
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          currentEnv[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  } else {
    console.log('No existing .env file found. Using default values.');
  }
  
  // Combine current with default
  const vercelEnv = { ...defaultEnv, ...currentEnv };
  
  // Override NODE_ENV for production
  vercelEnv.NODE_ENV = 'production';
  
  // Ask for MongoDB URI
  console.log('\n🗄️  MongoDB Configuration');
  console.log('------------------------');
  
  if (vercelEnv.MONGODB_URI) {
    console.log(`Current MongoDB URI: ${vercelEnv.MONGODB_URI.substring(0, vercelEnv.MONGODB_URI.indexOf('@') > 0 ? vercelEnv.MONGODB_URI.indexOf('@') : 20)}...`);
    
    const changeMongoDB = await question('Do you want to change the MongoDB connection string? (y/n): ');
    
    if (changeMongoDB.toLowerCase() === 'y') {
      const mongoURI = await question('Enter your MongoDB Atlas connection string: ');
      
      if (mongoURI) {
        vercelEnv.MONGODB_URI = mongoURI;
      } else {
        console.log('No MongoDB URI provided. Using current value.');
      }
    }
  } else {
    const mongoURI = await question('Enter your MongoDB Atlas connection string: ');
    
    if (mongoURI) {
      vercelEnv.MONGODB_URI = mongoURI;
    } else {
      console.log('No MongoDB URI provided. Using default value.');
    }
  }
  
  // Ask for frontend URL
  console.log('\n🌐 Frontend URL');
  console.log('-------------');
  console.log(`Current Frontend URL: ${vercelEnv.FRONTEND_URL}`);
  
  const changeFrontendUrl = await question('Do you want to change the frontend URL? (y/n): ');
  
  if (changeFrontendUrl.toLowerCase() === 'y') {
    const frontendUrl = await question('Enter your frontend URL (e.g., https://iremehub.vercel.app): ');
    
    if (frontendUrl) {
      vercelEnv.FRONTEND_URL = frontendUrl;
    }
  }
  
  // Generate new JWT secret?
  console.log('\n🔑 JWT Configuration');
  console.log('------------------');
  
  const generateJwtSecret = await question('Generate new JWT secret for production? (y/n): ');
  
  if (generateJwtSecret.toLowerCase() === 'y') {
    vercelEnv.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.log('Generated new JWT secret.');
  }
  
  // Prepare Vercel environment JSON
  const vercelEnvJson = {
    env: {}
  };
  
  // Add each environment variable
  Object.keys(vercelEnv).forEach(key => {
    vercelEnvJson.env[key] = { value: vercelEnv[key] };
  });
  
  // Write to file
  try {
    fs.writeFileSync(outputPath, JSON.stringify(vercelEnvJson, null, 2));
    console.log(`\n✅ Vercel environment variables saved to: ${outputPath}`);
    console.log('You can import this file in the Vercel dashboard.');
  } catch (error) {
    console.error(`\n❌ Error writing Vercel environment file: ${error.message}`);
  }
  
  // Instructions
  console.log('\n📝 Next Steps for Vercel Deployment:');
  console.log('1. Log in to your Vercel dashboard: https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to "Settings" > "Environment Variables"');
  console.log('4. Click "Import" and select the generated file');
  console.log('5. Deploy your project');
  
  rl.close();
};

// Run the script
generateVercelEnv()
  .catch(error => {
    console.error('Script error:', error);
    rl.close();
  }); 