# IremehHub LMS - Server

This is the backend server for the IremehHub Learning Management System.

## TypeScript Conversion

The project has been partially converted to TypeScript. Here's what has been done:

1. Core files converted to TypeScript:
   - `db.ts` - MongoDB connection module
   - `server.ts` - Main server file
   - `models/User.ts` - User model
   - `middleware/auth.ts` - Authentication middleware
   - `middleware/asyncHandler.ts` - Async handler utility
   - `middleware/errorHandler.ts` - Error handling middleware
   - `utils/errorResponse.ts` - Error response utility
   - `routes/auth.ts` - Authentication routes

2. TypeScript configuration:
   - `tsconfig.json` - TypeScript configuration file
   - Build scripts in package.json

## Completing the TypeScript Conversion

To complete the TypeScript conversion:

1. Convert remaining JavaScript files to TypeScript:
   - Models: Convert each model file from `.js` to `.ts` and update imports/exports
   - Controllers: Convert controller files to TypeScript with proper types
   - Routes: Convert route files to TypeScript similar to `routes/auth.ts`
   - Utilities: Convert utility files to TypeScript

2. For each file conversion:
   - Change `require()` to `import` statements
   - Change `module.exports` to `export default`
   - Add type annotations to functions and variables
   - Update references to other modules

3. Build and run:
   ```
   npm run build
   npm start
   ```

## Development

- `npm run dev` - Start development server with TypeScript
- `npm run build` - Build TypeScript files
- `npm start` - Run the compiled JavaScript