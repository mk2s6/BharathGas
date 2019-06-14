/**
 * This modules defines helper function needed for generating
 * consistent response objects. These are needed to have consistency
 * in the response we send to client.
 */

// TO IMPORT: const responseGenerator = require('./response-generator');
const constant = require('./constant');

//
// My Error Response JSON Object:
// https://google.github.io/styleguide/jsoncstyleguide.xml?showone=error#error
// {
//  "error": {
//   "type": "VALIDATION/SERVER INTERNAL",
//   "code": ,
//   "message": , // Top level message we need to send to client
//   "errors": [ // Multiple errors only make sense in validation error.
//      {
//        "message": ,
//        "field": "<Optional When internal server error> Represent filed name HTML From",
//        "location": "<Optional> body/header/queryString"
//      },
//      {
//        "message": ,
//        "field": "<Optional When internal server error> Represent filed name HTML From",
//        "location": "<Optional> body/header/queryString"
//      },
// ]
//  }
// }
//

// GENERATE ERROR RESPONSE
/**
 * Generate errors object which can be added to original error response.
 * This is only needed for validation errors for now.
 * Note that errors (plural) is part of error response.
 *
 * @param {string} errMessage Error to be send to client
 * @param {string} errField Field from the request object responsible for this error
 * @param {string} errLocation Path in request object from which error is thrown
 *
 * @returns This is constructor function and called with new operator
 */
function ErrorsObj(errMessage, errField, errLocation) {
  this.message = errMessage;
  this.field = errField;
  this.location = errLocation;
}

/**
 * Generate error response to be send to client. This is mostly used in cases
 * when we are not able to classify the type of error.
 *
 * @param errType Error type defined in shared Constants from public/javascript/constant
 * @param {number} errCode Error code used for reporting error to development team
 * @param {string} errMessage Error to be send to client
 * @param {string} errField Field from the request object responsible for this error
 * @param {string} errLocation Path in request object from which error is thrown
 */
function errorResponse(errType, errCode, errMessage, errField = '', errLocation = '') {
  return {
    type: errType,
    code: errCode,
    message: errMessage,
    errors: [new ErrorsObj(errMessage, errField, errLocation)],
  };
}

//
// NOTE Below four function has lot of duplicate and can be combined into
// single function but don't merge them as different function name provide
// readability and if we want to modify something in future specific to
// functionality we can do that easily.
//
/**
 * Convert internal error object into error response.
 * Error objects are defined into model/error.js file.
 *
 * @param errListObj Internal Error Object from error.js file
 */
function internalError(errListObj) {
  return {
    type: constant.errType.INTERNAL_ERROR,
    code: errListObj.code,
    message: errListObj.message,
    errors: [],
  };
}

/**
 * Convert database error object into error response.
 * Error objects are defined into model/error.js file.
 *
 * @param errListObj database Error Object from error.js file
 */
function dbError(errListObj) {
  return {
    type: constant.errType.DB_ERROR,
    code: errListObj.code,
    message: errListObj.message,
    errors: [],
  };
}

/**
 * Convert fatal error object into error response.
 * Error objects are defined into model/error.js file.
 *
 * @param errListObj fatal Error Object from error.js file
 */
function fatalError(errListObj) {
  return {
    type: constant.errType.FATAL_ERROR,
    code: errListObj.code,
    message: errListObj.message,
    errors: [],
  };
}

/**
 * Convert Authentication & Authorization error object into error response.
 * Error objects are defined into model/error.js file.
 *
 * @param errListObj Auth Error Object from error.js file
 */
function authError(errListObj) {
  return {
    type: constant.errType.AUTH_ERROR,
    code: errListObj.code,
    message: errListObj.message,
    errors: [],
  };
}

/**
 * Convert validation result into error response.
 *
 * @param mappedErrors validation result object from validator-sanitizer module
 * @param {array} fields filed array containing names of fields present in validation result
 */
function validationError(mappedErrors, fields) {
  const errObj = {
    type: constant.errType.VALIDATION_ERROR,
    code: '',
    message: 'Validation failure.',
    errors: [],
  };
  // Iterate through all errors we have
  for (let i = 0; i < fields.length; i += 1) {
    if (mappedErrors[fields[i]]) {
      const err = mappedErrors[fields[i]];
      errObj.errors.push(new ErrorsObj(err.msg, fields[i], err.location));
    }
  }
  return errObj;
}

//
// My Success response object:
// http://google.github.io/styleguide/jsoncstyleguide.xml?showone=data.kind#data.kind
// {
//   "data": {
//     "kind": ,
//     "description": ,
//     "items": [
//      { Object 1 },
//      { Object 2 },
//      ]
//   }
// }
//

// GENERATE SUCCESS RESPONSE

/**
 * Generate Success response for front end
 *
 * @param {string} resKind
 * @param {string} resDescription
 * @param {array} resItems
 */
function success(resKind, resDescription, resItems) {
  return {
    data: {
      kind: resKind,
      description: resDescription,
      items: resItems,
    },
  };
}

// EXPORTING FUNCTIONALITY

module.exports.errorResponse = errorResponse;
module.exports.internalError = internalError;
module.exports.dbError = dbError;
module.exports.fatalError = fatalError;
module.exports.validationError = validationError;
module.exports.authError = authError;

module.exports.success = success;
