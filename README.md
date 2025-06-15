# IremeHub LMS Platform

A comprehensive Learning Management System built with Next.js, Express, and MongoDB, now fully standardized with TypeScript.

## Project Structure

```
iremehub-lms/
├── client/                 # Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── public/             # Static assets
│   └── tsconfig.json       # TypeScript config for client
│
├── server/                 # Express backend
│   ├── src/                # TypeScript source files
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── tsconfig.json       # TypeScript config for server
│
└── tsconfig.json           # Root TypeScript config
```

## Setup and Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm

### 1. Server Setup
```bash
   cd server
   npm install
   ```
Create a `.env` file in the `server` directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```
Then, to run the server in development mode:
```bash
   npm run dev
   ```

### 2. Client Setup
```bash
   cd client
   npm install
   npm run dev
   ```
The application will be available at `http://localhost:3000`.

## Key Features

- **User Authentication:** Secure login and registration with JWT.
- **Course Management:** Create, update, and delete courses and lessons.
- **Student Enrollment:** Students can enroll in courses and track their progress.
- **TypeScript:** Fully typed codebase for both client and server.
- **Interactive Learning:** Supports various content types, including video and text.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
