const express = require('express');
// TODO Change hash to auth
const config = require('config');
const url = require('url');
const auth = require('../model/auth');
const hash = require('../model/auth');
const pool = require('../database/db');
const hf = require('../model/helper-function');
const vs = require('../model/validator-sanitizer');
const responseGenerator = require('../model/response-generator');
const constant = require('../model/constant');
const error = require('../model/error');
const mailer = require('../model/mailer');
const multer = require('../model/multer');

const router = express.Router();

/**
 * Route for distributor home page
 * @name /distributor/
 */
router.get('/',auth.protectTokenCheck, async (req, res) => res.render('distributorHome'));


/**
 * Route for distributor login page
 * @name /distributor/login
 */
router.get('/login',   auth.protectTokenVerify,async (req, res) => res.render('distributorLogin'));
/**
 * route for company distributor login
 *
 * @name /distributor/login
 *
 * @param ui_username : Email or mobile of the distributor
 * @param ui_password : password of the distributor
 *
 */
router.post(
  '/login',
  auth.protectTokenVerify,
  [
    vs.isEmailOrMobile('body', 'ui_username'),
    vs.isDistributorPassword('body', 'ui_password', constant.passwordValidatorResponses.COMPANY_DISTRIBUTOR_LOGIN_PWD_RESPONSE),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_username', 'ui_password'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const bePassword = req.body.ui_password;
    const beUsername = req.body.ui_username;

    let qStrDistDetails = 'SELECT dist_id, dist_name, dist_pwd, dist_is_email_verified FROM distributor ';

    let qRespDistDetails;
    if (hf.isEmail(beUsername)) {
      qStrDistDetails += 'WHERE dist_email = ?';
    } else {
      qStrDistDetails += 'WHERE dist_primary_mobile = ?';
    }

    try {
      [qRespDistDetails] = await pool.execute(qStrDistDetails, [req.body.ui_username]);
    } catch (e) {
      console.log(e);
      const responseExceptionInSelect = responseGenerator.internalError(error.errList.internalError.ERR_LOGIN_SELECT_THROW_EXCEPTION);
      return res.status(500).send(responseExceptionInSelect);
    }
    // Distributor exist in DB
    // console.log(qRespDistDetails);
    if (qRespDistDetails.length === 1) {
      // Verify password
      let isValidPassword;
      try {
        isValidPassword = await auth.verifyPassword(bePassword, qRespDistDetails[0].dist_pwd);
      } catch (e) {
        // Unable to compare hash and Password
        const responseUnableToCompareHash = responseGenerator.internalError(error.errList.internalError.ERR_COMPARE_PASSWORD_AND_HASH);
        return res.status(400).send(responseUnableToCompareHash);
      }
      if (!isValidPassword) {
        const responsePasswordNoMatch = responseGenerator.dbError(error.errList.dbError.ERR_LOGIN_USER_PASSWORD_NO_MATCH);
        return res.status(400).send(responsePasswordNoMatch);
      }

      let token;
      try {
        token = auth.genAuthToken({
          id: qRespDistDetails[0].dist_id,
          role: 'Distributor',
          // Use JSON.parse instead of string.split() because JSON.parse convert it to array of numbers
          // but .split() convert it to array of strings. // branchID: qBranchIDList[0].branch_ids.split(','),
          [constant.tokenType.KEY]: constant.tokenType.value.DISTRIBUTOR,
          [constant.permissionKey.CUSTOMER_MANAGEMENT]: true,
          [constant.permissionKey.DISTRIBUTOR]: true,
          [constant.permissionKey.SALES_OFFICER_MANAGEMENT]: true,
        });
      } catch (e) {
        const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
        return res.status(405).send(responseGenerateTokenError);
      }
      const emailVerified = qRespDistDetails[0].dist_is_email_verified ? 'Verified' : 'Not Verified';
      const items = [
        {
          username: qRespDistDetails[0].dist_name,
          image: qRespDistDetails[0].dist_image,
          isEmailVerified: emailVerified,
        },
      ];
      try {
        const [ipUpdate] = await pool.execute(
          `
                UPDATE distributor 
                SET dist_last_login = ? , dist_last_login_IP = ?
                WHERE dist_id = ?;
              `,
          [req.utc_start_time.format('YYYY-MM-DD HH:mm:ss'), req.ip, qRespDistDetails[0].dist_id],
        );
      } catch (e) {
        console.log(e);
        const responseStudentLoginUpdateQueryFailure = responseGenerator.dbError(error.errList.dbError.ERR_LOGIN_USER_UPDATE_IP_FAILURE);
        return res.status(500).send(responseStudentLoginUpdateQueryFailure);
      }
      // req.login(token, {session: false}, (error) => {
      //   if (error) {
      //     res.status(400).send({ error });
      //   }
      // req.header(constant.TOKEN_NAME, token);
      // res
      // console.log(res.cookie());
      res.cookie('x-id-token', token, { httpOnly: true });
      // res
      return res
        .status(200)
        .header(constant.TOKEN_NAME, token)
        .send(responseGenerator.success('login', 'Login Successful!!!', items));
    // });
  }
    // Distributor does not exist in DB
    const responseCompDistributorNotExist = responseGenerator.dbError(error.errList.dbError.ERR_COMPANY_DISTRIBUTOR_LOGIN_DISTRIBUTOR_DOES_NOT_EXIST);
    return res.status(405).send(responseCompDistributorNotExist);
  },
);

