// TO IMPORT: const auth = require('../model/auth');

// NOTES:
// If want to enable passport search 'passport' in codebase for its details.
//

/**
 * JWT Object Structure (All things are defined in constant)
 *
 * [TOKEN_NAME] =
 *    payload :{
 *    id: 'EMP_ID',
 *    cid: 'COMPANY_ID',
 *    role: '',
 *    bids: [], Array of branch ids employee has access to
 *    [tokenType.KEY] : 'tokenType.value.EMPLOYEE/FSJARS_EMPLOYEE',
 *    [permissionKey.ENQUIRY_MANAGEMENT]: '0/1',
 *    [permissionKey.EMPLOYEE_MANAGEMENT]: '0/1',
 *    [permissionKey.COMPANY_SETTING]: '0/1',
 * }
 *
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const constant = require('./constant');
const responseGenerator = require('./response-generator');
const error = require('./error');

// TODO Take this from environment variable
const jwtSecret = config.get('authJWT.secret');
// Authentication and Session
const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// // This is capital L because its constructor
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

/**
 * Hash the given password. Before passing the password to this function
 * it must be validated through validator module.
 *
 * @public
 * @async
 * @param {string} password Password to be hashed
 *
 * @return {string} Hashed password
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

/**
 * Compare plain text password with hashed password
 *
 * @public
 * @async
 * @param {string} password Plain text password
 * @param {string} hashedPassword Hashed password from DB
 *
 * @return {boolean} Indicating whether passwords are equal
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function verifyPassword(password, hashedPassword) {
  const areEqual = await bcrypt.compare(password, hashedPassword);
  return areEqual;
}

/**
 * Create signed JSON Web Token encoding given payload using secret.
 *
 * @public
 * @param {object} payload Object we need to encode as JSON Web Token
 *
 * @return {jwt} payload encoded as JSON Web Token
 */
function genAuthToken(payload) {
  // TODO call encode payload here
  // TODO Add this in try catch and throw our custom error
  return jwt.sign(payload, jwtSecret);
}

/**
 * Create signed JSON Web Token encoding given payload using secret.
 *
 * @public
 * @param {object} payload Object we need to encode as JSON Web Token
 *
 * @return {jwt} payload encoded as JSON Web Token
 */
function genAuthTokenResetPassword(payload) {
  // TODO call encode payload here
  // TODO Add this in try catch and throw our custom error
  return jwt.sign(payload, jwtSecret, { expiresIn: '30m' });
}

/**
 * Create signed JSON Web Token encoding given payload using secret.
 *
 * @public
 * @param {object} payload Object we need to encode as JSON Web Token
 *
 * @return {jwt} payload encoded as JSON Web Token
 */
function genAuthTokenVerifyEmail(payload) {
  // TODO call encode payload here
  // TODO Add this in try catch and throw our custom error
  return jwt.sign(payload, jwtSecret, { expiresIn: '30m' });
}

/**
 * function to extract user from the jwt using cookie
 * 
 */

 function cookieExtractor(req){
   let token = false;
   console.log('hello');
  console.log(req);
   if(req && req.cookies)
    token = req.cookies['x-id-token'];
  return token;
 }

// function authPassportJwtStrategy(params) {
  
// }

passport.use(new JwtStrategy({
  // These are needed because front end will send token in 'x-id-token'
  jwtFromRequest: (req) => cookieExtractor(req),
  secretOrKey: jwtSecret,
},
async (payload, done) => {
  // console.log('object');
  // Here payload if actual payload form the JWT so we can access its object directly
  console.log(payload);
  // Find user specified in token
  // This part is not needed it will make response slow and token can't be tampered with but
  // This is needed only in the case if user deletes its account and then
  // try to access protected routes in this case token may be valid as it is signed by
  // us and not yet expired but the user is not exist in the DB.
  // This can be mitigated by having /logout route which add the blacklist token into our DB
  // and in frontend deletes the given token.
  // For now I will no do DB query to check for user but instead I will just add user
  // to req.user object by calling done() method.
  // NOTE: I can also fetch additional data here and append it to req.user,
  // this fetch must be from in memory DB and not persistent

  // If user does not exist handle it.
  // Here check if JWT is valid and not expired, if so redirect to login

  // Otherwise return user to passport so that it can be added to req.user.
  // Payload will be appended to req.user object
  done(null, payload);
}));


