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
const DelIdPrefix = 'DELVSK0';

/**
 * Route for manager home page
 * @name /manager/
 */
router.get('/', auth.protectDeliveryAccess, async (req, res) => res.render('deliveryHome'));


/**
 * Route for delivery login page
 * @name /delivery/login
 */
router.get('/login', auth.protectTokenVerify , async (req, res) => res.render('deliveryLogin'));

/**
 * Route for delivery home page
 * @name /delivery/
 */
router.get('/profile', auth.protectDeliveryAccess, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT delv_name AS name , delv_email AS email, delv_primary_mobile AS primaryMobile, 
                delv_address AS address, delv_city AS city, delv_state AS state, delv_country AS country, 
                delv_pincode AS pincode, delv_secondary_mobile AS secondaryMobile
        FROM delivery
        WHERE delv_id = ?   
    `,
      [req.user.id],
    );
    // console.log(req.user);
    // console.log(rows);
    if (rows.length !== 1) {
      const beUserDetailsNotFound = responseGenerator.dbError(error.errList.dbError.ERR_DISTRIBUTOR_PROFILE_NOT_FOUND);
      return res.status(404).send(beUserDetailsNotFound);
    }
    // const description = 'Distributor profile details fetched successfully';
    // return res.status(200).send(responseGenerator.success('Distributor Profile', description, rows));
    return res.render('deliveryProfile', {
      name: rows[0].name,
      email: rows[0].email,
      primaryMobile: rows[0].primaryMobile,
      address: rows[0].address,
      city: rows[0].city,
      state: rows[0].state,
      country: rows[0].country,
      pincode: rows[0].pincode,
      secondaryMobile: rows[0].secondaryMobile,
    });
  } catch (e) {
    console.log(e);
    const beDistributorProfileError = responseGenerator.dbError(error.errList.dbError.ERR_DISTRIBUTOR_PROFILE_SELECT_ERROR);
    return res.status(404).send(beDistributorProfileError);
  }
});

/**
 * @name /delivery/add/new
 */
router.post(
  '/add/new',
  auth.protectManagerAccess,
  [
    vs.isValidStrLenWithTrim('body', 'ui_name', 3, 50, 'Please enter a valid delivery officer name between 3 to 50 characters'),
    vs.isMobile('body', 'ui_primary_mobile'),
    vs.ifExistIsEmail('body', 'ui_email'),
    vs.isValidStrLenWithTrim('body', 'ui_address', 3, 100, 'Please enter address name between 3 to 100 characters'),
    vs.ifExistIsMobile('body', 'ui_secondary_mobile'),
    vs.isValidStrLenWithTrim('body', 'ui_city', 3, 50, 'Please select a valid city'),
    vs.isValidStrLenWithTrim('body', 'ui_state', 3, 50, 'Please select a valid state'),
    vs.isValidStrLenWithTrim('body', 'ui_country', 3, 50, 'Please select a valid country'),
    vs.isNumeric('body', 'ui_pincode', 'Please enter a valid pincode'),
    vs.isExactLenWithTrim('body', 'ui_pincode', 6, 'Pincode should be of 6 digits'),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = [
        'ui_name',
        'ui_mobile',
        'ui_email',
        'ui_address',
        'ui_secondary_mobile',
        'ui_city',
        'ui_state',
        'ui_country',
        'ui_pincode',
      ];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const bePassword = 'Qwerty12$';
    let beHashedPassword = '';
    try {
      // NOTE We need to await this function as it is async
      beHashedPassword = await hash.hashPassword(bePassword);
    } catch (e) {
      // Unable to hash Password
      const responseUnableToHash = responseGenerator.internalError(error.errList.internalError.ERR_HASH_PASSWORD);
      return res.status(500).send(responseUnableToHash);
    }
    let conn;
    try {
      conn = await pool.getConnection();
    } catch (e) {
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_GET_CONNECTION_FROM_POOL_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }

    const delvEmail = (req.body.ui_email === '' || req.body.ui_email === undefined  ) ? null : req.body.ui_email;
    // Variables for results
    let deliveryId;
    let deliveryInsert;

    // Begin Transaction
    try {
      await conn.beginTransaction();
    } catch (e) {
      // Begin transaction failure
      console.log(e);
      await conn.rollback();
      await conn.release();
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_BEGIN_TRANSACTION_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }

    try {
      [deliveryId] = await conn.query('SELECT MAX(TRIM(LEADING ? FROM delv_id)) AS max FROM delivery', [DelIdPrefix]);
    //   console.log(deliveryId[0]);
    } catch (e) {
      console.log(e);
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMMIT_TRANSACTION_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }
    const DvId = DelIdPrefix + pad(parseInt(deliveryId[0].max === null ? 0 : deliveryId[0].max)  + 1, 3);
    try {
      [deliveryInsert] = await conn.query(
        `INSERT INTO delivery(delv_id, delv_name, delv_email, delv_primary_mobile, delv_pwd, delv_secondary_mobile, 
            delv_address, delv_city, delv_state, delv_country, delv_pincode, delv_last_login_IP) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DvId,
          req.body.ui_name,
          delvEmail,
          req.body.ui_primary_mobile,
          beHashedPassword,
          req.body.ui_secondary_mobile,
          req.body.ui_address,
          req.body.ui_city,
          req.body.ui_state,
          req.body.ui_country,
          req.body.ui_pincode,
          req.ip,
        ],
      );
    } catch (e) {
      console.log(e);
      if (e.code === 'ER_DUP_ENTRY') {
        const beCustomerDetailsAlreadyExist = error.errList.dbError.ERR_CUSTOMER_ADD_DETAILS_EXISTS;
        return res.status(400).send(responseGenerator.dbError(beCustomerDetailsAlreadyExist));
      }
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMMIT_TRANSACTION_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }

    // Final commit and release the connection after the final commit
    try {
      await conn.commit();
      await conn.release();
      // await conn.query('ROLLBACK');
    } catch (e) {
      await conn.rollback();
      await conn.release();
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMMIT_TRANSACTION_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }
    return res.status(200).send(
      responseGenerator.success('Delivery Agent addition', 'Delivery Agent added successfully', [
        {
          deliveryId: DvId,
          name: req.body.ui_name,
          email: req.body.ui_email,
          mobile: req.body.ui_mobile,
          secondaryMobile: req.body.ui_secondary_mobile,
          address: req.body.ui_address,
          city: req.body.ui_city,
          state: req.body.ui_state,
          country: req.body.ui_country,
          address: req.body.ui_pincode,
        },
      ]),
    );
  },
);

