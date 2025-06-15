module.exports = {
  // Use ts-jest for TypeScript transformation
  preset: 'ts-jest/presets/default-esm',

  // Enable ESM support inside Jest
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],

  // Look for test files with `.test.ts` or `.spec.ts` extensions in any folder
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Tell ts-jest where the TS config is and that we are compiling ESM
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json'
    }
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,
}; 