/**
 * authentication middle ware to check token of verify the email
 *
 */
function protectEmailVerify(req, res, next) {
  const token = req.query.email_verify_tkn;
  if (token) {
    try {
      // Check whether we have earlier verified the token or not. If verified we have data
      // of JWT already in req.user object.
      // If we have verified the payload is available in req.user hence we can directly
      // use that otherwise we need to verify it first.
      if (req.user === null || req.user === undefined) {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload;
      }
      next();
      return 0; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      console.log(e);
      if (e.name === 'TokenExpiredError') {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
    }
  } else {
    return res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
  }
}

/** */

function protectResetPasswordRoute(req, res, next) {
  const token = req.params.reset_pwd_tkn;
  if (token) {
    try {
      // Check whether we have earlier verified the token or not. If verified we have data
      // of JWT already in req.user object.
      // If we have verified the payload is available in req.user hence we can directly
      // use that otherwise we need to verify it first.
      if (req.user === null || req.user === undefined) {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload;
      }
      next();
      return 0; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      console.log(e);
      if (e.name === 'TokenExpiredError') {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
    }
  } else {
    return res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
  }
}
/**
 * general auth token verification route
 *
 * @public
 *
 */
function protectTokenVerify(req, res, next) {
  const token = req.cookies[constant.TOKEN_NAME];
  // Token exist in request
  if (token) {
    // Check whether we have earlier verified the token or not. If verified we have data
    // of JWT already in req.user object.
    // If we have verified the payload is available in req.user hence we can directly
    // use that otherwise we need to verify it first.
    if (req.user === null || req.user === undefined) {
      const payload = jwt.verify(token, jwtSecret);
      req.user = payload;
      // console.log(req.user);
      switch (req.user.role) {
        case 'Distributor':
          return res.redirect('/distributor');
        case 'salesOfficer':
          return res.redirect('/sales');
        case 'delivery':
          return res.redirect('/delivery');
        default:
          return res.redirect('/');
      }
      // return res.redirect()
    }
    next();
    return 0; // We will not reach here but to avoid eslint error we have this
  }
  return next();
}

/**
 * Route protection middleware for employee management route. It checks authorization based
 * based on permissions given to the roles.
 *
 * @public
 */

function protectTokenCheck(req, res, next) {
  const token = req.cookies[constant.TOKEN_NAME];
  // Token exist in request
  if (token) {
    try {
      // Check whether we have earlier verified the token or not. If verified we have data
      // of JWT already in req.user object.
      // If we have verified the payload is available in req.user hence we can directly
      // use that otherwise we need to verify it first.
      // This is needed because we don't want to verify the content again and again when
      // multiple route protections are used. For example in GET method we will probably
      // not be going to use the protectCompanySetting or anything like that but we are
      // certainly going to use the protectBranchAccess.
      if (req.user === null || req.user === undefined) {
        const payload = jwt.verify(token, jwtSecret);
        // console.log(payload);
        req.user = payload;
      }

      // TODO Call decode payload here
      // TODO Add things we need from user table here
      // TODO one scenario will fail here if user deletes his account
      // to mitigate this we need to have /logout route on server too which just
      // add the invalid tokens into the blacklist and here we check whether the token
      // is invalid here
      // console.log(req.user);
      // Invalid Role hence Not authorized
      next();
      return 0; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      console.log(e);
      if (e.name === 'TokenExpiredError') {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
    }
  } else {
    return res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
  }
}

/**
 * 
 * passport auth verification
 */

 function protectPassportTokenVerify(req, res, next) {
  passport.authenticate('jwt', {session: false});
 }

/**
 * Route protection middleware for enquiry management route. It checks authorization based
 * based on permissions given to the roles.
 *
 * @public
 */

function protectEnquiryMgmtRoute(req, res, next) {
  const token = req.header(constant.TOKEN_NAME);
  // Token exist in request
  if (token) {
    try {
      // Check whether we have earlier verified the token or not. If verified we have data
      // of JWT already in req.user object.
      // If we have verified the payload is available in req.user hence we can directly
      // use that otherwise we need to verify it first.
      // This is needed because we don't want to verify the content again and again when
      // multiple route protections are used. For example in GET method we will probably
      // not be going to use the protectCompanySetting or anything like that but we are
      // certainly going to use the protectBranchAccess.
      if (req.user === null || req.user === undefined) {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload;
      }

      // TODO Call decode payload here
      // TODO Add things we need from user table here
      // TODO one scenario will fail here if user deletes his account
      // to mitigate this we need to have /logout route on server too which just
      // add the invalid tokens into the blacklist and here we check whether the token
      // is invalid here
      // console.log(payload);
      // Invalid Role hence Not authorized
      if (req.user[constant.permissionKey.ENQUIRY_MANAGEMENT] !== 1 || req.user[constant.tokenType.KEY] !== constant.tokenType.value.EMPLOYEE) {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_PERMISSION_MISMATCH));
      }
      next();
      return 0; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
    }
  } else {
    return res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
  }
}

function protectCompanySettingRoute(req, res, next) {
  // console.log(req);
  const token = req.header(constant.TOKEN_NAME);
  // Token exist in request
  if (token) {
    try {
      // Check whether we have earlier verified the token or not. If verified we have data
      // of JWT already in req.user object.
      // If we have verified the payload is available in req.user hence we can directly
      // use that otherwise we need to verify it first.
      // This is needed because we don't want to verify the content again and again when
      // multiple route protections are used. For example in GET method we will probably
      // not be going to use the protectCompanySetting or anything like that but we are
      // certainly going to use the protectBranchAccess.
      if (req.user === null || req.user === undefined) {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload;
        // console.log(payload);
      }
      // TODO Call decode payload here
      // TODO Add things we need from user table here
      // TODO one scenario will fail here if user deletes his account
      // to mitigate this we need to have /logout route on server too which just
      // add the invalid tokens into the blacklist and here we check whether the token
      // is invalid here
      // console.log(payload);
      // Invalid Role hence Not authorized
      if (req.user[constant.permissionKey.COMPANY_SETTING] !== 1 || req.user[constant.tokenType.KEY] !== constant.tokenType.value.EMPLOYEE) {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_PERMISSION_MISMATCH));
      }
      next();
      return 0; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
    }
  } else {
    return res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
  }
}

