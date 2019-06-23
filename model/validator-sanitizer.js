/**
 * This is module which deals with validation and sanitization of input form the user.
 * This way we can separate validation logic into separate module.
 * We are using express-validator package.
 * See documentation: https://www.npmjs.com/package/express-validator
 *
 * GLOSSARY:
 * Location: refer to location from request object like body, cookies, params, header and query
 */

// NOTE:
// - isValidStrLenWithTrim This works with undefined strings too when min length is 0.

// TO IMPORT: const vs = require('../../model/validator-sanitizer');

const {
  check, body, cookie, header, param, query, validationResult,
} = require('express-validator/check');
const PasswordValidator = require('password-validator');
const validatorLibrary = require('validator');
const hf = require('./helper-function');
const constant = require('./constant');
// const error = require('./error');
// const responseGenerator = require('./response-generator');
// const pool = require('../database/db');

// ======================================================================
// PRIVATE API FOR THIS MODULE
// ======================================================================

// This is needed because if we pass variable from other module it does not
// recognize it as function hence we can't call it with () i.e. location() will give error
function getFunctionName(location) {
  switch (location) {
    case 'body':
      return body;
    case 'cookie':
      return cookie;
    case 'header':
      return header;
    case 'param':
      return param;
    case 'query':
      return query;
    // TODO Make default to throw error instead of checking everything
    // This is hit to performance hence we need to avoid using check always.
    // This should be done after we add tests otherwise we will have runtime errors.
    default:
      return check;
  }
}

// ======================================================================
// API RELATED TO VALIDATION CHAIN OBJECT
// ======================================================================

// SPECIFIC API FOR PROPERTY LIKE EMAIL, PASSWORD
// These should not take error message as parameter to be consistent
// across system
/**
 * Email validator which trim
 *
 * @param location
 * @param email
 *
 * @returns validation chain object of express-validator
 */
function isEmail(location, email) {
  const validator = getFunctionName(location);
  return validator(email)
    .isEmail()
    .withMessage('Please enter a valid email-id')
    .isLength({ max: 150 })
    .withMessage('Email should not exceed maximum of 150 characters length')
    .trim();
}

/**
 * If field exist then validate max length of it. Mostly used for optional field.
 *
 * @param location
 * @param field
 * @param message Custom message
 *
 * @returns validation chain object of express-validator
 */
function ifExistIsEmail(location, field) {
  const validator = getFunctionName(location);
  return validator(field)
    .custom((paramField) => {
      // only using obj === null will work but this is just for 'undefined' readability
      // https://stackoverflow.com/a/2647888
      if (paramField === undefined || paramField === null || paramField === '') {
        return true;
      }
      validatorLibrary.trim(paramField);
      if (validatorLibrary.isEmail(paramField)) {
        return true;
      }
      return false;
    })
    .withMessage('Please enter valid email');
}

/**
 * Mobile Phone validator for Indian locale
 *
 * @param location
 * @param mobileNumber
 *
 * @returns validation chain object of express-validator
 */
function isMobile(location, mobileNumber) {
  const validator = getFunctionName(location);
  return validator(mobileNumber)
    .isMobilePhone('en-IN')
    .withMessage('Mobile number is not valid please check if you have entered a 10 digit mobile number');
}

/**
 * If field exist then validates whether the mobile number is valid or not
 *
 * @param location
 * @param field
 *
 * @returns validation chain object of express-validator
 */
function ifExistIsMobile(location, field) {
  const validator = getFunctionName(location);
  return validator(field)
    .custom((paramField) => {
      // only using obj === null will work but this is just for 'undefined' readability
      // https://stackoverflow.com/a/2647888
      if (paramField === undefined || paramField === null || paramField === '') {
        return true;
      }
      validatorLibrary.trim(paramField);
      if (validatorLibrary.isMobilePhone(paramField, 'en-IN')) {
        return true;
      }
      return false;
    })
    .withMessage('Please enter valid mobile number');
}

