// jest.ui.config.js — browser-driven UI suite (npm run test:ui).
//
// Kept separate from `npm test`: the backend suite needs Supabase, this one
// needs Chrome + the app server. Running them apart means neither is blocked by
// the other's setup. globalSetup starts the server (and reuses one already
// running on the port).

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/ui/**/*.test.js'],
  globalSetup: '<rootDir>/tests/ui/globalSetup.js',
  globalTeardown: '<rootDir>/tests/ui/globalTeardown.js',
  testTimeout: 60000,
  // Run in the same process as globalSetup (the npm script passes --runInBand).
  // A worker process keeps its own handles open and leaves Jest hanging after
  // the run; in-band also means the suites share the one server cleanly.
  maxWorkers: 1,
};
