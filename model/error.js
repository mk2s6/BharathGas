/**
 * This module deal with consistent error messages to send to client.
 * Here we define error messages and error code.
 */

// TO IMPORT: const error = require('./error');

const errMsg = {
  INTERNAL_SERVER_ERROR: 'An internal error has occurred. Please try again!',
  DATABASE_ERROR: 'An internal error has occurred. Please try again!',
};

//
// Why I have added name property which is same as name of object?
// Answer: This is to avoid programming errors, because if we don't have
// name property we have to write 'VAL_ERR_...' as this is treated as string
// By JS it will not throw error and there is possibility to make typo there
// but now we have to write errList.VAL_ERR_.. this is JS variable name
// and JS will throw error when we make typo there.

//
// NOTE:
// - Error code must be unique for all error objects.
// - Internal error is used for debugging purpose hence don't send it to client.
//
//

const errList = {
  //
  // INTERNAL SERVER ERRORS
  // These errors occurs when some request fails either authentication or authorization
  // In this case front end should redirect to Login page
  //
  // ERR_PR_ : ERROR_PROTECT_ROUTE_
  authError: {
    ERR_PR_PERMISSION_MISMATCH: {
      code: '20001',
      message: 'You are not authorized to access this resource. Please login again.',
      internalDescription: 'Role provided in token does not matched with route accessed.',
    },
    ERR_PR_INVALID_TOKEN: {
      code: '20002',
      message: 'You are not authorized to access this resource. Please login again.',
      internalDescription: 'Verify function for token provided fails. Token may be tampered with.',
    },
    ERR_PR_NO_TOKEN: {
      code: '20003',
      message: 'You are not authorized to access this resource. Please login again.',
      internalDescription: 'No token provided while accessing protected route.',
    },
    ERR_PR_TOKEN_EXPIRED: {
      code: '20004',
      message: 'You are not authorized to access this resource. Please login again..',
      internalDescription: 'Token provided while accessing the protected route has been expired.',
    },
  },

  //
  // DATABASE ERRORS
  // These error occurred when given values does not match with the value
  // present in DB or they are missing
  // ERR_<Operation>_<Description>
  //
  dbError: {
    ERR_EMPLOYEE_REGISTER_DETAILS_EXISTS: {
      code: '30001',
      message: 'Employee is already registered with the email or mobile',
      internalDescription: 'The email ID or mobile number used for Registration is already exist in Employee table.',
    },
    ERR_LOGIN_USER_PASSWORD_NO_MATCH: {
      code: '30002',
      message: 'Invalid Username or Password provided !',
      internalDescription: 'Provided password does not match with hashed password present in DB.',
    },
    ERR_USER_LOGIN_USER_DOES_NOT_EXIST: {
      code: '30003',
      message: 'Invalid Username or Password provided !',
      internalDescription: 'user is not in the user table so it returns an error status',
    },
    ERR_LOGIN_EMPLOYEE_PASSWORD_NO_MATCH: {
      code: '30004',
      message: 'Invalid Username or Password provided !',
      internalDescription: 'Provided password does not match with hashed password present in DB.',
    },
    ERR_EMPLOYEE_LOGIN_EMPLOYEE_DOES_NOT_EXIST: {
      code: '30005',
      message: 'Invalid Username or Password provided !',
      internalDescription: 'Employee is not in the employee table so it returns an error status',
    },
    ERR_EMPLOYEE_PROFILE_NOT_FOUND: {
      code: '30006',
      message: 'Please login again to continue',
      internalDescription: 'There is an error while employee tries to visit which the select query does not return any rows regarding the employee',
    },
    ERR_INSERT_COUNTRY_DUPLICATE_ENTRY: {
      code: '30007',
      message: 'Insertion not possible,  country with the given name already exists..!',
      internalDescription: 'Insertion of details of a country fails as  there is a duplicate entry with the same name',
    },
    ERR_INSERT_STATE_DUPLICATE_ENTRY: {
      code: '30008',
      message: 'Insertion not possible,  state with the given name already exists..!',
      internalDescription: 'Insertion of details of a state fails as  there is a duplicate entry with the same name',
    },
    ERR_INSERT_CITY_DUPLICATE_ENTRY: {
      code: '30009',
      message: 'Insertion not possible,  city with the given name already exists..!',
      internalDescription: 'Insertion of details of a city fails as  there is a duplicate entry with the same name',
    },
  },

  //
  // INTERNAL SERVER ERRORS
  // These errors occurs when some server modules throws error
  // For example hashing module or encoding module. The operation
  // done on server which does not involve DB. This also involve some external API
  // call returned error or failed.
  //
  internalError: {
    ERR_HASH_PASSWORD: {
      code: '50001',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'Hashing a password provided by user is failing.',
    },
    ERR_COMPARE_PASSWORD_AND_HASH: {
      code: '50002',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'While comparing password and its hash throw.',
    },
    ERR_EMPLOYEE_REGISTER_NO_DUPLICATE_DETAILS: {
      code: '50003',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: `The email ID or mobile number used for registration is 
        not present in employee table still insert failed.
        This can be because timeout or something else.`,
    },
    ERR_EMPLOYEE_REGISTER_NO_INSERT_NO_EXCEPTION: {
      code: '50004',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: `Insert employee details while registration
        generate no exception and affect zero rows. This error should not
        happen and can be cause by error in DB driver.`,
    },
    ERR_LOGIN_SELECT_THROW_EXCEPTION: {
      code: '50005',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: `while fetching the credentials for login
        exception generated a Database error or Internal error. This might have happened
        because of database server which might be down `,
    },
    ERR_INSERT_COUNTRY_NO_EXCEPTION_INSERT_ERROR: {
      code: '50006',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'There is no error or exception when the country is being inserted and country is not inserted.',
    },
    ERR_INSERT_COUNTRY_FAILURE: {
      code: '50007',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: `Insertion of details to the country table fails
              there may be DB error or Query error`,
    },
    ERR_SELECT_COUNTRY_LIST_FAILURE: {
      code: '50008',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'there is an error while selecting the list of countries from the database',
    },
    ERR_INSERT_STATE_NO_EXCEPTION_INSERT_ERROR: {
      code: '50009',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'There is no error or exception when the state is being inserted and state is not inserted.',
    },
    ERR_INSERT_STATE_FAILURE: {
      code: '50010',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: `Insertion of details to the state table fails
              there may be DB error or Query error`,
    },
    ERR_SELECT_STATE_LIST_FAILURE: {
      code: '50011',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'there is an error while selecting the list of states from the database',
    },
    ERR_INSERT_CITY_NO_EXCEPTION_INSERT_ERROR: {
      code: '50012',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'There is no error or exception when the city is being inserted and city is not inserted.',
    },
    ERR_INSERT_CITY_FAILURE: {
      code: '50013',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: `Insertion of details to the city table fails
              there may be DB error or Query error`,
    },
    ERR_SELECT_CITY_LIST_FAILURE: {
      code: '50014',
      message: errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: 'there is an error while selecting the list of cities from the database',
    },
  },
};

module.exports.errMsg = errMsg;
module.exports.errList = errList;