/**
 * Username validator which check whether the username provided is either email or mobile
 *
 * @param location
 * @param username
 *
 * @returns validation chain object of express-validator
 */
function isEmailOrMobile(location, username) {
  const validator = getFunctionName(location);
  return validator(username)
    .custom((paramUsername) => {
      if (validatorLibrary.isEmail(paramUsername) || validatorLibrary.isMobilePhone(paramUsername, 'en-IN')) {
        return true;
      }
      return false;
    })
    .withMessage('Please provide valid a email-id or a phone number as the username');
}

/**
 * Gender validator
 *
 * @param location
 * @param gender
 *
 * @returns validation chain object of express-validator
 */
function isGender(location, gender) {
  const validator = getFunctionName(location);
  return validator(gender)
    .isIn(['Male', 'Female'])
    .withMessage('please provide a valid gender');
}

/**
 * Date of birth validator
 *
 * @param location
 * @param dob in DB date format i.e. "YYYY-MM-DD".
 *
 * @returns validation chain object of express-validator
 */
function isDOB(location, dob) {
  const validator = getFunctionName(location);
  return validator(dob)
    .custom((paramDOB) => {
      // TODO we should not allow date in future
      if (hf.isDBDateFormat(paramDOB) && paramDOB >= '1940-01-01') {
        return true;
      }
      return false;
    })
    .withMessage('Date of Birth is not valid. DOB should be greater than 01 Jan 1940');
}

//
// Password Validatory code
//
const schemaEmpPassword = new PasswordValidator();
schemaEmpPassword
  .is()
  .min(8)
  .is()
  .max(255)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .symbols()
  .has()
  .not()
  .spaces();

const schemaCompanyEmployeePassword = new PasswordValidator();
schemaCompanyEmployeePassword
  .is()
  .min(8)
  .is()
  .max(255)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces();

/**
 * Password validator: password should have uppercase, lowercase,
 * number and symbol. It should not contain spaces.
 *
 * @param location
 * @param password
 *
 * @returns validation chain object of express-validator
 */
function isEmpPassword(location, password, message) {
  const validator = getFunctionName(location);
  return validator(password).custom((paramPassword) => {
    if (!schemaEmpPassword.validate(paramPassword)) throw new Error(message);
    return true;
  });
}

/**
 * Password validator: password should have uppercase, lowercase
 * and number. It should not contain spaces.
 *
 * @param location
 * @param password
 *
 * @returns validation chain object of express-validator
 */
function isDistributorPassword(location, password, message) {
  const validator = getFunctionName(location);
  return validator(password).custom((paramPassword) => {
    if (!schemaCompanyEmployeePassword.validate(paramPassword)) throw new Error(message);
    return true;
  });
}

/**
 * Validates the entered country to be a valid country
 *
 * @param location
 * @param country
 *
 */
// function isValidCountry(location, country) {
//   const validator = getFunctionName(location);
//   return validator(country)
//     .custom(async (country) => {
//       const beCountry = country || null;
//       try {
//         const [rows] = await pool.execute(
//           'SELECT country FROM lt_country WHERE country = ?',
//           [beCountry],
//         );
//         if (rows.length === 1) return true;
//         return false;
//       } catch (e) {
//         const beValidateCountrySelectError = error.errList.internalError.ERR_COUNTRY_VALIDATION_SELECT_FAILURE;
//         return res
//           .status(500)
//           .send(responseGenerator.internalError(beValidateCountrySelectError));
//       }
//     })
//     .withMessage('Please select a valid country');
// }

/**
 * Validates the entered state to be a valid state
 *
 * @param location
 * @param state
 *
 */
// function isValidState(location, state) {
//   const validator = getFunctionName(location);
//   return validator(state)
//     .custom(async state => {
//       const beState = state || null;
//       try {
//         const [rows] = await pool.execute(
//           `SELECT state FROM lt_state WHERE state = ?`,
//           [beState]
//         );
//         if (rows.length === 1) return true;
//         return false;
//       } catch (e) {
//         const beValidateStateSelectError =
//           error.errList.internalError.ERR_STATE_VALIDATION_SELECT_FAILURE;
//         return res
//           .status(500)
//           .send(responseGenerator.internalError(beValidateStateSelectError));
//       }
//     })
//     .withMessage('Please select a valid state');
// }

