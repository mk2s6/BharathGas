const express = require('express');
const vs = require('../../model/validator-sanitizer');
const responseGenerator = require('../../model/response-generator');
const constant = require('../../model/constant');
const error = require('../../model/error');
const hf = require('../../model/helper-function');

const router = express.Router();

/**
 * This route is used by developer to check for the valid date
 */
router.get('/isValidFSJDate', [vs.isValidFSJDate('query', 'date')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['date'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Date Validator', 'Date Validator validation Success', {}));
});

/**
 * This route is used by developer for checking for valid email format
 */
router.get('/isEmail', [vs.isEmail('query', 'email')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['email'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Email Validator', 'Email Validator validation Success', {}));
});

/**
 * This route is used by developer for checking if email exists, then the format must be as
 specified */
router.get('/ifExistIsEmail', [vs.ifExistIsEmail('query', 'email')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['email'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('If exists email Validator', 'If exists email Validator validation Success', {}));
});

/**
 * This route is used by developer for checking for valid mobile number.
 */
router.get('/isMobile', [vs.isMobile('query', 'mobile')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['mobile'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Mobile Validator', 'Mobile Validator validation Success', {}));
});

/**
 * This route is used by developer for checking that if the mobile number exists, then the format
 * should be as specified.
 */
router.get('/ifExistIsMobile', [vs.ifExistIsMobile('query', 'mobile')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['mobile'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('If exists Mobile Validator', 'If exists Mobile Validator validation Success', {}));
});

/**
 * This route is used by developer for testing valid email and mobile
 */
router.get('/isEmailOrMobile', [vs.isEmailOrMobile('query', 'username')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['username'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Is email-id or Mobile Validator', 'Is email-id or Mobile Validator validation Success', {}));
});

/**
 * This route is used by developer for testing whether the valid gender has been added or not
 */
router.get('/isGender', [vs.isGender('query', 'gender')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['gender'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Gender Validator', 'Gender Validator validation Success', {}));
});

/**
 * This route is used by developer for testing the valid format for date of birth
 */
router.get('/isDOB', [vs.isDOB('query', 'date')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['date'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('DOB Validator', 'DOB Validator validation Success', {}));
});

/**
 * This route is used by developer for testing the valid password format-aleast 1 capital, 1 small,
 * 1 number, 1 special character, and 8+ characters long
 */
router.get(
  '/isEmpPassword',
  [vs.isEmpPassword('query', 'password', constant.passwordValidatorResponses.EMPLOYEE_REGISTER_PASSWORD_RESPONSE)],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['password'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    return res.status(200).send(responseGenerator.success('Employee Password Validator', 'Employee Password Validator validation Success', {}));
  },
);

/**
 * This route is used by developer for testing the valid password format-aleast 1 capital, 1 small,
 * 1 number, 1 special character.
 */
router.get(
  '/isCompanyEmployeePassword',
  [vs.isCompanyEmployeePassword('query', 'password', constant.passwordValidatorResponses.COMPANY_EMPLOYEE_REGISTER_PASSWORD_RESPONSE)],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['password'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    return res
      .status(200)
      .send(responseGenerator.success('Company Employee Password Validator', 'Company Employee Password Validator validation Success', {}));
  },
);

/**
 * This route is used by developer for checking the amount is numeric or not
 */
router.get('/isAmount', [vs.isAmount('query', 'amount', 'Please enter a valid amount value')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['amount'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Amount Validator', 'Amount Validator validation Success', {}));
});

/**
 * This route is used by developer for testing the branches entered in valid format
 */
router.post('/isBranches', [vs.isBranches('body', 'branches')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['branches'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Branches Validator', 'Branches Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of enquiry as positive or negative
 */
router.get('/isValidEnquiryClassification', [vs.isValidEnquiryClassification('query', 'classification')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['classification'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Valid Classification Validator', 'Valid Classification Validator validation Success', {}));
});

/**
 * This route is used by developer for checking the format of pincode
 */
router.get('/isPINCODE', [vs.isPINCODE('query', 'pincode')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['pincode'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Pin-Code Validator', 'Pin-Code Validator validation Success', {}));
});

/**
 * This route is used by developer for testing that if pincode exists, it should have valid format
 */
router.get('/ifExistIsPINCODE', [vs.ifExistIsPINCODE('query', 'pincode')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['pincode'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('If exists Pin-Code Validator', 'If exists Pin-Code Validator validation Success', {}));
});

/**
 * This route is used by developer for checking if the status is converted, in-progress, or loss
 */
router.get('/isValidEnquiryStatus', [vs.isValidEnquiryStatus('query', 'status')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['status'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Valid Enquiry status Validator', 'Valid Enquiry status Validator validation Success', {}));
});

/**
 * This route is used by developer for testing if the enquiry exists, it should have valid format
 */
router.get('/ifExistIsValidEnquiryStatus', [vs.ifExistIsValidEnquiryStatus('query', 'status')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['status'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res
    .status(200)
    .send(responseGenerator.success('If exists Valid Enquiry status Validator', 'If exists Valid Enquiry status Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of existence of parameters
 */
router.get('/isExist', [vs.isExist('query', 'parameter', "The entered parameter doesn't exist")], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['parameter'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('If exists Validator', 'If exists Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of string with exact length
 */
router.get(
  '/isExactLenWithTrim',
  [vs.isExactLenWithTrim('query', 'string', 10, 'Please enter a string with exactly 10 characters in length')],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['string'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    return res
      .status(200)
      .send(responseGenerator.success('Exact length with trim Validator', 'Exact length with trim Validator validation Success', {}));
  },
);

/**
 * This route is used by developer for quick testing of minimum length of string
 */
router.get(
  '/isMinLenWithTrim',
  [vs.isMinLenWithTrim('query', 'string', 6, 'Please enter a string with minimum of 6 characters')],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['string'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    return res
      .status(200)
      .send(responseGenerator.success('Minimum length with trim Validator', 'Minimum length with trim Validator validation Success', {}));
  },
);

/**
 * This route is used by developer for quick testing of maximum length of string
 */
router.get(
  '/isMaxLenWithTrim',
  [vs.isMaxLenWithTrim('query', 'string', 100, 'Please enter a string of maximum 100 characters only')],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['string'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    return res
      .status(200)
      .send(responseGenerator.success('Maximum length with trim Validator', 'Maximum length with trim Validator validation Success', {}));
  },
);

/**
 * This route is used by developer for quick testing of valid length of string
 */
router.get(
  '/isValidStrLenWithTrim',
  [vs.isValidStrLenWithTrim('query', 'string', 0, 100, 'Please enter a string with length between 0 to 100 characters only')],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['string'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    return res
      .status(200)
      .send(responseGenerator.success('Valid string length with trim Validator', 'Valid string length with trim Validator validation Success', {}));
  },
);

/**
 * This route is used by developer for quick testing of valid number
 */
router.get('/isNumeric', [vs.isNumeric('query', 'number', 'Please enter a valid number')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['number'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Numeric Validator', 'Numeric Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of vald company code between 3-20 characters
 */
router.get('/isValidCompanyCode', [vs.isValidCompanyCode('query', 'code')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['code'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Company code Validator', 'Company code Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of numeric entry within 0-100000 range
 */
router.get('/isWithinRange', [vs.isWithinRange('query', 'number', 0, 100000, 'Please enter a value between 0 and 100000')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['number'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Number in range Validator', 'Number in range Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of valid Boolean vales, 1,0,true,false
 */
router.get('/isBoolean', [vs.isBoolean('query', 'bool', 'Please enter a valid boolean value')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['bool'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Boolean Validator', 'Boolean Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of time in valid format
 */
router.get('/isValidFSJTime', [vs.isValidFSJTime('query', 'time')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['time'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.status(200).send(responseGenerator.success('Time Validator', 'Time Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of date of future today not allowed
 */
router.get('/isValidFutureDateTodayNotAllowed', [vs.isValidFutureDateTodayNotAllowed('query', 'date')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['date'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res
    .status(200)
    .send(
      responseGenerator.success('Future date and today not allowed Validator', 'Future date and today not allowed Validator validation Success', {}),
    );
});

/**
 * This route is used by developer for quick testing of date of future today allowed
 */
router.get('/isValidFutureDateTodayAllowed', [vs.isValidFutureDateTodayAllowed('query', 'date')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['date'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res
    .status(200)
    .send(responseGenerator.success('Future date and today allowed Validator', 'Future date and today allowed Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of date of past today not allowed
 */
router.get('/isValidPastDateTodayNotAllowed', [vs.isValidPastDateTodayNotAllowed('query', 'date')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['date'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res
    .status(200)
    .send(responseGenerator.success('Past date and today not allowed Validator', 'Past date and today not allowed Validator validation Success', {}));
});

/**
 * This route is used by developer for quick testing of date of past today allowed
 */
router.get('/isValidPastDateTodayAllowed', [vs.isValidPastDateTodayAllowed('query', 'date')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['date'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res
    .status(200)
    .send(responseGenerator.success('Past date and today allowed Validator', 'Past date and today allowed Validator validation Success', {}));
});

module.exports = router;
