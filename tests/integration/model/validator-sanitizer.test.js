const server = require('../../test-server');
const hf = require('../../../model/helper-function');
const constant = require('../../../model/constant');
const setupHelper = require('../../setup-helper');

beforeAll(async () => {
  await setupHelper.cleanTestDatabase();
  server.start();
}, constant.testTimeout.beforeAll);

afterAll(async () => {
  await server.close();
}, constant.testTimeout.afterAll);

describe('ValidatorSanitizerTests', () => {
  beforeEach(() => {
    // No setup needed.
    // This does not use database hence we can get away with any state of database.
  });
  afterEach(async () => {
    // No teardown needed
  });

  describe('isValidFSJDate', () => {
    const paramsArray = [
      ['Valid', '2017-08-12', 200],
      ['Valid', '2020-02-29', 200], // Feb Leap Year
      ['Invalid', '2017-02-30', 422], // Invalid Feb date
      ['Invalid', '2017-20-30', 422], // Invalid Month
      ['Invalid', '', 422], // Empty
      // The following test case is error in library date-and-time
      // ['Invalid', '77-04-12', 422], // Less than 4 YYYY
      ['Invalid', '20177-04-12', 422], // More than 4 YYYY
      ['Invalid', '2017-0-12', 422], // Less than 2 MM
      ['Invalid', '2017-012-12', 422], // More than 2 MM
      ['Invalid', '2017-04-2', 422], // Less than 2 DD
      ['Invalid', '2017-04-222', 422], // More than 2 DD
      ['Invalid', '2017/04/222', 422], // Correct date with slash
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName}: ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidFSJDate', { date: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isEmail', () => {
    const paramsArray = [
      ['Valid', 'test123@test.com', 200],
      ['Valid', 'Test_email@fsjars.com', 200], // Valid email
      ['Invalid', '#@%^%#$@#$#$@#.com', 422], // multiple @
      ['Invalid', 'Testemailfsjars.com', 422], // no @
      ['Invalid', '', 422], // Empty
      ['Invalid', null, 422], // Null
      ['Invalid', undefined, 422], // Undefined
      ['Invalid', 'Joe Smith <email@domain.com>', 422], // Improper format
      ['Invalid', 'Test_email@fsjars', 422], // No .com
      ['Invalid', 'Test_emailfsjars.com', 422], // No @
      ['Invalid', 'email.domain.com', 422], //
      ['Invalid', 'email.@domain.com', 422], // .@
      ['Invalid', 'email..email.domain.com', 422], // no @ and double ..
      ['Invalid', 'email@-domain.com', 422], // @-
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isEmail', { email: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('ifExistIsEmail', () => {
    const paramsArray = [
      ['Valid', 'test123@test.com', 200],
      ['Valid', '', 200],
      ['Valid', null, 200],
      ['Valid', undefined, 200],
      ['Valid', 'Test_email@fsjars.com', 200], // Valid email
      ['Invalid', '#@%^%#$@#$#$@#.com', 422], // Only characters
      ['Invalid', 'Testemailfsjars.com', 422], // Invalid email
      ['Invalid', 'Joe Smith <email@domain.com>', 422], // Improper format
      ['Invalid', 'Test_email@fsjars', 422], // No '.com'
      ['Invalid', 'Test_emailfsjars.com', 422], // No @
      ['Invalid', 'email.domain.com', 422], // only '.'
      ['Invalid', 'email.@domain.com', 422], // .@
      ['Invalid', 'email..email.domain.com', 422], // no @ and double ..
      ['Invalid', 'email@-domain.com', 422], // @-
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/ifExistIsEmail', { email: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isMobile', () => {
    const paramsArray = [
      ['Valid', '9969657388', 200], // 10 digit mobile number
      ['Invalid', '99999999', 422], // Less than 10 digits
      ['Invalid', '', 422], // Empty
      ['Invalid', '999999999999', 422], // More than 10 digits
      ['Invalid', '@#$%@#$%$#', 422], // Only characters
      ['Invalid', '@989899989', 422], // starts with character
      ['Invalid', '1234567890', 422], // Starts with 1
      ['Invalid', 'abcdefghijk', 422], // alphabet not allowed
      ['Invalid', '1abcde2345', 422], // Improper format
      ['Invalid', 'a969657388', 422], // Contains alphabet
      ['Invalid', 'a#$9657388', 422], // Contains alphabet and character
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isMobile', { mobile: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('ifExistIsMobile', () => {
    const paramsArray = [
      ['Valid', '9969657388', 200], // 10 digit mobile number
      ['Valid', '', 200], // Empty
      ['Invalid', '99999999', 422], // Less than 10 digits
      ['Invalid', '999999999999', 422], // More than 10 digits
      ['Invalid', '@#$%@#$%$#', 422], // Only characters
      ['Invalid', '@989899989', 422], // starts with character
      ['Invalid', '1234567890', 422], // Starts with 1
      ['Invalid', 'abcdefghijk', 422], // alphabet not allowed
      ['Invalid', '1abcde2345', 422], // Improper format
      ['Invalid', 'a969657388', 422], // contains alphabet
      ['Invalid', 'a#$9657388', 422], // contains alphabet and character
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/ifExistIsMobile', { mobile: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isEmailOrMobile', () => {
    const paramsArray = [
      ['Valid', '9969657388', 200], // 10 digit mobile number
      ['Invalid', '99999999', 422], // Less than 10 digits
      ['Invalid', '', 422], // Empty
      ['Invalid', '999999999999', 422], // More than 10 digits
      ['Valid', 'test123@test.com', 200],
      ['Valid', 'Test_email@fsjars.com', 200], // Valid email
      ['Invalid', '#@%^%#$@#$#$@#.com', 422], // Only characters
      ['Invalid', 'Testemailfsjars.com', 422], // Invalid Month
      ['Invalid', '', 422], // Empty
      ['Invalid', 'Joe Smith <email@domain.com>', 422], // Improper format
      ['Invalid', 'Test_email@fsjars', 422], // No .com
      ['Invalid', 'Test_emailfsjars.com', 422], // No @
      ['Invalid', 'email.domain.com', 422], //
      ['Invalid', 'email.@domain.com', 422], // .@
      ['Invalid', 'email..email.domain.com', 422], // no @ and double ..
      ['Invalid', 'email@-domain.com', 422], // @-
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isEmailOrMobile', { username: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isGender', () => {
    const paramsArray = [
      ['Valid', 'Male', 200], // valid gender
      ['Valid', 'Female', 200], // valid gender
      ['Invalid', ' ', 422], // Empty
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isGender', { gender: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isDOB', () => {
    const paramsArray = [['Valid', '2017-08-12', 200], ['Invalid', '1939-01-01', 422], ['Invalid', '', 422]];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isDOB', { date: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isEmpPassword', () => {
    const paramsArray = [
      ['Valid', 'Qwerty12$', 200], // valid password with atleast one capital, one small aplphabet, symbol, number, and more than 8 letters
      ['Valid', '12$Qwerty', 200], // valid password with atleast one capital, one small aplphabet, symbol, number, and more than 8 letters
      ['Valid', '$Qwe12$rty', 200], // valid password with atleast one capital, one small aplphabet, symbol, number, and more than 8 letters
      ['Invalid', '', 422], // empty
      ['Invalid', '@#$@#$@#%%', 422], // no special character allowed
      ['Invalid', '1234567891', 422], // only numbers
      ['Invalid', 'password', 422], // only small letters
      ['Invalid', 'PASSWORD', 422], // only capital letters
      ['Invalid', 'Pass', 422], // too short password
      ['Invalid', 'PASSWORD12', 422], // no small alphabets
      ['Invalid', 'password12', 422], // no capital alphabets
      ['Invalid', 'Password', 422], // no numbers
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isEmpPassword', { password: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isCompanyEmployeePassword', () => {
    const paramsArray = [
      ['Valid', 'Password12@#%', 200], // valid password with atleast one capital, one small aplphabet, number, and character
      ['Valid', '12@#%Password', 200], // valid password with atleast one capital, one small aplphabet, number, and character
      ['Valid', '@#%12Password', 200], // valid password with atleast one capital, one small aplphabet, number, and character
      ['Valid', 'Password12', 200], // valid password with atleast one capital, one small aplphabet, number, and character
      ['Invalid', '', 422], // empty
      ['Invalid', '@#$@#$@#%%', 422], // only characters
      ['Invalid', '1234567891', 422], // only numbers
      ['Invalid', 'password', 422], // only small letters
      ['Invalid', 'PASSWORD', 422], // only capital letters
      ['Invalid', 'PASSWORD12@#%', 422], // no small alphabets
      ['Invalid', 'password12@#%', 422], // no capital alphabets
      ['Invalid', 'Password@#%', 422], // no numbers
      ['Invalid', 'Pass', 422], // too short password, password should be more than 8 characters
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isCompanyEmployeePassword', { password: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isAmount', () => {
    const paramsArray = [
      ['Valid', '300.97', 200], // valid amount is float
      ['Valid', '140.00', 200], // valid amount is float
      ['Valid', '245', 200], // only Integer
      ['Invalid', '', 422], // empty
      ['Invalid', 'abcde', 422], // no alphabets
      ['Invalid', '-98.76', 422], // no negative numbers
      ['Invalid', 'and.56', 422], // improper format
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isAmount', { amount: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isBranches', () => {
    const paramsArray = [
      ['Valid', [1, 2, 3, 4, 5], 200], // valid format is array
      ['Invalid', 'a,b,c,d,e', 422], // invalid branches
      ['Invalid', '140', 422], // invalid branches
      ['Valid', '12345', 422], // only array
      ['Invalid', '', 422], // empty
      ['Invalid', 'abcde', 422], // no alphabets
      ['Invalid', '@#$%^', 422], // no special characters
      ['Invalid', 'Branch1', 422], // improper format
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        // if (typeof value === 'object') {
        //   let branchArrayURLQuery = '/QA/validator_sanitizer/isBranches?';
        //   value.forEach((branch, i) => {
        //     if (i === value.length - 1) branchArrayURLQuery += `branches[]=${branch}`;
        //     else branchArrayURLQuery += `branches[]=${branch}&`;
        //   });
        //   console.log(branchArrayURLQuery);
        //   const response = await server.POST(branchArrayURLQuery);
        //   expect(response.status).toBe(expectedStatus);
        // } else {
        const response = await server.POST('/QA/validator_sanitizer/isBranches', { branches: value });
        expect(response.status).toBe(expectedStatus);
        // }
      });
    });
  });

  describe('isValidEnquiryClassification', () => {
    const paramsArray = [
      // ['Valid', 'positive', 200], //valid format is either positive or negative
      // ['Valid', 'negative', 200],
      ['Valid', 'Positive', 200], // valid format is either the strings positive or negative
      ['Valid', 'Negative', 200],
      // ['Valid', 'POSITIVE', 200],
      // ['Valid', 'NEGATIVE', 200],
      ['Invalid', 'abcde', 422], // invalid enquiry
      // ['Invalid', 'plus', 422], //invalid enquiry
      // ['Valid', 'correct', 422], // no other strings
      ['Invalid', '', 422], // empty
      ['Invalid', '123456789', 422], // no numbers
      ['Invalid', '$%&#', 422], // no special characters
      ['Invalid', 'Level1', 422], // improper format
      ['Invalid', 'Level@#$', 422], // improper format
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidEnquiryClassification', { classification: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isPINCODE', () => {
    const paramsArray = [
      ['Valid: Pincode contains only 6 digits.', '400016', 200],
      ['Valid', , 422],
      ['Invalid: Pincode should not contain more than 6 digits.', '400001698', 422],
      ['Invalid: Empty pincode', '', 422],
      ['Invalid: Pincode should not contain less than 6 digits.', '12345', 422],
      ['Invalid: Pincode cannot have special characters.', '$%&#', 422],
      ['Invalid: Pincode should not contain alphabets.', 'Level', 422],
      ['Invalid: Pincode should not contain alphabets and characters.', 'Level@#$', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isPINCODE', { pincode: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });
  describe('ifExistIsPINCODE', () => {
    const paramsArray = [
      ['Valid: Pincode contains only 6 digits.', '400016', 200],
      ['Valid: Empty pincode', '', 200],
      ['Valid: Undefined test case.', , 200],
      ['Invalid: Pincode should not contain more than 6 digits.', '400001698', 422],
      ['Invalid: Pincode should not contain less than 6 digits.', '12345', 422],
      ['Invalid: Pincode cannot have special characters.', '$%&#', 422],
      ['Invalid: Pincode should not contain alphabets.', 'Level', 422],
      ['Invalid: Pincode should not contain alphabets and characters.', 'Level@#$', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/ifExistIsPINCODE', { pincode: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidEnquiryStatus', () => {
    const paramsArray = [
      ['Valid: Enquiry status should either be converted, in progress, or loss.', 'Converted', 200],
      ['Invalid: Enquiry status should either be converted, in progress, or loss.', 'in-progress', 422],
      ['Valid: Enquiry status should either be converted, in progress, or loss.', 'Loss', 200],
      ['Invalid: Empty enquiry status', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: Enquiry status should not be digits.', '152437', 422],
      ['Invalid: Invalid enquiry status', 'abcde', 422],
      ['Invalid: Enquiry status cannot have special characters.', '$%&#', 422],
      ['Invalid: Invalid enquiry status.', 'level12$', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidEnquiryStatus', { status: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('ifExistIsValidEnquiryStatus', () => {
    const paramsArray = [
      ['Valid: Enquiry status should either be converted, in progress, or loss.', 'Converted', 200],
      ['Invalid: Enquiry status should either be converted, in progress, or loss.', 'in-progress', 422],
      ['Valid: Enquiry status should either be converted, in progress, or loss.', 'Loss', 200],
      ['Valid: Empty enquiry status', '', 200],
      ['Valid: Undefined test case.', , 200],
      ['Invalid: Enquiry status should not be digits.', '152437', 422],
      ['Invalid: Invalid enquiry status', 'abcde', 422],
      ['Invalid: Enquiry status cannot have special characters.', '$%&#', 422],
      ['Invalid: Invalid enquiry status.', 'level12$', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/ifExistIsValidEnquiryStatus', { status: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });
  describe('isExist', () => {
    const paramsArray = [
      ['Valid: Parameter exists.', 'abcdef', 200],
      ['Valid: Parameter exists.', '123456', 200],
      ['Valid: Parameter exists.', '!@#%#$%', 200],
      ['Valid: Parameter exists.', '123.445', 200],
      ['Valid: Parameter exists.', 'adbcs.hrtjks', 200],
      ['Valid: Parameter exists.', '@#$$%.%$##', 200],
      ['Valid: Parameter exists.', 'positive', 200],
      ['Valid: Parameter exists.', 'negative', 200],
      ['Valid: Empty string', '', 200],
      ['Invalid: Undefined string', , 422],
      ['Invalid: Undefined string', undefined, 422],
      ['Valid: Undefined test case.', null, 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isExist', { parameter: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isExactLenWithTrim', () => {
    const paramsArray = [
      ['Valid: String with a length of only 10 characters', 'abcdefghij', 200],
      ['Invalid: Empty string', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: string should not contain more than 10 characters.', 'abcdefghijklmo', 422],
      ['Invalid: string should not contain less than 10 characters.', 'abc', 422],
      ['Invalid: string cannot have special characters.', '$%&#', 422],
      ['Invalid: string should not contain spaces.', 'abcde fghij', 422],
      ['Invalid: Invalid format.', 'Level@#$', 422],
      ['Invalid: Invalid format.', 'Level123', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isExactLenWithTrim', { string: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isMinLenWithTrim', () => {
    const paramsArray = [
      ['Valid: String with a length of minimum 6 characters', 'abcdef', 200],
      ['Valid: String with a length of minimum 6 characters', 'abcdefghijklmo', 200],
      ['Invalid: Empty string', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: string should not contain less than 6 characters.', 'abcd', 422],
      ['Invalid: string should not contain less than 6 characters.', '1234', 422],
      ['Invalid: string should not contain less than 6 characters.', '@#%', 422],
      ['Valid: string can contain period.', 'abcd.efgh', 200],
      ['Valid: string can contain period.', '1234.5678', 200],
      ['Valid: string can contain period.', '$%&#.%&$', 200],
      ['Valid: String with a length of minimum 6 characters.', '$%&#%&$', 200],
      ['Valid: String with a length of minimum 6 characters.', '123456', 200],
      ['Valid: string can contain spaces.', 'abc123de   fg123hij', 200],
      ['Valid: String with a length of minimum 6 characters', 'Level@#$$%', 200],
      ['Valid: String with a length of minimum 6 characters', 'Level123#$%', 200],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isMinLenWithTrim', { string: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isMaxLenWithTrim', () => {
    const paramsArray = [
      ['Valid: String with a length of maximum 100 characters', 'abcdefhij', 200],
      ['Valid: String with a length of maximum 100 characters', '1234567890', 200],
      ['Valid: Empty string', '', 200],
      ['Valid: Undefined test case.', , 200],
      [
        'Invalid: string should not contain more than 100 characters.',
        'abcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijaabcdefhijabcdefhijbcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijaabcdefhijabcdefhijbcdefhijabcdefhij',
        422,
      ],
      [
        'Invalid: string should not contain more than 100 characters.',
        '1234567890123456789012345678901234567890123456789012345678901231234567890123456789012345678904567890123456789012345678901234567890123456789012345678901234567890123456789012312345678901234567890123456789045678901234567890',
        422,
      ],
      [
        'Invalid: string should not contain more than 100 characters.',
        '@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%##$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%##$%#$%#@#%#$%#$%#',
        422,
      ],
      ['Valid: string can contain period.', 'abcd.efgh', 200],
      ['Valid: string can contain period.', '1234.5678', 200],
      ['Valid: string can contain period.', '$%&#.%&$', 200],
      ['Valid: String with a length of maximum 100 characters.', '$%&#%&$', 200],
      ['Valid: String with a length of maximum 100 characters.', '123456', 200],
      ['Valid: string can contain spaces.', 'abc123de   fg123hij', 200],
      ['Valid: String with a length of maximum 100 characters', 'Level@#$$%', 200],
      ['Valid: String with a length of maximum 100 characters', 'Level123#$%', 200],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isMaxLenWithTrim', { string: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidStrLenWithTrim', () => {
    const paramsArray = [
      ['Valid: String with a length between 0 to 100 characters', 'abcdefghijklmo', 200],
      ['Valid: String with a length between 0 to 100 characters.', '$%&#%&$', 200],
      ['Valid: String with a length between 0 to 100 characters.', '123456', 200],
      ['Valid: Empty string', '', 200],
      ['Valid: Undefined test case.', , 200],
      [
        'Invalid: string should not contain more than 100 characters.',
        'abcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijaabcdefhijabcdefhijbcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijaabcdefhijabcdefhijbcdefhijabcdefhij',
        422,
      ],
      [
        'Invalid: string should not contain more than 100 characters.',
        '1234567890123456789012345678901234567890123456789012345678901231234567890123456789012345678904567890123456789012345678901234567890123456789012345678901234567890123456789012312345678901234567890123456789045678901234567890',
        422,
      ],
      [
        'Invalid: string should not contain more than 100 characters.',
        '@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%##$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%##$%#$%#@#%#$%#$%#',
        422,
      ],
      ['Valid: string can contain period.', 'abcd.efgh', 200],
      ['Valid: string can contain period.', '1234.5678', 200],
      ['Valid: string can contain period.', '$%&#.%&$', 200],
      ['Valid: string can contain spaces.', 'abc123de   fg123hij', 200],
      ['Valid: String with a length of maximum 100 characters', 'Level@#$$%', 200],
      ['Valid: String with a length of maximum 100 characters', 'Level123#$%', 200],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidStrLenWithTrim', { string: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isNumeric', () => {
    const paramsArray = [
      ['Valid: Numerical value', '12345678', 200],
      ['Valid: Numerical value.', '123.456', 200],
      ['Invalid: Empty string', '', 422],
      ['Valid: Undefined test case.', , 422],
      [
        'Invalid: No aphabets allowed!',
        'abcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijaabcdefhijabcdefhijbcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijabcdefhijaabcdefhijabcdefhijbcdefhijabcdefhij',
        422,
      ],
      [
        'Invalid: No special characters allowed!.',
        '@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%##$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%##$%#$%#@#%#$%#$%#',
        422,
      ],
      ['Invalid: No hyphen allowed!', '1234-5678', 422],

      ['Invalid: no spaces allowed!', 'abc123de   fg123hij', 422],
      ['Invalid: Invalid format', 'Level@#$$%', 422],
      ['Invalid: Invalid format', 'Level123#$%', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isNumeric', { number: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidCompanyCode', () => {
    const paramsArray = [
      ['Valid: Valid company code is string between 3 to 20 characters.', 'companycode', 200],
      ['Valid: Valid company code is string between 3 to 20 characters.', '123456', 200],
      ['Valid: Valid company code is minimum between 3 to 20  characters.', '@#$!@#%', 200],
      ['Valid: Valid company code is string min 3 characters.', 'c1@', 200],
      ['Valid: Valid company code is string max 20 characters.', 'companycode123456789', 200],
      ['Invalid: Empty company code', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: company code cannot be more than 20 characters', 'companycodeabscfgetsaodh', 422],
      ['Invalid: company code cannot be more than 20 characters', '1234567890123456780933', 422],
      ['Invalid: company code cannot be more than 20 characters', '!@#$^%$@!@##$%^^#@!@@##$%%%^%$##', 422],

      ['Invalid: company code cannot be more than 20 characters', 'companycode123456789@#$%@', 422],
      ['Invalid: company code cannot be less than 3 characters', 'co', 422],
      ['Invalid: company code cannot be less than 3 characters', '1', 422],
      ['Invalid: company code cannot be less than 3 characters', '$', 422],

      ['Invalid: company code cannot be less than 3 characters', 'c#', 422],
      ['Valid: company code can contain period.', 'abcd.efgh', 200],
      ['Valid: company code can contain period.', '1234.5678', 200],
      ['Valid: company code can contain period.', '$%&#.%&$', 200],
      ['Valid: company code can contain spaces.', 'abc123de   fg123hij', 200],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidCompanyCode', { code: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isWithinRange', () => {
    const paramsArray = [
      ['Valid: Valid value between 0 and 100000', '1234', 200],
      ['Invalid: Valid value between 0 and 100000', '123.456', 422],
      ['Invalid: Empty string', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: Invalid because value greater than 10000', '12345678', 422],
      ['Invalid: Invalid because value less than 0', '-1234', 422],

      ['Invalid: No aphabets allowed!', 'abcdefhijabcdefhijabcdefhijabcdefj', 422],
      ['Invalid: No special characters allowed!.', '@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@', 422],
      ['Invalid: No hyphen allowed!', '1234-568', 422],
      ['Invalid: no spaces allowed!', '1234  567', 422],
      ['Invalid: Invalid format', 'Level@#$$%', 422],
      ['Invalid: Invalid format', 'Level123#$%', 422],
      ['Invalid: Invalid format', 'Level123#$%', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isWithinRange', { number: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });
  describe('isBoolean', () => {
    const paramsArray = [
      ['Valid: Valid boolean value is:', '0', 200],
      ['Valid: Valid boolean value is:', '1', 200],
      ['Valid: Valid boolean value is:', 'true', 200],
      ['Valid: Valid boolean value is:', 'false', 200],

      ['Invalid: No decimals allowed', '123.456', 422],
      ['Invalid: Empty string', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: Only 0 or 1 or true or false allowed!', '12345678', 422],
      ['Invalid: Only 0 or 1 or true or false allowed!', '-1234', 422],

      ['Invalid: No aphabets allowed!', 'abcdefhijabcdefhijabcdefhijabcdefj', 422],
      ['Invalid: No special characters allowed!.', '@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@#%#$%#$%#@', 422],
      ['Invalid: No hyphen allowed!', '1234-568', 422],
      ['Invalid: no spaces allowed!', '1234  567', 422],
      ['Invalid: Invalid format', 'Level@#$$%', 422],
      ['Invalid: Invalid format', 'Level123#$%', 422],
      ['Invalid: Invalid format', 'Level123#$%', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName} : ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isBoolean', { bool: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidFSJTime', () => {
    const paramsArray = [
      ['Valid: Time in HH:MM:SS format', '13:20:20', 200],
      ['Valid:  Time in HH:MM:SS format', '01:20:20', 200],
      ['Invalid:  24 hour clock only', '56:10:20', 422],

      ['Invalid: Empty', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: More than 2 digits in hour', '011:20:20', 422],
      ['Invalid: Less than 2 digits in hour', '1:20:20', 422],
      ['Invalid: Less than 2 digits in minutes', '01:2:20', 422],
      ['Invalid: More than 2 digits in minutes', '01:201:20', 422],
      ['Invalid: Less than 2 digits in seconds', '01:20:2', 422],
      ['Invalid: More than 2 digits in seconds', '01:20:202', 422],
      ['Invalid: alphabets not allowed', 'abcdef', 422],
      ['Invalid: special characters not allowed', '!@#$%^', 422],
      ['Invalid: Correct time with hyphen', '13-20-20', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName}: ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidFSJTime', { time: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidFutureDateTodayAllowed', () => {
    const paramsArray = [
      ['Valid: Date containing valid YYYY-MM-DD format', '2020-08-18', 200],
      ['Valid:  Today date allowed', hf.getFSJFormatToday(), 200],
      ['Valid:  Feb Leap Year ', '2020-02-29', 200],
      ['Invalid:  Invalid Feb date', '2021-02-30', 422],
      ['Invalid : Invalid Month', '2021-20-30', 422],
      ['Invalid: Empty', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: More than 4 YYYY', '20217-04-12', 422],
      ['Invalid: Less than 4 YYYY', '201-04-12', 422],
      ['Invalid: Less than 2 MM', '2021-0-12', 422],
      ['Invalid: More than 2 MM', '2021-012-12', 422],
      ['Invalid: Less than 2 DD', '2021-04-2', 422],
      ['Invalid: More than 2 DD', '2021-04-222', 422],
      ['Invalid: alphabets not allowed', 'abcedf', 422],
      ['Invalid: special characters not allowed', '!@#$%^', 422],
      ['Invalid: Correct date with slash', '2021/04/222', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName}: ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidFutureDateTodayAllowed', { date: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidFutureDateTodayNotAllowed', () => {
    const paramsArray = [
      ['Valid: Date containing valid YYYY-MM-DD format', '2021-08-18', 200],
      ['Valid:  Feb Leap Year ', '2020-02-29', 200],
      ['Invalid:  Today date not allowed', hf.getFSJFormatToday(), 422],
      ['Invalid:  Invalid Feb date', '2021-02-30', 422],
      ['Invalid : Invalid Month', '2021-20-30', 422],
      ['Invalid: Empty', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: More than 4 YYYY', '20217-04-12', 422],
      ['Invalid: Less than 4 YYYY', '201-04-12', 422],
      ['Invalid: Less than 2 MM', '2021-0-12', 422],
      ['Invalid: More than 2 MM', '2021-012-12', 422],
      ['Invalid: Less than 2 DD', '2021-04-2', 422],
      ['Invalid: More than 2 DD', '2021-04-222', 422],
      ['Invalid: alphabets not allowed', 'abcedf', 422],
      ['Invalid: special characters not allowed', '!@#$%^', 422],
      ['Invalid: Correct date with slash', '2021/04/222', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName}: ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidFutureDateTodayNotAllowed', { date: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidPastDateTodayNotAllowed', () => {
    const paramsArray = [
      ['Valid: Date containing valid YYYY-MM-DD format', '2018-08-18', 200],
      ['Invalid:  Today date not allowed', hf.getFSJFormatToday(), 422],
      ['Valid:  Feb Leap Year ', '2016-02-29', 200],
      ['Invalid:  Invalid Feb date', '2021-02-30', 422],
      ['Invalid : Invalid Month', '2021-20-30', 422],
      ['Invalid: Empty', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: More than 4 YYYY', '20211-04-12', 422],
      ['Invalid: Less than 4 YYYY', '202-04-12', 422],
      ['Invalid: Less than 2 MM', '2021-0-12', 422],
      ['Invalid: More than 2 MM', '2021-012-12', 422],
      ['Invalid: Less than 2 DD', '2021-04-2', 422],
      ['Invalid: More than 2 DD', '2021-04-222', 422],
      ['Invalid: alphabets not allowed', 'abcedf', 422],
      ['Invalid: special characters not allowed', '!@#$%^', 422],
      ['Invalid: Correct date with slash', '2021/04/222', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName}: ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidPastDateTodayNotAllowed', { date: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('isValidPastDateTodayAllowed', () => {
    const paramsArray = [
      ['Valid: Date containing valid YYYY-MM-DD format', '2018-08-18', 200],
      ['Valid:  Feb Leap Year ', '2016-02-29', 200],
      ['Valid:  Today date allowed', hf.getFSJFormatToday(), 200],
      ['Invalid:  Invalid Feb date', '2017-02-30', 422],
      ['Invalid : Invalid Month', '2017-20-30', 422],
      ['Invalid: Empty', '', 422],
      ['Valid: Undefined test case.', , 422],
      ['Invalid: More than 4 YYYY', '20177-04-12', 422],
      // ['Invalid: Less than 4 YYYY', '201-04-12', 422],
      ['Invalid: Less than 2 MM', '2017-0-12', 422],
      ['Invalid: More than 2 MM', '2017-012-12', 422],
      ['Invalid: Less than 2 DD', '2017-04-2', 422],
      ['Invalid: More than 2 DD', '2017-04-222', 422],
      ['Invalid: alphabets not allowed', 'abcedf', 422],
      ['Invalid: special characters not allowed', '!@#$%^', 422],
      ['Invalid: Correct date with slash', '2017/04/222', 422],
    ];
    paramsArray.forEach(([testName, value, expectedStatus]) => {
      it(`${testName}: ${value}`, async () => {
        const response = await server.GET('/QA/validator_sanitizer/isValidPastDateTodayAllowed', { date: value });
        expect(response.status).toBe(expectedStatus);
      });
    });
  });
});
