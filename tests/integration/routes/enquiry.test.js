const server = require('../../test-server');
const constant = require('../../../model/constant');
const setupHelper = require('../../setup-helper');

const testLossReasonListArray = ['Competitor', 'Other', 'Postponed', 'Price'];

// Some global variables defined for tests in this file
const tokenName = constant.TOKEN_NAME;
let tokenValue;
/**
 * This will run once at the beggining of file. It gets executed before any test
 * in the file runs
 */
beforeAll(async () => {
  // Clean up the test Database
  await setupHelper.cleanTestDatabase();

  // Get the id-token from server
  await server.start();
  const loginResponse = await server.POST('/employee/login', {
    ui_company_code: 'FSJARS',
    ui_username: 'owner1@fsjars.com',
    ui_password: 'Qwerty12$',
  });
  tokenValue = loginResponse.headers[tokenName];
}, constant.testTimeout.beforeAll);

/**
 * This will run once at the end of file. It gets executed after all tests
 * in the file get completed
 */
afterAll(async () => {
  await server.close();
}, constant.testTimeout.afterAll);

// test('SimpleTest', async () => {
//   // Test logic.
// });

describe('lossReasonList', () => {
  beforeEach(async () => {
    // Steps to perform before each test case
  });

  afterEach(async () => {
    // Steps to perform after each test case
  });
  const paramsArrayForLTRoute = [
    ['Invalid Token', false, 403, true],
    ['No Token Present', false, 401, false],
    ['Success', testLossReasonListArray, 200, true],
  ];
  paramsArrayForLTRoute.forEach(([testName, value, expectedStatus, token]) => {
    it(`${testName} : loss reason list route`, async () => {
      // console.log(value);
      const reqHeaders = {};
      if (token && value) {
        reqHeaders[tokenName] = tokenValue;
        const response = await server.GET('/enquiry/loss/reason/list', {}, reqHeaders);
        expect(response.data.data.items).toEqual(value);
      } else {
        if (token) reqHeaders[tokenName] = 'Invalid value';
        const response = await server.GET('/enquiry/loss/reason/list', {}, reqHeaders);
        expect(response.status).toBe(expectedStatus);
      }
    });
  });
});

// /**
//  * Testsuite of Test cases
//  */
// describe('GroupOfTest', () => {
//   beforeEach(() => {
//     // Steps to perform before each test case
//   });
//   afterEach(async () => {
//     // Steps to perform after each test case
//   });
//   it('TestCase1', async () => {
//     // Test Body
//   });
//   it('TestCase2', async () => {
//     // Test Body
//   });
// });