// /**
//  * Route to add new distributor to a branch or branches
//  *
//  * @name /distributor/add/new
//  *
//  * @param ui_distributor_name : name of the distributor of the company
//  * @param {Array} ui_branch_id : branch where the distributor is being assigned
//  * @param ui_distributor_email : email of the distributor of the company
//  * @param ui_distributor_password : password for the company's distributor account
//  * @param ui_distributor_mobile : mobile number of the distributor of the company
//  * @param ui_distributor_secondary_mobile: secondary mobile of the distributor
//  * @param ui_distributor_gender : gender of the distributor of the company
//  * @param ui_distributor_role : role of the distributor
//  * @param ui_distributor_dob : date of birth of the distributor
//  * @param ui_distributor_address : address where the distributor lives
//  * @param ui_distributor_city : city where the distributor lives
//  * @param ui_distributor_state : state where the distributor lives
//  * @param ui_distributor_country : country where the distributor lives
//  * @param ui_distributor_pincode : pincode of the distributor's address
//  *
//  */
// router.post(
//   '/add/new',
//   auth.protectDistributorMgmtRoute,
//   [
//     vs.isValidStrLenWithTrim('body', 'ui_distributor_name', 3, 50, 'Please enter a valid distributor name between 3 to 50 characters only.'),
//     vs.isEmail('body', 'ui_distributor_email'),
//     vs.isBranches('body', 'ui_branch_id'),
//     vs.isDistributorPassword('body', 'ui_distributor_password', constant.passwordValidatorResponses.COMPANY_DISTRIBUTOR_REGISTER_PASSWORD_RESPONSE),
//     vs.isMobile('body', 'ui_distributor_mobile'),
//     vs.ifExistIsMobile('body', 'ui_distributor_secondary_mobile'),
//     vs.isGender('body', 'ui_distributor_gender'),
//     vs.isValidStrLenWithTrim('body', 'ui_distributor_role', 3, 20, 'Please enter the valid Distributor Role.'),
//     vs.isDOB('body', 'ui_distributor_dob'),
//     vs.isValidStrLenWithTrim('body', 'ui_distributor_address', 0, 255, 'Address should not be more than 255 characters.'),
//     vs.isValidStrLenWithTrim('body', 'ui_distributor_city', 3, 50, 'Please enter a valid city name for the distributor between 3 to 50 characters.'),
//     vs.isValidStrLenWithTrim('body', 'ui_distributor_state', 3, 50, 'Please enter a valid state name for the distributor between 3 to 50 characters.'),
//     vs.isValidStrLenWithTrim('body', 'ui_distributor_country', 3, 50, 'Please enter a valid country name for the distributor between 3 to 50 characters.'),
//     vs.isPINCODE('body', 'ui_distributor_pincode'),
//   ],
//   async (req, res) => {
//     const branchArray = [parseInt(req.body.ui_branch_id, 10)];
//     // console.log(auth.protectBranchAccess(req, res, branchArray));
//     if (auth.protectBranchAccess(req, res, branchArray)) {
//       const errors = vs.getValidationResult(req);
//       if (!errors.isEmpty()) {
//         const fieldsToValidate = [
//           'ui_distributor_name',
//           'ui_branch_id',
//           'ui_distributor_email',
//           'ui_distributor_password',
//           'ui_distributor_mobile',
//           'ui_distributor_secondary_mobile',
//           'ui_distributor_gender',
//           'ui_distributor_role',
//           'ui_distributor_dob',
//           'ui_distributor_address',
//           'ui_distributor_city',
//           'ui_distributor_state',
//           'ui_distributor_country',
//           'ui_distributor_pincode',
//         ];
//         // This is if else so we don't need return
//         return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
//       }
//       const bePassword = req.body.ui_distributor_password;
//       let beHashedPassword = '';
//       try {
//         // NOTE We need to await this function as it is async
//         beHashedPassword = await hash.hashPassword(bePassword);
//       } catch (e) {
//         // Unable to hash Password
//         const responseUnableToHash = responseGenerator.internalError(error.errList.internalError.ERR_HASH_PASSWORD);
//         return res.status(500).send(responseUnableToHash);
//       }
//       let conn;
//       try {
//         conn = await pool.getConnection();
//       } catch (e) {
//         const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_GET_CONNECTION_FROM_POOL_FAILURE;
//         return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
//       }

