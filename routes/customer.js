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

const custIdPrefix = 'CUSTSK0';

const router = express.Router();

// /**
//  * Route for customer login page
//  * @name /customer/login
//  */
// router.get('/login', async (req, res) => res.render('customerLogin'));

/**
 * @name /customer/add/new
 */
router.get('/add/new', auth.protectTokenCheck, async (req, res) => {
  switch (req.user.role) {
    case constant.defaultRoles.DISTRIBUTOR:
      return res.render('customerRegistration');
    case constant.defaultRoles.MANAGER:
      return res.render('customerRegistrationManager');
    case constant.defaultRoles.DELIVERY:
      return res.render('customerRegistrationDelivery');
    default:
      return res.status(403).render(error);
  }
});

/**
 * @name /customer/add/new
 */
router.post(
  '/add/new',
  auth.protectTokenCheck,
  [
    vs.isValidStrLenWithTrim('body', 'ui_business_name', 3, 100, 'Please enter a valid business name between 3 to 100 characters'),
    vs.isValidStrLenWithTrim('body', 'ui_proprietor_name', 3, 50, 'Please enter a valid proprietor name between 3 to 50 characters'),
    vs.isMobile('body', 'ui_mobile'),
    vs.ifExistIsEmail('body', 'ui_email'),
    vs.isValidOMC('body', 'ui_omc'),
    vs.isNumeric('body', 'ui_latitude', 'Please get the valid location details'),
    vs.isNumeric('body', 'ui_longitude', 'Please get the valid location details'),
    vs.isValidStrLenWithTrim('body', 'ui_address', 3, 100, 'Please enter address name between 3 to 100 characters'),
    vs.ifExistIsMobile('body', 'ui_secondary_mobile', 3, 50, 'Please enter a valid proprietor name between 3 to 50 characters'),
    vs.isValidStrLenWithTrim('body', 'ui_city', 3, 50, 'Please select a valid city'),
    vs.isValidStrLenWithTrim('body', 'ui_state', 3, 50, 'Please select a valid state'),
    vs.isValidStrLenWithTrim('body', 'ui_country', 3, 50, 'Please select a valid country'),
    vs.isNumeric('body', 'ui_pincode', 'Please enter a valid pincode'),
    vs.isExactLenWithTrim('body', 'ui_pincode', 6, 'Pincode should be of 6 digits'),
    vs.isValidStrLenWithTrim('body', 'ui_feedback', 15, 2000, 'Please enter a valid feedback between 15 to 2000 characters'),
    vs.isNumeric('body', 'ui_demand', 'Please provide a valid demand details'),
    vs.isValidAvailableCylinderType('body', 'ui_demand_type', 'Please select a valid demand per Kgs or Cylinders'),
    vs.isNumeric('body', 'ui_current_package', 'Please provide a valid current package details '),
    vs.isValidAvailableCylinderType('body', 'ui_current_pkg_type', 'Please select a valid current package per Kgs or Cylinders'),
    vs.isNumeric('body', 'ui_discount', 'Please provide a valid current discount details '),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = [
        'ui_business_name',
        'ui_proprietor_name',
        'ui_mobile',
        'ui_email',
        'ui_omc',
        'ui_latitude',
        'ui_longitude',
        'ui_address',
        'ui_secondary_mobile',
        'ui_city',
        'ui_state',
        'ui_country',
        'ui_pincode',
        'ui_feedback',
        'ui_demand',
        'ui_demand_type',
        'ui_current_package',
        'ui_current_pkg_type',
        'ui_discount',
      ];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const defaultPwd = 'Qwerty12';
    const bePassword = defaultPwd;
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

    const custEmail = (req.body.ui_email === '' || req.body.ui_email === undefined  ) ? null : req.body.ui_email;
    // Variables for results
    let customerId;
    let customerInsert;
    let customerBusinessDetails;

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
      [customerId] = await conn.query('SELECT MAX(TRIM(LEADING ? FROM cust_id)) AS max FROM customer', [custIdPrefix]);
      // console.log(customerId[0].max + 1);
    } catch (e) {
      console.log(e);
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_BEGIN_TRANSACTION_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }
    const custId = custIdPrefix + pad(parseInt(customerId[0].max === null ? 0 : customerId[0].max) + 1, 6);
    // console.log(custId);

    try {
      [customerInsert] = await conn.query(
        `INSERT INTO customer(cust_id, cust_name, cust_business_name, cust_remarks, cust_email, cust_loc_lat, cust_loc_lon,
              cust_primary_mobile, cust_pwd, cust_secondary_mobile, cust_address, cust_city, 
              cust_state, cust_country, cust_pincode, cust_last_login_IP, cust_added_by, cust_added_by_name, cust_added_by_type) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          custId,
          req.body.ui_proprietor_name,
          req.body.ui_business_name,
          req.body.ui_feedback,
          custEmail,
          req.body.ui_latitude,
          req.body.ui_longitude,
          req.body.ui_mobile,
          beHashedPassword,
          req.body.ui_secondary_mobile,
          req.body.ui_address,
          req.body.ui_city,
          req.body.ui_state,
          req.body.ui_country,
          req.body.ui_pincode,
          req.ip,
          req.user.id,
          req.user.name,
          req.user.role,
        ],
      );
    } catch (e) {
      console.log(e);
      await conn.rollback();
      await conn.release();
      if (e.code === 'ER_DUP_ENTRY') {
        const beCustomerDetailsAlreadyExist = error.errList.dbError.ERR_CUSTOMER_ADD_DETAILS_EXISTS;
        return res.status(400).send(responseGenerator.dbError(beCustomerDetailsAlreadyExist));
      }
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMMIT_TRANSACTION_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }

    try {
      [customerBusinessDetails] = await conn.query(
        `INSERT INTO customer_demand_info(cdi_cust_id, cdi_cust_name, cdi_demand_per_month, cdi_demand_per_month_type, cdi_company_used,
              cdi_package, cdi_package_type, cdi_running_discount, cdi_added_by, cdi_added_by_name, cdi_added_by_type
        ) 
          VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
        [
          custId,
          req.body.ui_proprietor_name,
          req.body.ui_demand,
          req.body.ui_demand_type,
          req.body.ui_omc,
          req.body.ui_current_package,
          req.body.ui_current_pkg_type,
          req.body.ui_discount,
          req.user.id,
          req.user.name,
          req.user.role,
        ],
      );
    } catch (e) {
      await conn.rollback();
      await conn.release();
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
      responseGenerator.success('Customer addition', 'Customer added successfully', [
        {
          customerId: custId,
          businessName: req.body.ui_proprietor_name,
          proprietorName: req.body.ui_business_name,
          feedback: req.body.ui_feedback,
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
 * Route to list customers
 */
router.get('/list', auth.protectTokenCheck, async (req, res) => {
  // console.log(req.user.role);
  switch (req.user.role) {
    case constant.defaultRoles.DISTRIBUTOR:
      return res.render('customerList');
    case constant.defaultRoles.MANAGER:
      return res.render('customerListManager');
    case constant.defaultRoles.DELIVERY:
      return res.render('customerListDelivery');
    default:
      return res.status(403).render(error);
  }
});

/**
 * Route to list customers
 */
router.get('/list/all', auth.protectTokenCheck, async (req, res) => {
  // res.render('customerList');
  let query = `SELECT TRIM(LEADING ? FROM cust_id) AS sNo, cust_name AS proprietorName, 
  cust_business_name AS businessName, (SELECT cdi_company_used FROM customer_demand_info WHERE cdi_cust_id = cust_id) AS omc 
  FROM customer `;
  let queryParams = [custIdPrefix];
  switch (req.user.role) {
    case constant.defaultRoles.DISTRIBUTOR:
      // query += true;
      break; 
    case constant.defaultRoles.MANAGER:
      // query += ' WHERE  cust_added_by = ? AND cust_added_by_type = ?;'
      // queryParams.push(req.user.id, req.user.role);
      break;
    case constant.defaultRoles.DELIVERY:
      query += ' WHERE  cust_added_by = ? AND cust_added_by_type = ?;'
      queryParams.push(req.user.id, req.user.role);
      break;
    // default:
      // return res.status(403).render('403');
  }
  try {
    const [rows] = await pool.execute(
      query,
      queryParams
    );
    // console.log(rows);
    return res.status(200).send(responseGenerator.success('customer list', 'Customer list retrieved successfully', rows));
  } catch (e) {
    console.log(e);
    const beCustomerDetailsAlreadyExist = error.errList.internalError.ERR_CUSTOMER_ADD_DETAILS_EXISTS;
    return res.status(400).send(responseGenerator.internalError(beCustomerDetailsAlreadyExist));
  }
});

/**
 * Route to get the details of a customer view
 * @name /customer/details
 *
 */
router.get('/details', auth.protectTokenCheck, async (req, res) => {
  switch (req.user.role) {
    case constant.defaultRoles.DISTRIBUTOR:
      return res.render('customerDetails');
    case constant.defaultRoles.MANAGER:
      return res.render('customerDetailsManager');
    case constant.defaultRoles.DELIVERY:
      return res.render('customerDetailsDelivery');
    default:
      return res.status(403).render(error);
  }
});

/**
 * Route to get the details of a customer
 * @name /customer/details
 *
 */
router.get(
  '/details/:cust_id',
  auth.protectTokenCheck,
  [
    vs.isNumeric('params', 'cust_id', 'Please provide valid customer details'),
    vs.isExactLenWithTrim('params', 'cust_id', 6, 'Please provide valid customer details'),
  ],
  async (req, res) => {
    // console.log(req);
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['cust_id'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const custId = custIdPrefix + req.params.cust_id;
    let query =         `SELECT cust_name AS proprietorName, cust_business_name AS businessName, 
    cust_remarks AS feedback, cust_email AS email, cust_primary_mobile AS primaryMobile, cust_secondary_mobile AS secondaryMobile, 
    cust_address AS address, cust_city AS city, cust_state AS state, cust_country AS country, cust_pincode AS pincode,
    CONCAT(  cust_added_by_type, ': ', cust_added_by_name) AS addedBy, cust_loc_lat AS latitude, cust_loc_lon AS longitude,
    (SELECT cdi_company_used FROM customer_demand_info WHERE cdi_cust_id = cust_id) AS omc,
    (SELECT CONCAT(  cdi_demand_per_month, cdi_demand_per_month_type) FROM customer_demand_info WHERE cdi_cust_id = cust_id) AS demand,
    (SELECT CONCAT(  cdi_package, cdi_package_type) FROM customer_demand_info WHERE cdi_cust_id = cust_id) AS package,
    (SELECT CONCAT(  cdi_running_discount) FROM customer_demand_info WHERE cdi_cust_id = cust_id) AS discount
    FROM customer WHERE cust_id = ?  `;
    let queryParams = [custId];

    switch (req.user.role) {
      case constant.defaultRoles.DISTRIBUTOR:
        break; 
      case constant.defaultRoles.MANAGER:
        break;
      case constant.defaultRoles.DELIVERY:
        query += ' AND cust_added_by = ? AND cust_added_by_type = ?;'
        queryParams.push(req.user.id, req.user.role);
        break;
      default:
        return res.status(403).render(error);
    }
     
    try {
      const [rows] = await pool.execute(query,queryParams);
      // console.log(rows);
      return res.status(200).send(responseGenerator.success('Customer details', 'Customer details fetched successfully', rows));
    } catch (e) {
      console.log(e);
      const beCustomerDetailsAlreadyExist = error.errList.internalError.ERR_SELECT_COUNTRY_LIST_FAILURE;
      return res.status(400).send(responseGenerator.internalError(beCustomerDetailsAlreadyExist));
    }
    // return res.render('customerDetails');
  },
);
module.exports = router;
