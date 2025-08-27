import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
    // Add more setup options before each test is run
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // Test environment
    testEnvironment: 'jsdom',

    // Coverage settings
    collectCoverage: true,
    coverageProvider: 'v8',
    collectCoverageFrom: [
        '**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!<rootDir>/.next/**',
        '!<rootDir>/coverage/**',
        '!<rootDir>/jest.config.ts',
        '!<rootDir>/jest.setup.ts',
    ],

    // Test path patterns
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/coverage/',
        '<rootDir>/tests/e2e/', // Exclude Playwright E2E tests
    ],

    // Module name mapping for absolute imports
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    },

    // Transform patterns - use next/jest which handles TypeScript automatically
    // No need for explicit transform configuration with next/jest

    // Test file patterns - exclude E2E tests by only including specific patterns
    testMatch: [
        '**/__tests__/**/*.(ts|tsx|js)',
        '**/*.test.(ts|tsx|js)', // Only .test files, not .spec files
    ],

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks between tests
    restoreMocks: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