/**
 * Check if field is valid Amount.
 * Only two digits after decimal point is allowed.
 * We do not allow any separator like ','
 *
 * @param location
 * @param fieldName
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isAmount(location, fieldName, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .isCurrency({ allow_negatives: false }) // To check if it is valid currency
    .isFloat() // To not allow separator ',' as it make DB inconsistent
    .withMessage(message);
}

function isBranches(location, branchArray) {
  const validator = getFunctionName(location);
  const message = "Branches should be a array of branch id's";
  return validator(branchArray)
    .isArray()
    .withMessage(message)
    .custom((paramBranchArray) => {
      let flag = true;
      paramBranchArray.forEach((branchId) => {
        // console.log(typeof branchId);
        if (typeof branchId === 'number') {
          flag = true;
        } else {
          flag = false;
          throw new Error(message);
        }
      });
      return flag;
    })
    .withMessage(message);

  // throw new error();
}

/**
 * Gender validator
 *
 * @param location
 * @param enquiry_classification
 *
 * @returns validation chain object of express-validator
 */
function isValidEnquiryClassification(location, enquiryClassification) {
  const validator = getFunctionName(location);
  return validator(enquiryClassification)
    .isIn(['Positive', 'Negative'])
    .withMessage('Enquiry Classification is not valid');
}

/**
 * PINCODE validator which require pincode should be exactly 6 characters and numeric
 *
 * @param location
 * @param pincode
 *
 * @returns validation chain object of express-validator
 */
function isPINCODE(location, pincode) {
  const message = 'Characters are not allowed in pin code, pincode contains only numeric digits!';
  const validator = getFunctionName(location);
  return validator(pincode)
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage(message)
    .isNumeric()
    .withMessage(message);
}

/**
 * Optional PINCODE validator, if PINCODE is specified then it should be exactly 6 characters and numeric
 *
 * @param location
 * @param pincode
 *
 * @returns validation chain object of express-validator
 */
function ifExistIsPINCODE(location, pincode) {
  const message = 'Invalid Pincode Provided, it should be numeric and exactly 6 characters long.';
  const validator = getFunctionName(location);
  return validator(pincode)
    .custom((paramPincode) => {
      // only using obj === null will work but this is just for 'undefined' readability
      // https://stackoverflow.com/a/2647888
      if (paramPincode === undefined || paramPincode === null || paramPincode === '') {
        return true;
      }
      validatorLibrary.trim(paramPincode);
      if (validatorLibrary.isNumeric(paramPincode) && validatorLibrary.isLength(paramPincode, { min: 6, max: 6 })) {
        return true;
      }
      return false;
    })
    .withMessage(message);
}

/**
 * Check if the enquiry status is valid. Enquiry status is FK in lt table hence values must match
 *
 * @param location
 * @param pincode
 *
 * @returns validation chain object of express-validator
 */
function isValidEnquiryStatus(location, status) {
  const message = 'Invalid Enquiry Status Provided.';
  const validator = getFunctionName(location);
  return validator(status)
    .isIn([constant.enquiryStatus.CONVERTED, constant.enquiryStatus.LOSS])
    .withMessage(message);
}

/**
 * Check if the enquiry status is valid. Enquiry status is FK in lt table hence values must match
 *
 * @param location
 * @param pincode
 *
 * @returns validation chain object of express-validator
 */
function ifExistIsValidEnquiryStatus(location, status) {
  const message = 'Invalid Enquiry Status Provided.';
  const validator = getFunctionName(location);
  return validator(status)
    .isIn([constant.enquiryStatus.IN_PROGRESS, constant.enquiryStatus.CONVERTED, constant.enquiryStatus.LOSS, '', undefined, null])
    .withMessage(message);
}

