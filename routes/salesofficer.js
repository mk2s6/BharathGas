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
const SOIdPrefix = 'SAOFSK0';

/**
 * Route for sales login page
 * @name /sales/login
 */
router.get('/login', auth.protectTokenVerify , async (req, res) => res.render('salesOfficerLogin'));

/**
 * Route for sales home page
 * @name /sales/
 */
router.get('/', auth.protectSalesAccess, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT saof_name AS name , saof_email AS email, saof_primary_mobile AS primaryMobile, 
                saof_address AS address, saof_city AS city, saof_state AS state, saof_country AS country, 
                saof_pincode AS pincode, saof_secondary_mobile AS secondaryMobile
        FROM sales_officer
        WHERE saof_id = ?   
    `,
      [req.user.id],
    );
    console.log(req.user);
    console.log(rows);
    if (rows.length !== 1) {
      const beUserDetailsNotFound = responseGenerator.dbError(error.errList.dbError.ERR_DISTRIBUTOR_PROFILE_NOT_FOUND);
      return res.status(404).send(beUserDetailsNotFound);
    }
    // const description = 'Distributor profile details fetched successfully';
    // return res.status(200).send(responseGenerator.success('Distributor Profile', description, rows));
    return res.render('sales', {
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
 * @name /sales_officer/add/new
 */
router.post(
  '/add/new',
  auth.protectDistributorAccess,
  [
    vs.isValidStrLenWithTrim('body', 'ui_name', 3, 50, 'Please enter a valid manager name between 3 to 50 characters'),
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

    // Variables for results
    let salesOfficerId;
    let salesOfficerInsert;

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
      [salesOfficerId] = await conn.query('SELECT MAX(TRIM(LEADING ? FROM saof_id)) AS max FROM sales_officer', [SOIdPrefix]);
      // console.log(salesOfficerId[0]);
    } catch (e) {
      console.log(e);
    }
    const SOId = SOIdPrefix + pad(parseInt(salesOfficerId[0].max === null ? 0 : salesOfficerId[0].max)  + 1, 3);
    // console.log(SOId);

    try {
      [salesOfficerInsert] = await conn.query(
        `INSERT INTO sales_officer(saof_id, saof_name, saof_email, saof_primary_mobile, saof_pwd, saof_secondary_mobile, 
            saof_address, saof_city, saof_state, saof_country, saof_pincode, saof_last_login_IP) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          SOId,
          req.body.ui_name,
          req.body.ui_email,
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
      responseGenerator.success('Manager addition', 'Manager added successfully', [
        {
          salesOfficerId: SOId,
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
 * route for company sales login
 *
 * @name /sales/login
 *
 * @param ui_username : Email or mobile of the sales
 * @param ui_password : password of the sales
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

    let qStrDistDetails = 'SELECT saof_id, saof_name, saof_pwd, saof_is_email_verified FROM sales_officer ';

    let qRespDistDetails;
    if (hf.isEmail(beUsername)) {
      qStrDistDetails += 'WHERE saof_email = ?';
    } else {
      qStrDistDetails += 'WHERE saof_primary_mobile = ?';
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
        isValidPassword = await auth.verifyPassword(bePassword, qRespDistDetails[0].saof_pwd);
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
          id: qRespDistDetails[0].saof_id,
          name: qRespDistDetails[0].saof_name,
          role: constant.defaultRoles.SALES_OFFICER,
          // Use JSON.parse instead of string.split() because JSON.parse convert it to array of numbers
          // but .split() convert it to array of strings. // branchID: qBranchIDList[0].branch_ids.split(','),
          [constant.tokenType.KEY]: constant.tokenType.value.SALES_OFFICER,
          [constant.permissionKey.CUSTOMER]: true,
          [constant.permissionKey.DISTRIBUTOR]: false,
          [constant.permissionKey.SALES_OFFICER]: true,
          [constant.permissionKey.DELIVERY]: true,
        });
      } catch (e) {
        const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
        return res.status(405).send(responseGenerateTokenError);
      }
      const emailVerified = qRespDistDetails[0].saof_is_email_verified ? 'Verified' : 'Not Verified';
      const items = [
        {
          username: qRespDistDetails[0].saof_name,
          isEmailVerified: emailVerified,
        },
      ];
      try {
        const [ipUpdate] = await pool.execute(
          `
                UPDATE sales_officer 
                SET saof_last_login = ? , saof_last_login_IP = ?
                WHERE saof_id = ?;
              `,
          [req.utc_start_time.format('YYYY-MM-DD HH:mm:ss'), req.ip, qRespDistDetails[0].saof_id],
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
    const responseCompDistributorNotExist = responseGenerator.dbError(error.errList.dbError.ERR_SALES_OFFICER_DOES_NOT_EXIST);
    return res.status(405).send(responseCompDistributorNotExist);
  },
);

/**
 * route to view of register a manager
 *
 * @name /sales/register/delivery
 */
router.get('/register/delivery', auth.protectSalesAccess, async (req, res) => {
  res.render('deliveryRegistration');
});

module.exports = router;
