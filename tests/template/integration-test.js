const server = require('../test-server');
const setupHelper = require('../setup-helper');

/**
 * Simple Integration Test Template which perform following steps
 * - Start the test server
 * - Test Body
 * - Close the server
 */
test('SimpleIntergrationTest', async () => {
  await setupHelper.cleanTestDatabase();
  server.start();

  // Code to make a REST API call
  // const result = await server.get('/test/server/status');

  // Code to inspect the results with some asserts
  // console.log(result.data);

  await server.close();
});

/**
 * Testsuite of Integration Test
 * Before each test we need to start server and after each test we need to shutdown it
 *
 */
describe('GroupOfIntegrationTest', () => {
  beforeEach(() => {
    server.start();
  });
  afterEach(async () => {
    await server.close();
  });
  it('TestCase1', async () => {
    // Test Body
  });
  it('TestCase2', async () => {
    // Test Body
  });
});

// Having nested test suites with server starting once before all test suite
describe('GroupOfTestSuites', () => {
  beforeEach(() => {
    server.start();
  });
  afterEach(async () => {
    await server.close();
  });
  describe('TestSuite1', () => {
    it('TestCase2InTestSuite1', () => {
      // Test Logic
    });
    it('TestCase2InTestSuite1', () => {
      // Test Logic
    });
  });
  describe('TestSuite2', () => {
    it('TestCase2InTestSuite2', () => {
      // Test Logic
    });
    it('TestCase2InTestSuite2', () => {
      // Test Logic
    });
  });
});

/**
 * Parameterized Tests:
 * Repeting tests for different parameters
 */
// Simple parameterized test
const paramsArray = [['param1.1', 'param1.2', 'param1.3'], ['param2.1', 'param2.2', 'param2.3'], ['param3.1', 'param3.2', 'param3.3']];
// eslint-disable-next-line no-unused-vars
paramsArray.forEach(([testName, value, expectedValue]) => {
  test('ParameterizedTest', async () => {
    server.start();

    // Code to make a REST API call
    // const result = await server.get('/test/server/status');

    // Code to inspect the results with some asserts
    // console.log(result.data);

    await server.close();
  });
});

// Parameterized tests in test suite
describe('isValidFSJDate', () => {
  beforeEach(() => {
    server.start();
  });
  afterEach(async () => {
    await server.close();
  });
  const paramsArray1 = [['param1.1', 'param1.2', 'param1.3'], ['param2.1', 'param2.2', 'param2.3'], ['param3.1', 'param3.2', 'param3.3']];
  // eslint-disable-next-line no-unused-vars
  paramsArray1.forEach(([testName, value, expectedValue]) => {
    it('Logic to create test Name', async () => {
      // Test Logic
    });
  });
});