function pad(number, length) {
  let str = `${number}`;
  while (str.length < length) {
    str = `0${str}`;
  }

  return str;
}

/**
 * route for company delivery login
 *
 * @name /delivery/login
 *
 * @param ui_username : Email or mobile of the delivery
 * @param ui_password : password of the delivery
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

    let qStrDistDetails = 'SELECT delv_id, delv_name, delv_pwd, delv_is_email_verified FROM delivery ';

    let qRespDistDetails;
    if (hf.isEmail(beUsername)) {
      qStrDistDetails += 'WHERE delv_email = ?';
    } else {
      qStrDistDetails += 'WHERE delv_primary_mobile = ?';
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
        isValidPassword = await auth.verifyPassword(bePassword, qRespDistDetails[0].delv_pwd);
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
          id: qRespDistDetails[0].delv_id,
          name: qRespDistDetails[0].delv_name, 
          role: constant.defaultRoles.DELIVERY,
          // Use JSON.parse instead of string.split() because JSON.parse convert it to array of numbers
          // but .split() convert it to array of strings. // branchID: qBranchIDList[0].branch_ids.split(','),
          [constant.tokenType.KEY]: constant.tokenType.value.DELIVERY,
          [constant.permissionKey.CUSTOMER]: true,
          [constant.permissionKey.DISTRIBUTOR]: false,
          [constant.permissionKey.MANAGER]: false,
          [constant.permissionKey.DELIVERY]: true,
        });
      } catch (e) {
        const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
        return res.status(405).send(responseGenerateTokenError);
      }
      const emailVerified = qRespDistDetails[0].delv_is_email_verified ? 'Verified' : 'Not Verified';
      const items = [
        {
          username: qRespDistDetails[0].delv_name,
          isEmailVerified: emailVerified,
        },
      ];
      try {
        const [ipUpdate] = await pool.execute(
          `
                UPDATE delivery 
                SET delv_last_login = ? , delv_last_login_IP = ?
                WHERE delv_id = ?;
              `,
          [req.utc_start_time.format('YYYY-MM-DD HH:mm:ss'), req.ip, qRespDistDetails[0].delv_id],
        );
      } catch (e) {
        console.log(e);
        const responseStudentLoginUpdateQueryFailure = responseGenerator.dbError(error.errList.dbError.ERR_LOGIN_USER_UPDATE_IP_FAILURE);
        return res.status(500).send(responseStudentLoginUpdateQueryFailure);
      }
      res.cookie('x-id-token', token, { httpOnly: true });
      // res
      return res
        .status(200)
        .header(constant.TOKEN_NAME, token)
        .send(responseGenerator.success('login', 'Login Successful!!!', items));
      // });
    }
    // Distributor does not exist in DB
    const responseCompDistributorNotExist = responseGenerator.dbError(error.errList.dbError.ERR_MANAGER_DOES_NOT_EXIST);
    return res.status(405).send(responseCompDistributorNotExist);
  },
);

/**
 * Change password route of a delivery
 *
 * @name /delivery/change/password
 *
 * @param {string} ui_current_password current password of the delivery
 * @param {string} ui_new_password new password of the delivery
 */
router.put(
  '/change/password',
  auth.protectTokenCheck,
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
      [rows] = await pool.execute('SELECT delv_pwd as current_password FROM delivery WHERE delv_id = ?', [beUserID]);
    } catch (err) {
      const responseUnableToChange = responseGenerator.internalError(
        error.errList.internalError.ERR_SELECT_QUERY_USER_CHANGE_PASSWORD_FAILURE,
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
        const responsePasswordNoMatch = responseGenerator.dbError(error.errList.dbError.ERR_USER_CHANGE_PASSWORD_NO_MATCH);
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
          `UPDATE delivery
                  SET delv_pwd = ?
                  WHERE delv_id = ?`,
          [beHashedPassword, beUserID],
        );
        // Change password successfully
        if (rows.affectedRows) {
          const description = 'Password have been updated successfully for the delivery  agent';
          return res.status(200).send(responseGenerator.success('Change password', description, []));
        }
        // Unsuccessfully update with no exception
        const responseUnableToUpdateWithoutException = responseGenerator.internalError(
          error.errList.internalError.ERR_USER_UPDATE_PASSWORD_NO_UPDATE_NO_EXCEPTION,
        );
        return res.status(400).send(responseUnableToUpdateWithoutException);
      } catch (e) {
        console.log(e)
        const responseUnableToUpdate = responseGenerator.internalError(
          error.errList.internalError.ERR_USER_CHANGE_PASSWORD_FAILURE_UPDATE_QUERY,
        );
        return res.status(400).send(responseUnableToUpdate);
      }
    } else {
      const responseUnableToUpdate = responseGenerator.internalError(error.errList.internalError.ERR_USER_CHANGE_PASSWORD_CAN_NOT_BE_DONE);
      return res.status(400).send(responseUnableToUpdate);
    }
  },
);


module.exports = router;