/**
 * Check if the due filter is valid.
 *
 * @param location
 * @param type
 *
 * @returns validation chain object of express-validator
 */
function ifExistIsValidDueFilterType(location, type) {
  const message = 'Invalid due filter type Provided.';
  const validator = getFunctionName(location);
  return validator(type)
    .isIn([constant.dueFilterTypes.DUE_TODAY, constant.dueFilterTypes.DUE_FUTURE, constant.dueFilterTypes.DUE_TODAY_AND_OVERDUE, '', undefined, null])
    .withMessage(message);
}

/**
 * Check if the employee role list type is valid.
 *
 * @param location
 * @param type
 *
 * @returns validation chain object of express-validator
 */
function isValidEmployeeRoleList(location, type) {
  const message = 'Invalid employee role type Provided.';
  const validator = getFunctionName(location);
  return validator(type)
    .isIn([constant.empRoleListTypes.COMPANY, constant.empRoleListTypes.BRANCH])
    .withMessage(message);
}

/**
 * Check if the due filter is valid.
 *
 * @param location
 * @param user
 *
 * @returns validation chain object of express-validator
 */
function ifExistIsValidUserFilter(location, user) {
  const message = 'Invalid user filter Provided.';
  const validator = getFunctionName(location);
  return validator(user)
    .isIn([constant.userFilterTypes.MY, constant.userFilterTypes.ALL, '', undefined, null])
    .withMessage(message);
}

// ==============================================================================
// GENERIC API APPLICABLE FOR ANY PROPERTY
// ==============================================================================

// NOTE:
// - These should take error message as parameter as
//   we don't know why these are used for.

/**
 * Check if field exist i.e. not undefined
 *
 * @param location
 * @param fieldName
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isExist(location, fieldName, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .exists()
    .withMessage(message);
}

/**
 * First trim white spaces on both side and then check
 * if field contain exactly exactLength number of character
 *
 * @param location
 * @param fieldName
 * @param exactLength
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isExactLenWithTrim(location, fieldName, exactLength, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .trim()
    .isLength({ min: exactLength, max: exactLength })
    .withMessage(message);
}

/**
 * First trim white spaces on both side and then check
 * if field contain minimum of minLength character
 *
 * @param location
 * @param fieldName
 * @param minLength
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isMinLenWithTrim(location, fieldName, minLength, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .trim()
    .isLength({ min: minLength })
    .withMessage(message);
}

/**
 * First trim white spaces on both side and then check
 * if field contain maximum of maxLength character
 *
 * @param location
 * @param fieldName
 * @param maxLength
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isMaxLenWithTrim(location, fieldName, maxLength, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .trim()
    .isLength({ max: maxLength })
    .withMessage(message);
}

/**
 * First trim white spaces on both side and then check
 * if field contain minimum of minLength and maximum of maxLength characters.
 * NOTE: This works with undefined strings too when min length is 0.
 *
 * @param location
 * @param fieldName
 * @param minLength
 * @param maxLength
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isValidStrLenWithTrim(location, fieldName, minLength, maxLength, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(message);
}

/**
 * This function validates the company code
 *
 * @param location
 * @param companyCode
 *
 */
function isValidCompanyCode(location, companyCode) {
  const validator = getFunctionName(location);
  return validator(companyCode)
    .isLength({ min: 3, max: 20 })
    .withMessage('The company code must contain alphanumeric characters in range of 6 to 20 characters only!');
}

/**
 * Check if field contains only numbers
 *
 * @param location
 * @param fieldName
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isNumeric(location, fieldName, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .isNumeric()
    .withMessage(message);
}

/**
 * Check if field is integer and within given range [min, max] inclusive
 *
 * @param location
 * @param fieldName
 * @param minValue Minimum allowed value
 * @param maxValue Maximum allowed value
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isWithinRange(location, fieldName, minValue, maxValue, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .isInt({ min: minValue, max: maxValue })
    .withMessage(message);
}

/**
 * Check if field contain boolean value
 *
 * @param location
 * @param fieldName
 * @param message
 *
 * @returns validation chain object of express-validator
 */
