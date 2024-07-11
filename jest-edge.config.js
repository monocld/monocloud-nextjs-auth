/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...require('./jest-base.config'),
  displayName: 'edge',
  testEnvironment: '@edge-runtime/jest-environment',
  testMatch: [
    '**/tests/handlers/**/*.app-router.test.ts',
    '**/tests/handlers/middleware/middleware.test.ts',
    '**/tests/server-functions/**/*.app-router.test.ts',
    '**/tests/config/**/*.app-router.test.ts',
    '**/tests/utils.test.ts',
  ],
  moduleNameMapper: { '^uuid$': 'uuid' },
};