/**
 * This middle ware is used to protect access to the branch information from the user
 * who don't belong to this branch.
 *
 * @param {Array} branchArray This is array of branch ID's for which access is requested
 *
 * @public
 */
function protectBranchAccess(req, res, branchArray) {
  // return (req, res) => {
  const token = req.header(constant.TOKEN_NAME);
  // Token exist in request
  // console.log(branchArray);
  // console.log(req.user);
  if (token) {
    try {
      // Check whether we have earlier verified the token or not. If verified we have data
      // of JWT already in req.user object.
      // If we have verified the payload is available in req.user hence we can directly
      // use that otherwise we need to verify it first.
      // This is needed because we don't want to verify the content again and again when
      // multiple route protections are used. For example in GET method we will probably
      // not be going to use the protectCompanySetting or anything like that but we are
      // certainly going to use the protectBranchAccess.
      if (req.user === null || req.user === undefined) {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload;
      }
      // TODO Call decode payload here
      // TODO Add things we need from user table here
      // TODO one scenario will fail here if user deletes his account
      // to mitigate this we need to have /logout route on server too which just
      // add the invalid tokens into the blacklist and here we check whether the token
      // is invalid here

      // Check if token is of employee type and the branch ID details are requested
      // present in the allowed list of branch ID
      if (
        !(['Owner', 'Company Admin'].includes(req.user.role) || branchArray.every(val => req.user.bids.includes(val)))
        || req.user[constant.tokenType.KEY] !== constant.tokenType.value.EMPLOYEE
      ) {
        // The above includes can be rectified when we use binary search but as
        // there can be at most 50-100 branches we don't need to worry about it now.
        res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_BRANCH_DETAILS_UNAUTHORIZED_REQUEST));
        return false;
      }
      return true; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
      return false;
    }
  } else {
    res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
    return false;
  }
  // };
}