function isBoolean(location, fieldName, message) {
  const validator = getFunctionName(location);
  return validator(fieldName)
    .isBoolean()
    .withMessage(message);
}

/**
 * Date validator to check if the date provided is of correct DB date format (YYYY-MM-DD)
 *
 * @param location
 * @param date Format "3012-04-23". This is DB Date format "YYYY-MM-DD"
 *
 * @returns validation chain object of express-validator
 */
function isValidDBDate(location, date) {
  const validator = getFunctionName(location);
  return validator(date)
    .custom((paramDate) => {
      if (hf.isDBDateFormat(paramDate)) {
        return true;
      }
      return false;
    })
    .withMessage('Invalid Date Format. Please specify the date in YYYY-MM-DD format');
}

/**
 * Time validator to check if the time provided is in correct DB time format (HH:mm:ss)
 *
 * @param location
 * @param time Format "20:30:05". This is DB Time format "HH:mm:ss"
 *
 * @returns validation chain object of express-validator
 */
function isValidDBTime(location, time) {
  const validator = getFunctionName(location);
  return validator(time)
    .custom((paramTime) => {
      if (hf.isDBTimeFormat(paramTime)) {
        return true;
      }
      return false;
    })
    .withMessage('Invalid Time Format. Please specify the time in 24-hour clock with HH:mm:ss format.');
}

/**
 * @deprecated
 *
 * Date validator for future date.
 * NOTE: This does not accept today as future date
 *
 * @param location
 * @param date Format "3012-04-23". This is DB Date format "YYYY-MM-DD"
 *
 * @returns validation chain object of express-validator
 */
function isValidFutureDateTodayNotAllowed(location, date) {
  const validator = getFunctionName(location);
  return validator(date)
    .custom((paramDate) => {
      if (!hf.isDBDateFormat(paramDate) || paramDate <= hf.getDBFormatToday()) {
        return false;
      }

      return true;
    })
    .withMessage('Please specify valid date in future. Today is not allowed.');
}

/**
 * @deprecated
 *
 * Date validator for future date.
 * NOTE: Accept today as future date
 *
 * @param location
 * @param date Format "3012-04-23". This is DB Date format "YYYY-MM-DD"
 *
 * @returns validation chain object of express-validator
 */
function isValidFutureDateTodayAllowed(location, date) {
  const validator = getFunctionName(location);
  return validator(date)
    .custom((paramDate) => {
      if (!hf.isDBDateFormat(paramDate) || paramDate < hf.getDBFormatToday()) {
        return false;
      }
      return true;
    })
    .withMessage('Please specify valid date in future.');
}

/**
 * @deprecated
 *
 * Date validator for past date
 * NOTE: This allow today's date as past date
 *
 * @param location
 * @param date Format "3012-04-23". This is DB Date format "YYYY-MM-DD"
 *
 * @returns validation chain object of express-validator
 */
function isValidPastDateTodayAllowed(location, date) {
  const validator = getFunctionName(location);
  return validator(date)
    .custom((paramDate) => {
      if (!hf.isDBDateFormat(paramDate) || paramDate > hf.getDBFormatToday()) {
        return false;
      }
      return true;
    })
    .withMessage('Please specify valid date in past.');
}

/**
 * @deprecated
 *
 * Date validator for past date
 * NOTE: This allow does not allow today's date as past date
 *
 * @param location
 * @param date Format "3012-04-23". This is DB Date format "YYYY-MM-DD"
 *
 * @returns validation chain object of express-validator
 */
function isValidPastDateTodayNotAllowed(location, date) {
  const validator = getFunctionName(location);
  return validator(date)
    .custom((paramDate) => {
      if (!hf.isDBDateFormat(paramDate) || paramDate >= hf.getDBFormatToday()) {
        return false;
      }
      return true;
    })
    .withMessage('Please specify valid date in past. Today is not allowed.');
}

/**
 * Validator to check whether the omc is valid or not
 * @param {omc} object 
 */
