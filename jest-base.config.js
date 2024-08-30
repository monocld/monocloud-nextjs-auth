/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  preset: 'ts-jest/presets/js-with-ts',
  coveragePathIgnorePatterns: [
    'node_modules',
    './src/global.d.ts',
    './src/index.ts',
    './src/types',
    './src/components/components.client.tsx',
    './src/components/components.server.tsx',
    './src/components/index.tsx',
  ],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  testPathIgnorePatterns: ['./tests/client'],
};
