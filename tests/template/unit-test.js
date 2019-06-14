// Unit test templates

/**
 * Simple Unit Test
 */
test('SimpleUnitTest', async () => {
  // Test Body
});

/**
 * Testsuite of Unit Test
 */
describe('GroupOfUnitTest', () => {
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

// Having nested test suites
describe('GroupOfTestSuites', () => {
  beforeEach(() => {
    // Steps to perform before each test suite
  });
  afterEach(async () => {
    // Steps to perform after each test suite
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
    // Test Body
  });
});

// Parameterized tests in test suite
describe('isValidFSJDate', () => {
  const paramsArray1 = [['param1.1', 'param1.2', 'param1.3'], ['param2.1', 'param2.2', 'param2.3'], ['param3.1', 'param3.2', 'param3.3']];
  // eslint-disable-next-line no-unused-vars
  paramsArray1.forEach(([testName, value, expectedValue]) => {
    it('Logic to create test Name', async () => {
      // Test Logic
    });
  });
});