function isValidOMC(location, omc) {
  const validator = getFunctionName(location);
  return validator(omc).isIn(constant.omc).withMessage("Please select a valid OMC");
}

/**
 * Validator to check whether the omc is valid or not
 * @param {type} object 
 */
function isValidAvailableCylinderType(location, type, message) {
  const validator = getFunctionName(location);
  return validator(type).isIn(['Kgs', 'Cylinders']).withMessage(message);
}

// ======================================================================
// API RELATED TO VALIDATION RESULT OBJECT
// ======================================================================

/**
 * Return validation results object created after validation checks completes
 *
 * @param object Object on which we ran validation logic (Mostly Request object)
 *
 * @returns validation result object of express-validator
 */
function getValidationResult(object) {
  return validationResult(object);
}

// ======================================================================
// API RELATED TO SANITIZATION
// ======================================================================
/**
 * Trim white spaces on both side and then check
 * if field contain minimum of minLength character
 *
 * @param location
 * @param fieldName
 *
 * @returns validation chain object of express-validator
 */
function trim(location, fieldName) {
  const validator = getFunctionName(location);
  return validator(fieldName).trim();
}

/**
 * Removes the white spaces from the input
 *
 * @param location
 * @param fieldName
 *
 * @returns validation chain object of express-validator
 */
function removeSpaces(location, fieldName) {
  const validator = getFunctionName(location);
  return validator(fieldName).blacklist(' ');
}

/**
 * Export functions logic which should be available outside this module.
 */
module.exports.isEmail = isEmail;
module.exports.ifExistIsEmail = ifExistIsEmail;
module.exports.isMobile = isMobile;
module.exports.ifExistIsMobile = ifExistIsMobile;
module.exports.isEmailOrMobile = isEmailOrMobile;
module.exports.isGender = isGender;
module.exports.isDOB = isDOB;
module.exports.isEmpPassword = isEmpPassword;
module.exports.isDistributorPassword = isDistributorPassword;
module.exports.isAmount = isAmount;
module.exports.isBranches = isBranches;
module.exports.isValidEnquiryClassification = isValidEnquiryClassification;
module.exports.isPINCODE = isPINCODE;
module.exports.ifExistIsPINCODE = ifExistIsPINCODE;
module.exports.isValidEnquiryStatus = isValidEnquiryStatus;
module.exports.ifExistIsValidEnquiryStatus = ifExistIsValidEnquiryStatus;
module.exports.ifExistIsValidDueFilterType = ifExistIsValidDueFilterType;
module.exports.ifExistIsValidUserFilter = ifExistIsValidUserFilter;
module.exports.isValidEmployeeRoleList = isValidEmployeeRoleList;
module.exports.isExist = isExist;
module.exports.isExactLenWithTrim = isExactLenWithTrim;
module.exports.isMinLenWithTrim = isMinLenWithTrim;
module.exports.isMaxLenWithTrim = isMaxLenWithTrim;
module.exports.isValidStrLenWithTrim = isValidStrLenWithTrim;
module.exports.isNumeric = isNumeric;
module.exports.getValidationResult = getValidationResult;
module.exports.isValidCompanyCode = isValidCompanyCode;
module.exports.isWithinRange = isWithinRange;
module.exports.isBoolean = isBoolean;
module.exports.isValidDBDate = isValidDBDate;
module.exports.isValidDBTime = isValidDBTime;
module.exports.isValidAvailableCylinderType = isValidAvailableCylinderType;
module.exports.isValidFutureDateTodayNotAllowed = isValidFutureDateTodayNotAllowed;
module.exports.isValidFutureDateTodayAllowed = isValidFutureDateTodayAllowed;
module.exports.isValidPastDateTodayNotAllowed = isValidPastDateTodayNotAllowed;
module.exports.isValidPastDateTodayAllowed = isValidPastDateTodayAllowed;
module.exports.trim = trim;
module.exports.removeSpaces = removeSpaces;
module.exports.isValidOMC = isValidOMC;
