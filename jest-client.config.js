/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...require('./jest-base.config'),
  displayName: 'client',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/client/**.test.{ts,tsx}'
  ],
  testPathIgnorePatterns: [],
};