//       // Variables for results
//       let companyDistInsert;
//       let distributorDetails;
//       let companyDistBranchList;
//       let companyDistBranchLink;

//       // Begin Transaction
//       try {
//         await conn.beginTransaction();
//       } catch (e) {
//         // Begin transaction failure
//         console.log(e);
//         await conn.rollback();
//         await conn.release();
//         const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_BEGIN_TRANSACTION_FAILURE;
//         return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
//       }
//       const empImage = req.body.ui_distributor_gender === 'Male' ? constant.defaultCompDistImages.MALE : constant.defaultCompDistImages.FEMALE;
//       const beDistSecondaryMobile = req.body.ui_distributor_secondary_mobile || null;
//       try {
//         [distributorDetails] = await conn.query(
//           `
//             SELECT dist_name AS name
//             FROM distributor WHERE dist_id = ?;
//           `,
//           [req.user.id, req.user.cid],
//         );
//         // console.log(distributorDetails);
//       } catch (e) {
//         console.log(e);
//         await conn.rollback();
//         await conn.release();
//         const beTaskDeletionFailure = error.errList.internalError.ERR_DISTRIBUTOR_INSERT_SELECT_DISTRIBUTOR_DETAILS_FAILURE;
//         return res.status(500).send(responseGenerator.internalError(beTaskDeletionFailure));
//       }

//       try {
//         [companyDistInsert] = await conn.query(
//           `
//               INSERT INTO distributor (dist_name , dist_email, dist_pwd, dist_primary_mobile, dist_DOB,
//                 dist_address, dist_city, dist_state, dist_country, dist_PIN, dist_image, dist_secondary_mobile,
//                 dist_gender, dist_role, dist_comp_code dist_last_login_IP, dist_added_by, dist_added_by_name)
//               SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, comp_code, ?, ?, ?, ?
//               FROM company WHERE comp_id = ?
//           `,
//           [
//             req.body.ui_distributor_name,
//             req.body.ui_distributor_email,
//             beHashedPassword,
//             req.body.ui_distributor_mobile,
//             req.body.ui_distributor_dob,
//             req.body.ui_distributor_address,
//             req.body.ui_distributor_city,
//             req.body.ui_distributor_state,
//             req.body.ui_distributor_country,
//             req.body.ui_distributor_pincode,
//             empImage,
//             beDistSecondaryMobile,
//             req.body.ui_distributor_gender,
//             req.body.ui_distributor_role,
//             req.user.cid,
//             req.ip,
//             req.user.id,
//             distributorDetails[0].name,
//             req.user.cid,
//           ],
//         );
//         // console.log(companyDistInsert);
//         if (companyDistInsert.affectedRows !== 1) {
//           await conn.rollback();
//           await conn.release();
//           const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_COMPANY_DISTRIBUTOR_ADD_NO_INSERT_NO_EXCEPTION;
//           return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
//         }
//       } catch (e) {
//         console.log(e);
//         await conn.rollback();
//         await conn.release();
//         if (e.code === 'ER_DUP_ENTRY') {
//           const beDistributorDetailsAlreadyExist = error.errList.dbError.ERR_COMPANY_DISTRIBUTOR_ADD_DETAILS_EXISTS;
//           return res.status(400).send(responseGenerator.dbError(beDistributorDetailsAlreadyExist));
//         }
//         const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_DISTRIBUTOR_ADD_INSERT_DETAILS_FAILURE;
//         return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
//       }

//       const bids = req.body.ui_branch_id;
//       bids.sort();
//       // console.log(bids);
//       const bidsJoinString = bids.join();
//       // console.log(bidsJoinString);
//       try {
//         // NOTE: We don't need to escape the 'bidsJoinString' because in validator we are checking branch ID's
//         // to be integer hence it will work fine.
//         [companyDistBranchList] = await pool.execute(
//           `
//             SELECT bran_id AS id, bran_name AS name
//             FROM branch
//             WHERE bran_id IN ( ${bidsJoinString} ) AND bran_comp_id = ?
//             ORDER BY bran_id
//           `,
//           [req.user.cid],
//         );
//         if (companyDistBranchList.length !== bids.length) {
//           await conn.rollback();
//           await conn.release();
//           const beGetListOfBranchesFailure = error.errList.dbError.ERR_DISTRIBUTOR_INSERT_BRANCH_LIST_LENGTH_FAILURE;
//           return res.status(500).send(responseGenerator.dbError(beGetListOfBranchesFailure));
//         }
//       } catch (e) {
//         await conn.rollback();
//         await conn.release();
//         console.log(e);
//         const beGetDetailsOfListOfBranchesFailure = error.errList.internalError.ERR_DISTRIBUTOR_INSERT_BRANCH_LIST_QUERY_FAILURE;
//         return res.status(500).send(responseGenerator.internalError(beGetDetailsOfListOfBranchesFailure));
//       }

