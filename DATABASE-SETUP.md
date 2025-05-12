# Database Setup and Troubleshooting Guide

This guide will help you set up and verify database connectivity for the iremehub LMS application. The application uses MongoDB as its primary database.

## Prerequisites

- Node.js and npm must be installed on your system
- MongoDB (either local installation or MongoDB Atlas account)

## Quick Setup

Follow these steps to quickly set up database connectivity:

1. Create a `.env` file in the server directory with the following content:

```
# MongoDB Configuration
MONGODB_URI=mongodb+srv://iremehub:02.06.02@cluster0.ewfskt9.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=iremehub_secure_jwt_secret_key_2023
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

2. Install dependencies:

```bash
cd server
npm install
```

3. Test the database connection:

```bash
node scripts/test-mongodb.js
```

4. If successful, seed the database with sample data:

```bash
node scripts/seed-database.js
```

5. Start the server:

```bash
npm run dev
```

## MongoDB Connection Options

The application supports multiple ways to connect to MongoDB:

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Click "Connect" and select "Connect your application"
4. Copy the connection string and replace `<username>`, `<password>`, and `<dbname>` with your values
5. Update your `.env` file with the new connection string

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/lms?retryWrites=true&w=majority
```

### Option 2: Local MongoDB (Development)

1. [Install MongoDB Community Edition](https://www.mongodb.com/try/download/community) on your local machine
2. Start the MongoDB service
3. Update your `.env` file with the local connection string:

```
MONGODB_URI=mongodb://localhost:27017/lms
```

## Troubleshooting Database Connectivity

If you're experiencing database connectivity issues, follow these steps:

### 1. Check Your Connection String

- Verify the username and password in your MongoDB URI
- Check for special characters in the password (they may need to be URL-encoded)
- Make sure the database name is correct (typically "lms" for this application)

### 2. Network Issues

- **MongoDB Atlas**: Ensure your IP address is whitelisted in Atlas. For testing, you can allow access from anywhere (0.0.0.0/0)
- **Local MongoDB**: Check that the MongoDB service is running:
  - Windows: Run `services.msc` and look for MongoDB
  - Linux: Run `sudo systemctl status mongod`
  - MacOS: Run `brew services list` (if installed via Homebrew)

### 3. Run the Diagnostic Script

The application includes a diagnostic script to test MongoDB connectivity:

```bash
node scripts/test-mongodb.js
```

This will provide detailed information about connection issues.

### 4. Common Error Messages and Solutions

| Error Message | Possible Solution |
|---------------|-------------------|
| MongooseServerSelectionError: connection timed out | Check network connectivity, firewall settings, or whitelist your IP in MongoDB Atlas |
| Authentication failed | Verify username and password in connection string |
| ECONNREFUSED | Check if MongoDB is running locally or if the connection string is correct |
| MongoError: bad auth | Password may contain special characters that need URL encoding |

### 5. Environment Configuration

If you've changed your MongoDB URI, make sure it's properly set in all environments:

- Development: `.env` file in server directory
- Production (Vercel): Environment variables in Vercel dashboard

## Database Models

The application uses the following main data models:

1. **User** - Stores user information including authentication details
2. **Course** - Stores course information
3. **Lesson** - Contains lesson content for courses
4. **Progress** - Tracks student progress
5. **Certificate** - Manages course completion certificates

## Sample Data

You can populate your database with sample data using the seed script:

```bash
node scripts/seed-database.js
```

This will create:
- Admin user (admin@example.com / Admin123!)
- Educator (educator@example.com / Educator123!)
- Student (student@example.com / Student123!)
- Sample courses with the educator as instructor

## Verifying Client-Server-Database Connectivity

To ensure the entire application stack is working properly, follow these steps:

1. First, start the server in one terminal window:
```bash
cd server
npm run dev
```

2. Next, start the client in another terminal window:
```bash
cd client
npm run dev
```

3. Once both are running, access the application in your browser:
```
http://localhost:3000
```

4. Try the following operations to verify database functionality:
   - Register a new user
   - Log in with existing credentials
   - Browse courses
   - Create a new course (if logged in as educator)
   - Enroll in a course (if logged in as student)

5. If any of these operations fail, check the server logs for database-related errors

6. You can verify data is being properly stored by using MongoDB Compass or the MongoDB Atlas web interface to inspect the collections.

## Testing API Endpoints Directly

You can also test the API endpoints directly using the following command:

```bash
node server/scripts/test-api.js
```

This script will:
1. Connect directly to your MongoDB database
2. Test key API endpoints
3. Verify authentication and data retrieval
4. Report any issues with database connectivity

## Database Backup and Restore

### Creating a Backup

```bash
# For MongoDB Atlas
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/lms" --out=./backup

# For Local MongoDB
mongodump --db=lms --out=./backup
```

### Restoring from Backup

```bash
# For MongoDB Atlas
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/lms" --db=lms ./backup/lms

# For Local MongoDB
mongorestore --db=lms ./backup/lms
```

## Advanced: Vercel Deployment

When deploying to Vercel, remember to:

1. Add your MongoDB URI to Vercel environment variables
2. Use the same environment variable names as in your local `.env` file
3. Ensure your MongoDB Atlas cluster allows connections from Vercel's IP ranges
   - You can use `0.0.0.0/0` for testing but limit it in production

## API Health Check

You can verify the database connection through the API health endpoint:

```
GET /api/health
```

This endpoint returns the current database connection status.

## Need Further Help?

If you continue to experience database connectivity issues:

1. Check the server logs for detailed error messages
2. Verify that your MongoDB version is compatible (4.x or later recommended)
3. Try an alternative connection method (local vs. cloud)
4. Ensure all dependencies are installed (`npm install`) 