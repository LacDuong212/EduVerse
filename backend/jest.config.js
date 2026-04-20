export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 20000,
  reporters: [
    "default",
    ["<rootDir>/scripts/jestReporter.cjs", {}],
  ],
};