//       let compDistBranchLinkInsertQuery = `
//               INSERT INTO distributor_manages_branch (emb_dist_id, emb_bran_id, emb_added_by, emb_added_by_name, emb_comp_id)
//               VALUES
//             `;
//       // console.log(companyDistBranchList);
//       const compDistBranchLinkInsertValues = [];
//       companyDistBranchList.forEach((branch, i) => {
//         if (i < companyDistBranchList.length - 1) {
//           compDistBranchLinkInsertQuery += ' (?, ?, ?, ?, ?), ';
//         } else {
//           compDistBranchLinkInsertQuery += ' (?, ?, ?, ?, ?); ';
//         }
//         // console.log(distributorDetails[0].name);
//         compDistBranchLinkInsertValues.push(companyDistInsert.insertId, companyDistBranchList[i].id, req.user.id, distributorDetails[0].name, req.user.cid);
//       });
//       try {
//         [companyDistBranchLink] = await conn.query(compDistBranchLinkInsertQuery, compDistBranchLinkInsertValues);
//         if (companyDistInsert.affectedRows !== 1) {
//           await conn.rollback();
//           await conn.release();
//           const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_COMPANY_DISTRIBUTOR_ADD_BRANCH_NO_INSERT_NO_EXCEPTION;
//           return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
//         }
//       } catch (e) {
//         console.log(e);
//         await conn.rollback();
//         await conn.release();
//         const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_DISTRIBUTOR_ADD_BRANCH_INSERT_DETAILS_FAILURE;
//         return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
//       }

//       // Release final connection after commit

//       try {
//         await conn.commit();
//         await conn.release();
//         // await conn.query('ROLLBACK');
//       } catch (e) {
//         await conn.rollback();
//         await conn.release();
//         const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMMIT_TRANSACTION_FAILURE;
//         return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
//       }

//       let token;
//       let emailVerifyTokenGenerated = false;
//       try {
//         token = auth.genAuthTokenVerifyEmail({
//           id: companyDistInsert.insertId,
//           username: req.body.ui_distributor_name,
//           cid: req.user.cid,
//           emailVerify: true,
//         });
//         emailVerifyTokenGenerated = true;
//       } catch (e) {
//         console.log(e);
//         emailVerifyTokenGenerated = false;
//         // const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
//         // return res.status(405).send(responseGenerateTokenError);
//       }
//       let beEmailVerificationSent;
//       if (emailVerifyTokenGenerated) {
//         const beEmailVerifyLink = `${config.get('emailBaseLink')}/email/verify?email_verify_tkn=${token}`;
//         // console.log(beEmailVerifyLink);
//         const beMessage = `
//       <div>
//         <h5>Dear ${req.body.ui_distributor_name},<h5>
//         <ul>
//           <li>click on the below button to verify email</li>
//           <li><button> <a href='${beEmailVerifyLink}'>Verify Email</a> </button></li>
//           <li>If the button does not work use the below link</li>
//           <li>${beEmailVerifyLink}</li>
//         </ul>

//         <div>
//           <p>Thanks and regards,</p>
//           <p>TMS team</p>
//         </div>
//       </div>
//         `;
//         // mail options which describe about the from to subject
//         // and message to be sent
//         const beMailOptions = {
//           from: config.get('nodeMailerConfig.from'),
//           to: req.body.ui_distributor_email,
//           // to: 'sharma.anuj1991@gmail.com',
//           subject: constant.emailSubject.EMAIL_VERIFICATION,
//           html: beMessage,
//         };

//         beEmailVerificationSent = false;
//         // this sends the verification message
//         try {
//           const emailResponse = await mailer.sendMail(beMailOptions);
//           // console.log(emailResponse);
//           beEmailVerificationSent = true;
//         } catch (e) {
//           console.log(e);
//           beEmailVerificationSentSent = false;
//           // const beEmailVerificationFailure = error.errList.internalError.ERR_EMAIL_VERIFICATION_MAIL_NOT_SENT;
//           // return res.status(500).send(responseGenerator.internalError(beEmailVerificationFailure));
//         }
//       }
//       const beEmailVerificationRespStr = beEmailVerificationSent
//         ? constant.emailVerificationRespString.SUCCESS
//         : constant.emailVerificationRespString.FAILURE;

