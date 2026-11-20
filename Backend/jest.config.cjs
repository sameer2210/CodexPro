/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true,
  testTimeout: 60000,
  // rateLimiter setInterval + mongoose keep the event loop alive after suites
  forceExit: true,
};

