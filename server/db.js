const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Connect to MongoDB with fallback options
 */
const connectDB = async () => {
  // Get MongoDB URI from environment or use a default value
  let mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('ERROR: MONGODB_URI is not defined in .env file');
    mongoURI = 'mongodb://localhost:27017/lms'; // Default fallback
    console.log('Using default fallback connection: mongodb://localhost:27017/lms');
  }

  // Connection attempts counter
  let attempts = 0;
  
  // List of fallback URIs to try if the primary fails
  const fallbackURIs = [
    'mongodb://localhost:27017/lms',
    'mongodb+srv://demo:ql0lm96vQpN0l52v@cluster0.mongodb.net/lms?retryWrites=true&w=majority'
  ];
  
  // Connection options with increased timeouts and retries
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10, 
    family: 4  // Force IPv4
  };

  // Try the primary connection first, then fallbacks if needed
  async function attemptConnection(uri) {
    attempts++;
    console.log(`Connection attempt ${attempts}: ${uri.substring(0, uri.indexOf('@') > 0 ? uri.indexOf('@') : 20)}...`);

    try {
      // Set Mongoose options
      mongoose.set('strictQuery', false);
      
      await mongoose.connect(uri, connectionOptions);
      
      console.log('MongoDB Connected Successfully');
      
      // Test the connection with a ping
      try {
        await mongoose.connection.db.admin().ping();
        console.log('Database ping successful');
        
        // Update .env file if we're using a fallback
        if (attempts > 1 && uri !== process.env.MONGODB_URI) {
          updateEnvFile(uri);
        }
        
        return true;
      } catch (pingError) {
        console.error(`Database ping failed: ${pingError.message}`);
        await mongoose.connection.close();
        return false;
      }
    } catch (error) {
      console.error('MongoDB connection error:');
      console.error(`- Message: ${error.message}`);
      
      if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT') || error.message.includes('querySrv')) {
        console.error('Network error: Cannot reach MongoDB host');
      } else if (error.message.includes('Authentication failed')) {
        console.error('Authentication failed. Check MongoDB credentials.');
      }
      
      return false;
    }
  }
  
  // Try to connect with the primary URI
  if (await attemptConnection(mongoURI)) {
    return true;
  }
  
  // If primary URI fails, try fallbacks
  console.log('Primary connection failed. Trying fallback connections...');
  
  for (const fallbackURI of fallbackURIs) {
    if (fallbackURI !== mongoURI) { // Skip if it's the same as the primary
      if (await attemptConnection(fallbackURI)) {
        return true;
      }
    }
  }
  
  // If we reach here, all connection attempts failed
  console.error('All MongoDB connection attempts failed');
  return false;
};

/**
 * Update the .env file with a working MongoDB URI
 */
function updateEnvFile(workingUri) {
  const envPath = path.join(__dirname, '.env');
  
  try {
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      
      // Replace the MongoDB URI
      if (content.includes('MONGODB_URI=')) {
        content = content.replace(/MONGODB_URI=.*(\r?\n|$)/, `MONGODB_URI=${workingUri}$1`);
        fs.writeFileSync(envPath, content);
        console.log('Updated .env file with working connection string');
      }
    }
  } catch (error) {
    console.error(`Failed to update .env file: ${error.message}`);
  }
}

module.exports = connectDB; 