// function protectLtTableUpdate(req, res, next) {
//   const token = req.header(constant.TOKEN_NAME);
//   // Token exist in request
//   if (token) {
//     try {
//       const payload = jwt.verify(token, jwtSecret);
//       // TODO Call decode payload here
//       // TODO Add things we need from user table here
//       // TODO one scenario will fail here if user deletes his account
//       // to mitigate this we need to have /logout route on server too which just
//       // add the invalid tokens into the blacklist and here we check whether the token
//       // is invalid here
//       // console.log(payload);
//       // Invalid Role hence Not authorized
//       if (!(payload.role === constant.defaultFSJEmpRoles.FSJ_ADMIN)) {
//         return res
//           .status(403)
//           .send(
//             responseGenerator.authError(
//               error.errList.authError.ERR_PR_ROLE_MISMATCH
//             )
//           );
//       }
//       req.user = payload;
//       next();
//       return 0; // We will not reach here but to avoid eslint error we have this
//     } catch (e) {
//       if (e.name === 'TokenExpiredError') {
//         return res
//           .status(403)
//           .send(
//             responseGenerator.authError(
//               error.errList.authError.ERR_PR_TOKEN_EXPIRED
//             )
//           );
//       }
//       return res
//         .status(403)
//         .send(
//           responseGenerator.authError(
//             error.errList.authError.ERR_PR_INVALID_TOKEN
//           )
//         );
//     }
//   } else {
//     return res
//       .status(401)
//       .send(
//         responseGenerator.authError(
//           error.errList.authError.ERR_PR_NO_TOKEN
//         )
//       );
//   }
// }

// function protectFSJEmpRoute(req, res, next) {
//   const token = req.header(constant.TOKEN_NAME);
//   // Token exist in request
//   if (token) {
//     try {
//       const payload = jwt.verify(token, jwtSecret);
//       // TODO Call decode payload here
//       // TODO Add things we need from user table here
//       // TODO one scenario will fail here if user deletes his account
//       // to mitigate this we need to have /logout route on server too which just
//       // add the invalid tokens into the blacklist and here we check whether the token
//       // is invalid here
//       // console.log(payload);
//       // Invalid Role hence Not authorized
//       if (!payload.role.startsWith('FSJ_')) {
//         return res
//           .status(403)
//           .send(
//             responseGenerator.authError(
//               error.errList.authError.ERR_PR_ROLE_MISMATCH
//             )
//           );
//       }
//       req.user = payload;
//       next();
//       return 0; // We will not reach here but to avoid eslint error we have this
//     } catch (e) {
//       if (e.name === 'TokenExpiredError') {
//         return res
//           .status(403)
//           .send(
//             responseGenerator.authError(
//               error.errList.authError.ERR_PR_TOKEN_EXPIRED
//             )
//           );
//       }
//       return res
//         .status(403)
//         .send(
//           responseGenerator.authError(
//             error.errList.authError.ERR_PR_INVALID_TOKEN
//           )
//         );
//     }
//   } else {
//     return res
//       .status(401)
//       .send(
//         responseGenerator.authError(
//           error.errList.authError.ERR_PR_NO_TOKEN
//         )
//       );
//   }
// }

function protectTestResetPasswordRoute(req, res, next) {
  const token = req.query.tkn;
  // Token exist in request
  if (token) {
    try {
      const payload = jwt.verify(token, jwtSecret);
      // TODO Call decode payload here
      // TODO Add things we need from user table here
      // TODO one scenario will fail here if user deletes his account
      // to mitigate this we need to have /logout route on server too which just
      // add the invalid tokens into the blacklist and here we check whether the token
      // is invalid here
      // console.log(payload);
      // Invalid Role hence Not authorized
      if (!(payload.role === constant.custRoles.COMPANY)) {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_ROLE_MISMATCH));
      }
      req.user = payload;
      next();
      return 0; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
    }
  } else {
    return res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
  }
}

function protectEmployeeResetPasswordRoute(req, res, next) {
  const token = req.query.tkn;
  // Token exist in request
  if (token) {
    try {
      const payload = jwt.verify(token, jwtSecret);
      // TODO Call decode payload here
      // TODO Add things we need from user table here
      // TODO one scenario will fail here if user deletes his account
      // to mitigate this we need to have /logout route on server too which just
      // add the invalid tokens into the blacklist and here we check whether the token
      // is invalid here
      // console.log(payload);
      // Invalid Role hence Not authorized
      // Invalid Role hence Not authorized
      if (!payload.role.startsWith('FSJ_')) {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_ROLE_MISMATCH));
      }
      req.user = payload;
      next();
      return 0; // We will not reach here but to avoid eslint error we have this
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_TOKEN_EXPIRED));
      }
      return res.status(403).send(responseGenerator.authError(error.errList.authError.ERR_PR_INVALID_TOKEN));
    }
  } else {
    return res.status(401).send(responseGenerator.authError(error.errList.authError.ERR_PR_NO_TOKEN));
  }
}

