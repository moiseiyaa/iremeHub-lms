module.exports = {
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',

  // Test environment simulates Node.js
  testEnvironment: 'node',

  // Look for tests inside the server folder only (adjust if you add client-side tests later)
  roots: ['<rootDir>/server'],

  // Match any *.test.ts or *.spec.ts file
  testMatch: [
    '**/?(*.)+(test|spec).[tj]s',
    '**/__tests__/**/*.[tj]s'
  ],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Collect code coverage and output to /coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',

  // Resolve TypeScript & JavaScript modules
  moduleFileExtensions: ['ts', 'js', 'json'],
}; 