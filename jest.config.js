module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/', '/dist/', , '/lib/', 'constants.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/lib/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