//       return res.status(200).send(
//         responseGenerator.success('Distributor addition', 'Distributor addition successful', [
//           {
//             distributorName: req.body.ui_distributor_name,
//             distributorEmail: req.body.ui_distributor_email,
//             distributorRole: req.body.ui_distributor_role,
//             distributorMobile: req.body.ui_distributor_mobile,
//             distributorSecondaryMobile: beDistSecondaryMobile,
//             distributorGender: req.body.ui_distributor_gender,
//             distributorDob: req.body.ui_distributor_dob,
//             distributorAddress: req.body.ui_distributor_address,
//             distributorCity: req.body.ui_distributor_city,
//             distributorState: req.body.ui_distributor_state,
//             distributorCountry: req.body.ui_distributor_country,
//             distributorPinCode: req.body.ui_distributor_pincode,
//             distributorBranches: companyDistBranchList,
//             metaEmailVerificationEmail: beEmailVerificationRespStr,
//           },
//         ]),
//       );
//     }
//     // // This is unreachable code but added to solve eslint error
//     return false;
//   },
// );

/**
 * Change password route of a distributor
 *
 * @name /distributor/change/password
 *
 * @param {string} ui_current_password current password of the distributor
 * @param {string} ui_new_password new password of the distributor
 */
router.put(
  '/change/password',
  auth.protectTokenVerify,
  [
    vs.isDistributorPassword('body', 'ui_current_password', constant.passwordValidatorResponses.COMPANY_DISTRIBUTOR_LOGIN_PWD_RESPONSE),
    vs.isDistributorPassword('body', 'ui_new_password', constant.passwordValidatorResponses.COMPANY_DISTRIBUTOR_REGISTER_PASSWORD_RESPONSE),
  ],
  async (req, res, next) => {
    // Get validation Result
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_current_password', 'ui_new_password'];
      // This is if else so we don't need return
      return res.status(400).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const beUserID = req.user.id;
    // TODO Used Matched Data and used that to insert only
    const beCurrentPassword = req.body.ui_current_password;
    const beNewPassword = req.body.ui_new_password;
    let beHashedPassword = '';
    let rows;
    try {
      [rows] = await pool.execute('SELECT dist_pwd as current_password FROM distributor WHERE dist_id = ?', [beUserID, req.user.cid]);
    } catch (err) {
      const responseUnableToChange = responseGenerator.internalError(
        error.errList.internalError.ERR_SELECT_QUERY_DISTRIBUTOR_CHANGE_PASSWORD_FAILURE,
      );
      return res.status(400).send(responseUnableToChange);
    }
    if (rows.length) {
      let isValidPassword;
      try {
        isValidPassword = await auth.verifyPassword(beCurrentPassword, rows[0].current_password);
      } catch (e) {
        // Unable to compare hash and Password
        // console.log(e);
        const responseUnableToCompareHash = responseGenerator.internalError(error.errList.internalError.ERR_COMPARE_PASSWORD_AND_HASH);
        return res.status(400).send(responseUnableToCompareHash);
      }
      if (!isValidPassword) {
        const responsePasswordNoMatch = responseGenerator.dbError(error.errList.dbError.ERR_DISTRIBUTOR_CHANGE_PASSWORD_NO_MATCH);
        return res.status(400).send(responsePasswordNoMatch);
      }
      try {
        // NOTE We need to await this function as it is async
        beHashedPassword = await hash.hashPassword(beNewPassword);
      } catch (e) {
        // Unable to hash Password
        const responseUnableToHash = responseGenerator.internalError(error.errList.internalError.ERR_HASH_PASSWORD);
        return res.status(500).send(responseUnableToHash);
      }
      try {
        const [rows] = await pool.execute(
          `UPDATE distributor
                  SET dist_pwd = ?, dist_modified_by = dist_id, dist_modified_by_name = dist_name
                  WHERE dist_id = ?`,
          [beHashedPassword, beUserID, req.user.cid],
        );
        // Change password successfully
        if (rows.affectedRows) {
          const description = 'Password have been updated successfully for the distributor';
          return res.status(200).send(responseGenerator.success('Change password', description, []));
        }
        // Unsuccessfully update with no exception
        const responseUnableToUpdateWithoutException = responseGenerator.internalError(
          error.errList.internalError.ERR_DISTRIBUTOR_UPDATE_PASSWORD_NO_UPDATE_NO_EXCEPTION,
        );
        return res.status(400).send(responseUnableToUpdateWithoutException);
      } catch (e) {
        const responseUnableToUpdate = responseGenerator.internalError(
          error.errList.internalError.ERR_DISTRIBUTOR_CHANGE_PASSWORD_FAILURE_UPDATE_QUERY,
        );
        return res.status(400).send(responseUnableToUpdate);
      }
    } else {
      const responseUnableToUpdate = responseGenerator.internalError(error.errList.internalError.ERR_DISTRIBUTOR_CHANGE_PASSWORD_CAN_NOT_BE_DONE);
      return res.status(400).send(responseUnableToUpdate);
    }
  },
);

