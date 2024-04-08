/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...require('./jest-base.config'),
  displayName: 'node',
  testEnvironment: 'jest-environment-node',
};