// function encodePayload(user){
//   // The simple logic is to prepend '12041991'
//   // This we do because we don't want to expose our business
//   // details to outside user.
//   // If we just return id from DB they will know how many users we have
//   user.id =
// }

module.exports.hashPassword = hashPassword;
module.exports.genAuthToken = genAuthToken;
module.exports.genAuthTokenResetPassword = genAuthTokenResetPassword;
module.exports.protectEmailVerify = protectEmailVerify;
module.exports.protectResetPasswordRoute = protectResetPasswordRoute;
module.exports.genAuthTokenVerifyEmail = genAuthTokenVerifyEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.protectTokenVerify = protectTokenVerify;
module.exports.protectTokenCheck = protectTokenCheck;
module.exports.protectEnquiryMgmtRoute = protectEnquiryMgmtRoute;
module.exports.protectCompanySettingRoute = protectCompanySettingRoute;
module.exports.protectBranchAccess = protectBranchAccess;
// module.exports.protectFSJEmpRoute = protectFSJEmpRoute;
// module.exports.protectLtTableUpdate = protectLtTableUpdate;
module.exports.protectTestResetPasswordRoute = protectTestResetPasswordRoute;
module.exports.protectEmployeeResetPasswordRoute = protectEmployeeResetPasswordRoute;
module.exports.protectPassportTokenVerify = protectPassportTokenVerify;

// ==============================
// This code to be used when enabling passport for authentication.
// Things to install 'passport', 'passport-local', 'passport-jwt'

// Authentication and Session
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// This is capital L because its constructor
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;

// passport.use(new JwtStrategy({
//   // These are needed because front end will send token in 'x-auth-token'
//   jwtFromRequest: ExtractJwt.fromHeader('x-auth-token'),
//   secretOrKey: jwtSecret,
// },
// (payload, done) => {
//   // Here payload if actual payload form the JWT so we can access its object directly
//   console.log(payload);
//   // Find user specified in token
//   // This part is not needed it will make response slow and token can't be tampered with but
//   // This is needed only in the case if user deletes its account and then
//   // try to access protected routes in this case token may be valid as it is signed by
//   // us and not yet expired but the user is not exist in the DB.
//   // This can be mitigated by having /logout route which add the blacklist token into our DB
//   // and in frontend deletes the given token.
//   // For now I will no do DB query to check for user but instead I will just add user
//   // to req.user object by calling done() method.
//   // NOTE: I can also fetch additional data here and append it to req.user,
//   // this fetch must be from in memory DB and not persistent

//   // If user does not exist handle it.
//   // Here check if JWT is valid and not expired, if so redirect to login

//   // Otherwise return user to passport so that it can be added to req.user.
//   // Payload will be appended to req.user object
//   done(null, payload);
// }));

// passport.use(new LocalStrategy({
//   usernameField: 'ui_email',
//   passwordField: 'ui_password',
// },
// async (username, password, done) => {
//   console.log(username);
//   console.log(password);

//   try {
//     const [rows, fields] = await pool.execute('SELECT user_password FROM user'+
//     ' WHERE user_email = ?;', [username]);
//     // console.log(`Rows: ${rows.length}`);
//     // console.log(`Rows: ${fields}`);

//     if (rows.length === 1) {
//       console.log('Found user');
//       console.log(rows[0].user_password);
//       const user = {
//         id: 1234,
//         email: username,
//       };

//       return done(null, username);
//     }
//     if (rows.length === 0) {
//       // User does not exist in DB so return "Invalid Username or Password"
//       return done(null, false, { message: 'My error' });
//     }

//     // This will not happen
//     console.log('There are two user\'s in your database with same email');
//     done(null, false, { message: 'Some Internal Error occurred.
// If it persist then report us with error code: Err2048'});
//   } catch (error) {
//     console.log('Exception in query : ' + error);
//     done(error, false);
//   }
// }));