/**
 * Route to verify email of the distributor
 *
 * @name /distributor/verify/email/resend
 *
 */
router.post('/verify/email/resend', auth.protectTokenVerify, async (req, res) => {
  // console.log(req.user);
  let rows;
  try {
    [rows] = await pool.execute(
      `SELECT dist_id, dist_name, dist_email ,dist_is_email_verified, dist_comp_id
       FROM distributor 
       WHERE dist_id = ?;`,
      [req.user.id, req.user.cid],
    );
  } catch (e) {
    console.log(e);
    const beEmailSelectQueryFailed = error.errList.internalError.ERR_EMAIL_VERIFICATION_SELECT_FAILURE;
    return res.status(400).send(responseGenerator.internalError(beEmailSelectQueryFailed));
  }
  // console.log(rows);
  if (rows.length === 1) {
    if (rows[0].dist_is_email_verified === 1) {
      const beEmailAlreadyVerified = error.errList.dbError.ERR_EMAIL_ALREADY_VERIFIED;
      return res.status(400).send(responseGenerator.dbError(beEmailAlreadyVerified));
    }
    let token;
    try {
      token = auth.genAuthTokenVerifyEmail({
        id: rows[0].dist_id,
        username: rows[0].dist_name,
        cid: rows[0].dist_comp_id,
        emailVerify: true,
      });
    } catch (e) {
      const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
      return res.status(405).send(responseGenerateTokenError);
    }

    const beEmailVerifyLink = `${config.get('emailBaseLink')}/email/verify?email_verify_tkn=${token}`;
    console.log(beEmailVerifyLink);
    const beMessage = `
      <div>
        <h5>Dear ${rows[0].dist_name},<h5>
        <ul>
          <li>click on the below button to verify email</li>
          <li><button> <a href='${beEmailVerifyLink}'>Verify Email</a> </button></li>
          <li>If the button does not work use the below link</li>
          <li>${beEmailVerifyLink}</li>
        </ul>

        <div>
          <p>Thanks and regards,</p>
          <p>TMS team</p>
        </div>
      </div>
        `;
    // mail options which describe about the from to subject
    // and message to be sent
    const beMailOptions = {
      from: config.get('nodeMailerConfig.from'),
      to: rows[0].dist_email,
      // to: 'sharma.anuj1991@gmail.com',
      subject: constant.emailSubject.EMAIL_VERIFICATION,
      html: beMessage,
    };
    // this sends the message
    try {
      const emailResponse = await mailer.sendMail(beMailOptions);
      // console.log(emailResponse);
      return res
        .status(200)
        .send(responseGenerator.success('Email verification', 'Email verification link has been sent to the registered email..', []));
    } catch (e) {
      console.log(e);
      const beEmailVerificationFailure = error.errList.internalError.ERR_EMAIL_VERIFICATION_MAIL_NOT_SENT;
      return res.status(500).send(responseGenerator.internalError(beEmailVerificationFailure));
    }
  } else {
    const beEmailDistributorDetailsNotFound = error.errList.dbError.ERR_EMAIL_VERIFICATION_NO_DETAILS;
    return res.status(404).send(responseGenerator.dbError(beEmailDistributorDetailsNotFound));
  }
  // // No need this return but added because
  // return 0;
});

/**
 * Route to verify the email i.e to update the distributor email verification status
 *
 * @name /distributor/verify/email/confirm
 *
 * @param email_verify_tkn : token which has been sent to the user
 */
router.put('/verify/email/confirm', auth.protectEmailVerify, async (req, res) => {
  // console.log(req.user);
  try {
    const [rows] = await pool.execute(
      'UPDATE distributor SET dist_is_email_verified = ?, dist_modified_by = dist_id, dist_modified_by_name = dist_name WHERE dist_id = ?',
      [constant.emailVerifiedCode.CODE, req.user.id, req.user.cid],
    );
    if (rows.affectedRows === 1) {
      return res.status(200).send(responseGenerator.success('Email Verification', 'Email verified successfully', []));
    }
    const beEmailVerificationFailure = error.errList.dbError.ERR_EMAIL_VERIFICATION_UPDATE_NO_UPDATE_NO_EXCEPTION;
    return res.status(500).send(responseGenerator.dbError(beEmailVerificationFailure));
  } catch (e) {
    console.log(e);
    const beEmailVerificationFailure = error.errList.internalError.ERR_EMAIL_VERIFICATION_UPDATE_TABLE_ERROR;
    return res.status(500).send(responseGenerator.internalError(beEmailVerificationFailure));
  }
});

