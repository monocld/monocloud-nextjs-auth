/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  preset: 'ts-jest/presets/js-with-ts',
  coveragePathIgnorePatterns: ['node_modules', './src/types'],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  testPathIgnorePatterns: ['./tests/client'],
};
