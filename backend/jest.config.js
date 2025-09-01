const { createDefaultPreset } = require('ts-jest');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...createDefaultPreset({
    diagnostics: false,
  }),
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts', '!src/app.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000, // Increased timeout for CI environment
  verbose: true,
  // CI-specific settings
  ...(process.env.CI && {
    reporters: [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: 'coverage',
          outputName: 'junit.xml',
          classNameTemplate: '{classname}',
          titleTemplate: '{title}',
          ancestorSeparator: ' › ',
          usePathForSuiteName: true,
        },
      ],
    ],
    collectCoverage: true,
    coverageReporters: ['text', 'lcov', 'html', 'json', 'cobertura'],
    testResultsProcessor: 'jest-junit',
  }),
  // Test retry for flaky tests in CI
  ...(process.env.CI && {
    retryTimes: 2,
    retryDelay: 1000,
  }),
};