/**
 * @name /distributor/forgot/password
 *
 * NOTE: For mobile we should have OTP based login hence no need to reset password.
 * If we still want to reset password then we need to send OTP and not verification email
 *
 * @param ui_username Email of the distributor
 * @param ui_company_code company code of the distributor
 */
router.post('/forgot/password', [vs.isEmail('body', 'ui_username'), vs.isValidCompanyCode('body', 'ui_company_code')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['ui_username', 'ui_company_code'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  let rows;
  try {
    [rows] = await pool.execute(
      `SELECT dist_id, dist_name, dist_email, dist_comp_id 
        FROM distributor 
        WHERE dist_email = ? OR dist_primary_mobile = ?;`,
      [req.body.ui_username, req.body.ui_username],
    );
  } catch (e) {
    console.log(e);
    const beResetPasswordSelectDetailsError = error.errList.internalError.ERR_RESET_PASSWORD_SELECT_DETAILS_FAILURE;
    return res.status(500).send(responseGenerator.internalError(beResetPasswordSelectDetailsError));
  }
  // console.log(rows);
  if (rows.length === 1) {
    let token;
    try {
      token = auth.genAuthTokenResetPassword({
        id: rows[0].dist_id,
        cid: rows[0].dist_comp_id,
        resetPassword: true,
      });
    } catch (e) {
      const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
      return res.status(405).send(responseGenerateTokenError);
    }

    const beResetPasswordLink = `${config.get('emailBaseLink')}/distributor/reset/password?reset_pwd_tkn=${token}`;
    // console.log(beResetPasswordLink);
    const beMessage = `
        <div>
          <h3>Reset Password link<h3>
          <ul>
            <li>Please use the below link to reset your password</li>
            <li>${beResetPasswordLink}</li>
            <li>Note that the above link expires in 30 minutes</li>
          </ul>
          <div>
            <p>Thanks and regards,</p>
            <p>TMS team</p>
          </div>
        </div>
        `;
    // mail options which describe about the from to subject
    // and message to be sent
    const beMailOptions = {
      from: config.get('nodeMailerConfig.from'),
      to: rows[0].dist_email,
      // to: 'sivakusi12@gmail.com',
      subject: constant.emailSubject.RESET_PASSWORD,
      html: beMessage,
    };
    // this sends the message
    try {
      const emailResetPassword = await mailer.sendMail(beMailOptions);
      return res.status(200).send(responseGenerator.success('Reset Password Request', 'Reset Password link sent for the registered email', []));
    } catch (e) {
      const beResetPasswordMailFailed = error.errList.internalError.ERR_RESET_PASSWORD_EMAIL_NOT_SENT;
      return res.status(500).send(responseGenerator.internalError(beResetPasswordMailFailed));
    }
  } else {
    const beDistributorDetailsNotFound = error.errList.dbError.ERR_RESET_PASSWORD_NO_DETAILS;
    return res.status(404).send(responseGenerator.dbError(beDistributorDetailsNotFound));
  }
});

/**
 * @name /distributor/reset_password/:reset_pwd_tkn
 *
 * @param ui_new_password : new password of the ****
 * @param reset_pwd_tkn :  token for reset password
 */
router.put(
  '/reset/password/:reset_pwd_tkn',
  auth.protectResetPasswordRoute,
  [vs.isDistributorPassword('body', 'ui_new_password', constant.passwordValidatorResponses.COMPANY_DISTRIBUTOR_REGISTER_PASSWORD_RESPONSE)],
  async (req, res) => {
    // console.log(req.user);
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_new_password'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const beNewPassword = req.body.ui_new_password;
    let beHashedPassword;
    try {
      // NOTE We need to await this function as it is async
      beHashedPassword = await hash.hashPassword(beNewPassword);
    } catch (e) {
      // Unable to hash Password
      // console.log(e);
      const responseUnableToHash = responseGenerator.internalError(error.errList.internalError.ERR_HASH_PASSWORD);
      return res.status(500).send(responseUnableToHash);
    }
    try {
      const [rows] = await pool.execute(
        `UPDATE distributor
          SET dist_pwd = ?, dist_modified_by = dist_id, dist_modified_by_name = dist_name
          WHERE dist_id = ?`,
        [beHashedPassword, req.user.id, req.user.cid],
      );
      // Change password successfully
      if (rows.affectedRows) {
        const description = 'Password have been reset successfully for the user';
        return res.status(200).send(responseGenerator.success('Reset password', description, []));
      }
      // Unsuccessfully update with no exception
      const responseUnableToUpdateWithoutException = responseGenerator.dbError(error.errList.dbError.ERR_RESET_PASSWORD_NO_UPDATE_NO_EXCEPTION);
      return res.status(400).send(responseUnableToUpdateWithoutException);
    } catch (e) {
      console.log(e);
      const responseUnableToUpdate = responseGenerator.internalError(error.errList.internalError.ERR_RESET_PASSWORD_UPDATE_FAILED);
      return res.status(400).send(responseUnableToUpdate);
    }
  },
);

/**
 * Route for the distributor profile details
 *
 * @name /distributor/profile
 * @memberof /distributor
 *
 */
router.get('/profile', auth.protectTokenCheck, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT dist_name AS name , dist_email AS email, dist_primary_mobile AS primaryMobile, 
                dist_address AS address, dist_city AS city, dist_state AS state, dist_country AS country, 
                dist_pincode AS pincode, dist_secondary_mobile AS secondaryMobile, dist_remarks AS feedback
        FROM distributor
        WHERE dist_id = ?   
    `,
      [req.user.id],
    );
    console.log(req.user);
    console.log(rows);
    if (rows.length !== 1) {
      const beUserDetailsNotFound = responseGenerator.dbError(error.errList.dbError.ERR_DISTRIBUTOR_PROFILE_NOT_FOUND);
      return res.status(404).send(beUserDetailsNotFound);
    }
    const description = 'Distributor profile details fetched successfully';
    // return res.status(200).send(responseGenerator.success('Distributor Profile', description, rows));
    return res.render('distributorProfile', {name: rows[0].name, email: rows[0].email, primaryMobile: rows[0].primaryMobile, address: rows[0].address, city: rows[0].city, state: rows[0].state, country: rows[0].country, pin: rows[0].pincode, secondaryMobile: rows[0].secondaryMobile })
  } catch (e) {
    console.log(e);
    const beDistributorProfileError = responseGenerator.dbError(error.errList.dbError.ERR_DISTRIBUTOR_PROFILE_SELECT_ERROR);
    return res.status(404).send(beDistributorProfileError);
  }
});

/**
 * Route to upload profile image for an distributor
 *
 * @name /distributor/profile/image/upload
 * @memberof /distributor
 *
 * @param {image_field_name_in_the_front_end} distributor_image: distributor image field name in the form
 *
 */
router.post('/profile/image/upload', auth.protectTokenVerify, async (req, res) => {
  multer.uploadDistImage(req, res, async (err) => {
    if (err) {
      console.log(err);
      switch (err.code) {
        case 'LIMIT_UNEXPECTED_FILE':
          const errUnexpectedFile = error.errList.internalError.ERR_EMP_IMG_UPLOAD_IMAGE_WRONG_FIELD_NAME;
          return res.status(500).send(responseGenerator.internalError(errUnexpectedFile));
        case 'LIMIT_FILE_SIZE':
          const errFileSizeTooLarge = error.errList.internalError.ERR_EMP_IMG_UPLOAD_FILE_SIZE_TOO_LARGE;
          return res.status(400).send(responseGenerator.internalError(errFileSizeTooLarge));
        case '50143':
          return res.status(400).send(responseGenerator.internalError(err));
        default:
          const errUnknownError = error.errList.internalError.ERR_EMP_IMG_UPLOAD_IMAGE_UNKNOWN_ERROR;
          return res.status(500).send(responseGenerator.internalError(errUnknownError));
      }
    } else if (req.file == undefined) {
      const errFileNotSelected = error.errList.internalError.ERR_EMP_IMG_UPLOAD_IMAGE_FILE_NOT_SELECTED;
      return res.status(404).send(responseGenerator.internalError(errFileNotSelected));
    } else {
      // console.log(req.file);
      const filePath = constant.distributorImageStorageBaseLocation.PATH + req.file.filename;
      // console.log(filePath);
      try {
        const [rows] = await pool.execute('UPDATE distributor SET dist_image = ?  WHERE dist_id = ?', [filePath, req.user.id, req.user.cid]);
        if (rows.affectedRows !== 1) {
          const errDistImageUploadUpdateDBNoUpdateNOExp = error.errList.internalError.ERR_EMP_IMG_UPLOAD_DB_UPDATE_NO_UPDATE_NO_EXCEPTION;
          return res.status(404).send(responseGenerator.internalError(errDistImageUploadUpdateDBNoUpdateNOExp));
        }
        return res.status(200).send(responseGenerator.success('Upload profile image', 'Profile image uploaded successfully', [{ img: filePath }]));
      } catch (e) {
        const errDistImageUploadUpdateDBError = error.errList.internalError.ERR_EMP_IMG_UPLOAD_DB_UPDATE_ERROR;
        return res.status(404).send(responseGenerator.internalError(errDistImageUploadUpdateDBError));
      }
    }
  });
});

/**
 * route to view of register a sales officer
 * 
 * @name /distributor/register/salesOfficer
 */
router.get('/register/salesOfficer', auth.protectTokenCheck, async(req, res) => { res.render('salesOfficerRegistration');
})
module.exports = router;
