// Use this when you need to start server globally for all tests for this file
// and shutdown afterall tests completed.
// Mostly one should write tests which are independant but sometime tests just
// checks application code which does not change application state and does not
// interact with DB hence it make sense to start server once and shutdown it
// after tests are completed. For example, validator tests, auth function tests etc.

const server = require('../test-server');
const setupHelper = require('../setup-helper');
const constant = require('../../model/constant');

/**
 * This will run once at the beggining of file. It gets executed before any test
 * in the file runs
 */
beforeAll(async () => {
  await setupHelper.cleanTestDatabase();
  server.start();
}, constant.testTimeout.beforeAll);

/**
 * This will run once at the end of file. It gets executed after all tests
 * in the file get completed
 */
afterAll(async () => {
  await server.close();
}, constant.testTimeout.afterAll);

/**
 * Simple test
 */
test('SimpleTest', async () => {
  // Test Body
});

/**
 * Testsuite of Test cases
 */
describe('GroupOfTest', () => {
  beforeEach(() => {
    // Steps to perform before each test case
  });
  afterEach(async () => {
    // Steps to perform after each test case
  });
  it('TestCase1', async () => {
    // Test Body
  });
  it('TestCase2', async () => {
    // Test Body
  });
});
