/**
 * Simple MongoDB Connection Test
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  // Connection URI
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
  
  console.log(`Attempting to connect to MongoDB: ${uri.substring(0, uri.indexOf('@') > 0 ? uri.indexOf('@') : 20)}...`);
  
  // Create a new MongoClient
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds
  });
  
  try {
    // Connect the client to the server
    await client.connect();
    
    // Verify connection
    await client.db("admin").command({ ping: 1 });
    
    console.log("✅ Connected successfully to MongoDB server");
    
    // Get the database
    const db = client.db();
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in database ${db.databaseName}:`);
    
    // List each collection and count documents
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    // Close the connection
    await client.close();
    console.log("Connection closed");
  }
}

main().catch(console.error); 