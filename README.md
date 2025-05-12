# IremeHub LMS

A comprehensive Learning Management System built with React, Next.js, Node.js, and MongoDB.

## Features

- User authentication and authorization
- Course creation and management
- Student enrollment and progress tracking
- Interactive learning materials
- Assessment and grading system
- Admin dashboard for system management

## Project Structure

- `/client` - Frontend application built with Next.js and React
- `/server` - Backend API built with Node.js and Express

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

# iremehub LMS - Database Implementation Guide

This guide provides step-by-step instructions for ensuring your Learning Management System (LMS) properly connects to MongoDB and stores all application data in the database.

## Prerequisites

- Node.js and npm installed
- MongoDB (local installation or MongoDB Atlas account)
- Git for version control

## Step 1: Setup Environment Variables

1. In the `/server` directory, create a `.env` file with the following content:

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

## Step 2: Test Database Connection

1. Install server dependencies:

```bash
cd server
npm install
```

2. Run the MongoDB connection test script:

```bash
node scripts/test-mongodb.js
```

3. If the test succeeds, you'll see a confirmation message. If it fails, check the troubleshooting section in `DATABASE-SETUP.md`.

## Step 3: Seed the Database

1. Run the database seeding script to populate with sample data:

```bash
node scripts/seed-database.js
```

2. This will create sample users and courses with the following credentials:
   - Admin: admin@example.com / Admin123!
   - Educator: educator@example.com / Educator123!
   - Student: student@example.com / Student123!

## Step 4: Start the Application

1. Start the backend server:

```bash
cd server
npm run dev
```

2. In a separate terminal, start the frontend:

```bash
cd client
npm run dev
```

3. Access the application at http://localhost:3000

## Step 5: Verify Database Functionality

1. Log in using one of the sample accounts created in Step 3
2. Navigate through the application, creating courses, lessons, etc.
3. Verify that data is being saved to the database by checking MongoDB:
   
   ```bash
   # For MongoDB Atlas, use MongoDB Compass or the Atlas web interface
   # For local MongoDB
   mongosh
   use lms
   db.users.find()
   db.courses.find()
   ```

## Deploying to Vercel

For production deployment on Vercel:

1. Generate Vercel environment variables file:

```bash
node scripts/setup-vercel-env.js
```

2. Deploy the server to Vercel:

```bash
cd server
vercel
```

3. Deploy the client to Vercel:

```bash
cd client
vercel
```

4. Ensure environment variables are properly set in the Vercel dashboard for both deployments.

## Database Models

The following models are used to store application data:

- **User**: Authentication and user profile information
- **Course**: Course details and metadata
- **Lesson**: Course content organized by lessons
- **Section**: Grouping of lessons within courses
- **Progress**: Tracking student progress through courses
- **Certificate**: Completion certificates for courses

## Troubleshooting

For common database issues and their solutions, please refer to `DATABASE-SETUP.md`.

## Additional Resources

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Mongoose Documentation: https://mongoosejs.com/docs/
- Next.js Documentation: https://nextjs.org/docs