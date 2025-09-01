import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Test environment
  testEnvironment: "jsdom",

  // Coverage settings
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!<rootDir>/.next/**",
    "!<rootDir>/coverage/**",
    "!<rootDir>/jest.config.ts",
    "!<rootDir>/jest.setup.ts",
    "!<rootDir>/tests/e2e/**", // Exclude E2E tests from coverage
  ],

  // Test path patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/",
    "<rootDir>/tests/e2e/", // Exclude Playwright E2E tests
  ],

  // Module name mapping for absolute imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
  },

  // Test file patterns - exclude E2E tests by only including specific patterns
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.test.(ts|tsx|js)", // Only .test files, not .spec files
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // CI-specific settings
  ...(process.env.CI && {
    reporters: [
      "default",
      [
        "jest-junit",
        {
          outputDirectory: "test-results",
          outputName: "junit.xml",
          classNameTemplate: "{classname}",
          titleTemplate: "{title}",
          ancestorSeparator: " › ",
          usePathForSuiteName: true,
        },
      ],
    ],
    collectCoverage: true,
    coverageReporters: ["text", "lcov", "html", "json", "cobertura"],
    testResultsProcessor: "jest-junit",
    maxWorkers: 2, // Limit workers in CI for stability
    testTimeout: 30000, // Increased timeout for CI
  }),
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
