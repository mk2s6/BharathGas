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

// ================================================================
//      LT table routes
// ================================================================

/**
 * this route is used to list the employee roles when user try to add employee from company dashboard
 * and not from branch dashboard
 *
 * @name /employee/role/list/:type
 * @memberof /employee
 *
 * @param {company|branch} type: Type of the roles which used to get the certain roles.
 *
 */
router.get('/role/list/:type', [vs.isValidEmployeeRoleList('params', 'type')], auth.protectEmployeeMgmtRoute, async (req, res) => {
  try {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['type'];
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const beRolesType = req.params.type ? req.params.type.toLowerCase() : null;
    let beEmpRoleType;
    if (beRolesType === constant.empRoleListTypes.COMPANY) beEmpRoleType = true;
    else beEmpRoleType = false;

    const [rows] = await pool.execute('SELECT GROUP_CONCAT(lt_emp_role) as roles FROM lt_emp_role WHERE lt_emp_role_is_comp_level = ?', [
      beEmpRoleType,
    ]);
    return res.status(200).send(responseGenerator.success('Employee role list', 'List of employee roles', rows[0].roles.split(',')));
  } catch (e) {
    // console.log(e);
    const beEmployeeRolesListSelectError = error.errList.internalError.ERR_SELECT_EMPLOYEE_ROLE_LIST_FAILURE;
    return res.status(500).send(responseGenerator.internalError(beEmployeeRolesListSelectError));
  }
});

// /**
//  * This route is used to add a employee role to the list of employee roles
//  *
//  * @name /all/employee_role/add
//  * @memberof /all
//  *
//  * @param ui_name : name of the employee role
//  *
//  */
// router.post(
//   '/employee_role/add',
//   auth.protectFSJEmpAdminRoute,
//   [vs.isValidStrLenWithTrim('body', 'ui_name', 3, 20, 'Employee role name must be of 3 to 20 characters in length')],
//   async (req, res) => {
//     const errors = vs.getValidationResult(req);
//     if (!errors.isEmpty()) {
//       const fieldsToValidate = ['ui_name'];
//       return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
//     }
//     const beName = req.body.ui_name;
//     try {
//       const [rows] = await pool.execute('INSERT INTO lt_employee_role (role, added_by) VALUES (?, ?)', [
//         beName,
//         req.user.id,
//       ]);
//       if (rows.affectedRows === 1) {
//         const beDescription = 'Employee role added successfully';
//         return res
//           .status(200)
//           .send(responseGenerator.success('Employee role addition', beDescription, [{ status: beName }]));
//       }
//       const beEmployeeRolesUnableToInsertNoException = error.errList.internalError.ERR_INSERT_EMPLOYEE_ROLE_NO_EXCEPTION_INSERT_ERROR;
//       return res.status(500).send(responseGenerator.internalError(beEmployeeRolesUnableToInsertNoException));
//     } catch (e) {
//       console.log(e);
//       if (e.code === 'ER_DUP_ENTRY') {
//         const beEmployeeRolesDuplicateEntry = error.errList.dbError.ERR_INSERT_EMPLOYEE_ROLE_DUPLICATE_ENTRY;
//         return res.status(400).send(responseGenerator.dbError(beEmployeeRolesDuplicateEntry));
//       }
//       const beEmployeeRolesInsertError = error.errList.internalError.ERR_INSERT_EMPLOYEE_ROLE_FAILURE;
//       return res.status(500).send(responseGenerator.internalError(beEmployeeRolesInsertError));
//     }
//   },
// );

// ================================================================
//      COMPANY EMPLOYEE RELATED ROUTES
// ================================================================

/**
 * route for company employee login
 *
 * @name /employee/login
 *
 * @param ui_company_code : company code of the employee
 * @param ui_username : Email or mobile of the employee
 * @param ui_password : password of the employee
 *
 */
router.post(
  '/login',
  [
    vs.isValidCompanyCode('body', 'ui_company_code'),
    vs.isEmailOrMobile('body', 'ui_username'),
    vs.isCompanyEmployeePassword('body', 'ui_password', constant.passwordValidatorResponses.COMPANY_EMPLOYEE_LOGIN_PWD_RESPONSE),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_company_code', 'ui_username', 'ui_password'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const bePassword = req.body.ui_password;
    const beUsername = req.body.ui_username;

    let qStrEmpDetails = `SELECT emp_id, emp_name, emp_pwd, emp_image, emp_is_email_verified, 
                              emp_role, emp_comp_id FROM employee `;

    let qRespEmpDetails;
    if (hf.isEmail(beUsername)) {
      qStrEmpDetails += 'WHERE emp_comp_code = ? AND emp_email = ?';
    } else {
      qStrEmpDetails += 'WHERE emp_comp_code = ? AND emp_mobile_primary = ?';
    }

    try {
      [qRespEmpDetails] = await pool.execute(qStrEmpDetails, [req.body.ui_company_code, req.body.ui_username]);
    } catch (e) {
      console.log(e);
      const responseExceptionInSelect = responseGenerator.internalError(error.errList.internalError.ERR_LOGIN_SELECT_THROW_EXCEPTION);
      return res.status(500).send(responseExceptionInSelect);
    }
    // Employee exist in DB
    // console.log(qRespEmpDetails);
    if (qRespEmpDetails.length === 1) {
      // Verify password
      let isValidPassword;
      try {
        isValidPassword = await auth.verifyPassword(bePassword, qRespEmpDetails[0].emp_pwd);
      } catch (e) {
        // Unable to compare hash and Password
        const responseUnableToCompareHash = responseGenerator.internalError(error.errList.internalError.ERR_COMPARE_PASSWORD_AND_HASH);
        return res.status(400).send(responseUnableToCompareHash);
      }
      if (!isValidPassword) {
        const responsePasswordNoMatch = responseGenerator.dbError(error.errList.dbError.ERR_LOGIN_EMPLOYEE_PASSWORD_NO_MATCH);
        return res.status(400).send(responsePasswordNoMatch);
      }

      let qRespRolePermission;
      // Login Success hence fetch role details
      try {
        [qRespRolePermission] = await pool.execute(
          `SELECT lt_emp_role_enq_mgmt, lt_emp_role_comp_setting, lt_emp_role_employee_mgmt 
          FROM lt_emp_role
          WHERE lt_emp_role=?`,
          [qRespEmpDetails[0].emp_role],
        );
      } catch (e) {
        console.log(e);
        const responseExceptionInSelect = responseGenerator.internalError(error.errList.internalError.ERR_LOGIN_SELECT_ROLE_PERMISSION_FAILURE);
        return res.status(500).send(responseExceptionInSelect);
      }

      // Login Success hence fetch the branch_ID's from the location employee manage branch table
      let qBranchIDList;
      try {
        [qBranchIDList] = await pool.execute(
          `SELECT GROUP_CONCAT(emb_bran_id) as branch_ids
           FROM employee_manages_branch
           WHERE emb_emp_id =? AND emb_comp_id =?
           ORDER BY emb_bran_id`, // Order by helps when we compare branch in protectBranchDetails route.
          [qRespEmpDetails[0].emp_id, qRespEmpDetails[0].emp_comp_id],
        );
      } catch (e) {
        console.log(e);
        const responseExceptionInSelect = responseGenerator.internalError(error.errList.internalError.ERR_LOGIN_SELECT_BRANCH_LIST_FAILURE);
        return res.status(500).send(responseExceptionInSelect);
      }
      // console.log(qBranchIDList);
      // Login Success response
      let token;
      try {
        token = auth.genAuthToken({
          id: qRespEmpDetails[0].emp_id,
          cid: qRespEmpDetails[0].emp_comp_id,
          role: qRespEmpDetails[0].emp_role,
          // Use JSON.parse instead of string.split() because JSON.parse convert it to array of numbers
          // but .split() convert it to array of strings. // branchID: qBranchIDList[0].branch_ids.split(','),
          bids: JSON.parse(`[${qBranchIDList[0].branch_ids}]`),
          [constant.tokenType.KEY]: constant.tokenType.value.EMPLOYEE,
          [constant.permissionKey.ENQUIRY_MANAGEMENT]: qRespRolePermission[0].lt_emp_role_enq_mgmt,
          [constant.permissionKey.COMPANY_SETTING]: qRespRolePermission[0].lt_emp_role_comp_setting,
          [constant.permissionKey.EMPLOYEE_MANAGEMENT]: qRespRolePermission[0].lt_emp_role_employee_mgmt,
        });
      } catch (e) {
        const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
        return res.status(405).send(responseGenerateTokenError);
      }
      const emailVerified = qRespEmpDetails[0].emp_is_email_verified ? 'Verified' : 'Not Verified';
      const items = [
        {
          username: qRespEmpDetails[0].emp_name,
          image: qRespEmpDetails[0].emp_image,
          isEmailVerified: emailVerified,
        },
      ];
      try {
        const [ipUpdate] = await pool.execute(
          `
                UPDATE employee 
                SET emp_last_login = ? , emp_last_login_IP = ?
                WHERE emp_id = ?;
              `,
          [req.utc_start_time.format('YYYY-MM-DD HH:mm:ss'), req.ip, qRespEmpDetails[0].emp_id],
        );
      } catch (e) {
        console.log(e);
        const responseStudentLoginUpdateQueryFailure = responseGenerator.dbError(error.errList.dbError.ERR_LOGIN_USER_UPDATE_IP_FAILURE);
        return res.status(500).send(responseStudentLoginUpdateQueryFailure);
      }
      return res
        .status(200)
        .header(constant.TOKEN_NAME, token)
        .send(responseGenerator.success('login', 'Login Successful!!!', items));
    }
    // Employee does not exist in DB
    const responseCompEmployeeNotExist = responseGenerator.dbError(error.errList.dbError.ERR_COMPANY_EMPLOYEE_LOGIN_EMPLOYEE_DOES_NOT_EXIST);
    return res.status(405).send(responseCompEmployeeNotExist);
  },
);

/**
 * Route to add new employee to a branch or branches
 *
 * @name /employee/add/new
 *
 * @param ui_employee_name : name of the employee of the company
 * @param {Array} ui_branch_id : branch where the employee is being assigned
 * @param ui_employee_email : email of the employee of the company
 * @param ui_employee_password : password for the company's employee account
 * @param ui_employee_mobile : mobile number of the employee of the company
 * @param ui_employee_secondary_mobile: secondary mobile of the employee
 * @param ui_employee_gender : gender of the employee of the company
 * @param ui_employee_role : role of the employee
 * @param ui_employee_dob : date of birth of the employee
 * @param ui_employee_address : address where the employee lives
 * @param ui_employee_city : city where the employee lives
 * @param ui_employee_state : state where the employee lives
 * @param ui_employee_country : country where the employee lives
 * @param ui_employee_pincode : pincode of the employee's address
 *
 */
router.post(
  '/add/new',
  auth.protectEmployeeMgmtRoute,
  [
    vs.isValidStrLenWithTrim('body', 'ui_employee_name', 3, 50, 'Please enter a valid employee name between 3 to 50 characters only.'),
    vs.isEmail('body', 'ui_employee_email'),
    vs.isBranches('body', 'ui_branch_id'),
    vs.isCompanyEmployeePassword('body', 'ui_employee_password', constant.passwordValidatorResponses.COMPANY_EMPLOYEE_REGISTER_PASSWORD_RESPONSE),
    vs.isMobile('body', 'ui_employee_mobile'),
    vs.ifExistIsMobile('body', 'ui_employee_secondary_mobile'),
    vs.isGender('body', 'ui_employee_gender'),
    vs.isValidStrLenWithTrim('body', 'ui_employee_role', 3, 20, 'Please enter the valid Employee Role.'),
    vs.isDOB('body', 'ui_employee_dob'),
    vs.isValidStrLenWithTrim('body', 'ui_employee_address', 0, 255, 'Address should not be more than 255 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_employee_city', 3, 50, 'Please enter a valid city name for the employee between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_employee_state', 3, 50, 'Please enter a valid state name for the employee between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_employee_country', 3, 50, 'Please enter a valid country name for the employee between 3 to 50 characters.'),
    vs.isPINCODE('body', 'ui_employee_pincode'),
  ],
  async (req, res) => {
    const branchArray = [parseInt(req.body.ui_branch_id, 10)];
    // console.log(auth.protectBranchAccess(req, res, branchArray));
    if (auth.protectBranchAccess(req, res, branchArray)) {
      const errors = vs.getValidationResult(req);
      if (!errors.isEmpty()) {
        const fieldsToValidate = [
          'ui_employee_name',
          'ui_branch_id',
          'ui_employee_email',
          'ui_employee_password',
          'ui_employee_mobile',
          'ui_employee_secondary_mobile',
          'ui_employee_gender',
          'ui_employee_role',
          'ui_employee_dob',
          'ui_employee_address',
          'ui_employee_city',
          'ui_employee_state',
          'ui_employee_country',
          'ui_employee_pincode',
        ];
        // This is if else so we don't need return
        return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
      }
      const bePassword = req.body.ui_employee_password;
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
      let companyEmpInsert;
      let employeeDetails;
      let companyEmpBranchList;
      let companyEmpBranchLink;

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
      const empImage = req.body.ui_employee_gender === 'Male' ? constant.defaultCompEmpImages.MALE : constant.defaultCompEmpImages.FEMALE;
      const beEmpSecondaryMobile = req.body.ui_employee_secondary_mobile || null;
      try {
        [employeeDetails] = await conn.query(
          `
            SELECT emp_name AS name
            FROM employee WHERE emp_id = ? AND emp_comp_id = ?;          
          `,
          [req.user.id, req.user.cid],
        );
        // console.log(employeeDetails);
      } catch (e) {
        console.log(e);
        await conn.rollback();
        await conn.release();
        const beTaskDeletionFailure = error.errList.internalError.ERR_EMPLOYEE_INSERT_SELECT_EMPLOYEE_DETAILS_FAILURE;
        return res.status(500).send(responseGenerator.internalError(beTaskDeletionFailure));
      }

      try {
        [companyEmpInsert] = await conn.query(
          `
              INSERT INTO employee (emp_name , emp_email, emp_pwd, emp_mobile_primary, emp_DOB, 
                emp_address, emp_city, emp_state, emp_country, emp_PIN, emp_image, emp_mobile_secondary,
                emp_gender, emp_role, emp_comp_code, emp_comp_id, emp_last_login_IP, emp_added_by, emp_added_by_name)
              SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, comp_code, ?, ?, ?, ?
              FROM company WHERE comp_id = ?
          `,
          [
            req.body.ui_employee_name,
            req.body.ui_employee_email,
            beHashedPassword,
            req.body.ui_employee_mobile,
            req.body.ui_employee_dob,
            req.body.ui_employee_address,
            req.body.ui_employee_city,
            req.body.ui_employee_state,
            req.body.ui_employee_country,
            req.body.ui_employee_pincode,
            empImage,
            beEmpSecondaryMobile,
            req.body.ui_employee_gender,
            req.body.ui_employee_role,
            req.user.cid,
            req.ip,
            req.user.id,
            employeeDetails[0].name,
            req.user.cid,
          ],
        );
        // console.log(companyEmpInsert);
        if (companyEmpInsert.affectedRows !== 1) {
          await conn.rollback();
          await conn.release();
          const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_COMPANY_EMPLOYEE_ADD_NO_INSERT_NO_EXCEPTION;
          return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
        }
      } catch (e) {
        console.log(e);
        await conn.rollback();
        await conn.release();
        if (e.code === 'ER_DUP_ENTRY') {
          const beEmployeeDetailsAlreadyExist = error.errList.dbError.ERR_COMPANY_EMPLOYEE_ADD_DETAILS_EXISTS;
          return res.status(400).send(responseGenerator.dbError(beEmployeeDetailsAlreadyExist));
        }
        const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_EMPLOYEE_ADD_INSERT_DETAILS_FAILURE;
        return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
      }

      const bids = req.body.ui_branch_id;
      bids.sort();
      // console.log(bids);
      const bidsJoinString = bids.join();
      // console.log(bidsJoinString);
      try {
        // NOTE: We don't need to escape the 'bidsJoinString' because in validator we are checking branch ID's
        // to be integer hence it will work fine.
        [companyEmpBranchList] = await pool.execute(
          ` 
            SELECT bran_id AS id, bran_name AS name
            FROM branch
            WHERE bran_id IN ( ${bidsJoinString} ) AND bran_comp_id = ?
            ORDER BY bran_id
          `,
          [req.user.cid],
        );
        if (companyEmpBranchList.length !== bids.length) {
          await conn.rollback();
          await conn.release();
          const beGetListOfBranchesFailure = error.errList.dbError.ERR_EMPLOYEE_INSERT_BRANCH_LIST_LENGTH_FAILURE;
          return res.status(500).send(responseGenerator.dbError(beGetListOfBranchesFailure));
        }
      } catch (e) {
        await conn.rollback();
        await conn.release();
        console.log(e);
        const beGetDetailsOfListOfBranchesFailure = error.errList.internalError.ERR_EMPLOYEE_INSERT_BRANCH_LIST_QUERY_FAILURE;
        return res.status(500).send(responseGenerator.internalError(beGetDetailsOfListOfBranchesFailure));
      }

      let compEmpBranchLinkInsertQuery = `
              INSERT INTO employee_manages_branch (emb_emp_id, emb_bran_id, emb_added_by, emb_added_by_name, emb_comp_id)
              VALUES 
            `;
      // console.log(companyEmpBranchList);
      const compEmpBranchLinkInsertValues = [];
      companyEmpBranchList.forEach((branch, i) => {
        if (i < companyEmpBranchList.length - 1) {
          compEmpBranchLinkInsertQuery += ' (?, ?, ?, ?, ?), ';
        } else {
          compEmpBranchLinkInsertQuery += ' (?, ?, ?, ?, ?); ';
        }
        // console.log(employeeDetails[0].name);
        compEmpBranchLinkInsertValues.push(companyEmpInsert.insertId, companyEmpBranchList[i].id, req.user.id, employeeDetails[0].name, req.user.cid);
      });
      try {
        [companyEmpBranchLink] = await conn.query(compEmpBranchLinkInsertQuery, compEmpBranchLinkInsertValues);
        if (companyEmpInsert.affectedRows !== 1) {
          await conn.rollback();
          await conn.release();
          const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_COMPANY_EMPLOYEE_ADD_BRANCH_NO_INSERT_NO_EXCEPTION;
          return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
        }
      } catch (e) {
        console.log(e);
        await conn.rollback();
        await conn.release();
        const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_EMPLOYEE_ADD_BRANCH_INSERT_DETAILS_FAILURE;
        return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
      }

      // Release final connection after commit

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

      let token;
      let emailVerifyTokenGenerated = false;
      try {
        token = auth.genAuthTokenVerifyEmail({
          id: companyEmpInsert.insertId,
          username: req.body.ui_employee_name,
          cid: req.user.cid,
          emailVerify: true,
        });
        emailVerifyTokenGenerated = true;
      } catch (e) {
        console.log(e);
        emailVerifyTokenGenerated = false;
        // const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
        // return res.status(405).send(responseGenerateTokenError);
      }
      let beEmailVerificationSent;
      if (emailVerifyTokenGenerated) {
        const beEmailVerifyLink = `${config.get('emailBaseLink')}/email/verify?email_verify_tkn=${token}`;
        // console.log(beEmailVerifyLink);
        const beMessage = `
      <div>
        <h5>Dear ${req.body.ui_employee_name},<h5>
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
          to: req.body.ui_employee_email,
          // to: 'sharma.anuj1991@gmail.com',
          subject: constant.emailSubject.EMAIL_VERIFICATION,
          html: beMessage,
        };

        beEmailVerificationSent = false;
        // this sends the verification message
        try {
          const emailResponse = await mailer.sendMail(beMailOptions);
          // console.log(emailResponse);
          beEmailVerificationSent = true;
        } catch (e) {
          console.log(e);
          beEmailVerificationSentSent = false;
          // const beEmailVerificationFailure = error.errList.internalError.ERR_EMAIL_VERIFICATION_MAIL_NOT_SENT;
          // return res.status(500).send(responseGenerator.internalError(beEmailVerificationFailure));
        }
      }
      const beEmailVerificationRespStr = beEmailVerificationSent
        ? constant.emailVerificationRespString.SUCCESS
        : constant.emailVerificationRespString.FAILURE;

      return res.status(200).send(
        responseGenerator.success('Employee addition', 'Employee addition successful', [
          {
            employeeName: req.body.ui_employee_name,
            employeeEmail: req.body.ui_employee_email,
            employeeRole: req.body.ui_employee_role,
            employeeMobile: req.body.ui_employee_mobile,
            employeeSecondaryMobile: beEmpSecondaryMobile,
            employeeGender: req.body.ui_employee_gender,
            employeeDob: req.body.ui_employee_dob,
            employeeAddress: req.body.ui_employee_address,
            employeeCity: req.body.ui_employee_city,
            employeeState: req.body.ui_employee_state,
            employeeCountry: req.body.ui_employee_country,
            employeePinCode: req.body.ui_employee_pincode,
            employeeBranches: companyEmpBranchList,
            metaEmailVerificationEmail: beEmailVerificationRespStr,
          },
        ]),
      );
    }
    // // This is unreachable code but added to solve eslint error
    return false;
  },
);

/**
 * Change password route of a employee
 *
 * @name /employee/change/password
 *
 * @param {string} ui_current_password current password of the employee
 * @param {string} ui_new_password new password of the employee
 */
router.put(
  '/change/password',
  auth.protectTokenVerify,
  [
    vs.isEmpPassword('body', 'ui_current_password', constant.passwordValidatorResponses.COMPANY_EMPLOYEE_LOGIN_PWD_RESPONSE),
    vs.isEmpPassword('body', 'ui_new_password', constant.passwordValidatorResponses.COMPANY_EMPLOYEE_REGISTER_PASSWORD_RESPONSE),
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
      [rows] = await pool.execute('SELECT emp_pwd as current_password FROM employee WHERE emp_id = ? AND emp_comp_id = ?', [beUserID, req.user.cid]);
    } catch (err) {
      const responseUnableToChange = responseGenerator.internalError(error.errList.internalError.ERR_SELECT_QUERY_EMPLOYEE_CHANGE_PASSWORD_FAILURE);
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
        const responsePasswordNoMatch = responseGenerator.dbError(error.errList.dbError.ERR_EMPLOYEE_CHANGE_PASSWORD_NO_MATCH);
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
          `UPDATE employee
                  SET emp_pwd = ?, emp_modified_by = emp_id, emp_modified_by_name = emp_name
                  WHERE emp_id = ? AND emp_comp_id = ?`,
          [beHashedPassword, beUserID, req.user.cid],
        );
        // Change password successfully
        if (rows.affectedRows) {
          const description = 'Password have been updated successfully for the employee';
          return res.status(200).send(responseGenerator.success('Change password', description, []));
        }
        // Unsuccessfully update with no exception
        const responseUnableToUpdateWithoutException = responseGenerator.internalError(
          error.errList.internalError.ERR_EMPLOYEE_UPDATE_PASSWORD_NO_UPDATE_NO_EXCEPTION,
        );
        return res.status(400).send(responseUnableToUpdateWithoutException);
      } catch (e) {
        const responseUnableToUpdate = responseGenerator.internalError(error.errList.internalError.ERR_EMPLOYEE_CHANGE_PASSWORD_FAILURE_UPDATE_QUERY);
        return res.status(400).send(responseUnableToUpdate);
      }
    } else {
      const responseUnableToUpdate = responseGenerator.internalError(error.errList.internalError.ERR_EMPLOYEE_CHANGE_PASSWORD_CAN_NOT_BE_DONE);
      return res.status(400).send(responseUnableToUpdate);
    }
  },
);

/**
 * Route to verify email of the employee
 *
 * @name /employee/verify/email/resend
 *
 */
router.post('/verify/email/resend', auth.protectTokenVerify, async (req, res) => {
  // console.log(req.user);
  let rows;
  try {
    [rows] = await pool.execute(
      `SELECT emp_id, emp_name, emp_email ,emp_is_email_verified, emp_comp_id
       FROM employee 
       WHERE emp_id = ? AND emp_comp_id = ?;`,
      [req.user.id, req.user.cid],
    );
  } catch (e) {
    console.log(e);
    const beEmailSelectQueryFailed = error.errList.internalError.ERR_EMAIL_VERIFICATION_SELECT_FAILURE;
    return res.status(400).send(responseGenerator.internalError(beEmailSelectQueryFailed));
  }
  // console.log(rows);
  if (rows.length === 1) {
    if (rows[0].emp_is_email_verified === 1) {
      const beEmailAlreadyVerified = error.errList.dbError.ERR_EMAIL_ALREADY_VERIFIED;
      return res.status(400).send(responseGenerator.dbError(beEmailAlreadyVerified));
    }
    let token;
    try {
      token = auth.genAuthTokenVerifyEmail({
        id: rows[0].emp_id,
        username: rows[0].emp_name,
        cid: rows[0].emp_comp_id,
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
        <h5>Dear ${rows[0].emp_name},<h5>
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
      to: rows[0].emp_email,
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
    const beEmailEmployeeDetailsNotFound = error.errList.dbError.ERR_EMAIL_VERIFICATION_NO_DETAILS;
    return res.status(404).send(responseGenerator.dbError(beEmailEmployeeDetailsNotFound));
  }
  // // No need this return but added because
  // return 0;
});

/**
 * Route to verify the email i.e to update the employee email verification status
 *
 * @name /employee/verify/email/confirm
 *
 * @param email_verify_tkn : token which has been sent to the user
 */
router.put('/verify/email/confirm', auth.protectEmailVerify, async (req, res) => {
  // console.log(req.user);
  try {
    const [rows] = await pool.execute(
      'UPDATE employee SET emp_is_email_verified = ?, emp_modified_by = emp_id, emp_modified_by_name = emp_name WHERE emp_id = ? AND emp_comp_id = ?',
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
 * @name /employee/forgot/password
 *
 * NOTE: For mobile we should have OTP based login hence no need to reset password.
 * If we still want to reset password then we need to send OTP and not verification email
 *
 * @param ui_username Email of the employee
 * @param ui_company_code company code of the employee
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
      `SELECT emp_id, emp_name, emp_email, emp_comp_id 
        FROM employee 
        WHERE emp_comp_code = ? AND (emp_email = ? OR emp_mobile_primary = ?);`,
      [req.body.ui_company_code, req.body.ui_username, req.body.ui_username],
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
        id: rows[0].emp_id,
        cid: rows[0].emp_comp_id,
        resetPassword: true,
      });
    } catch (e) {
      const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
      return res.status(405).send(responseGenerateTokenError);
    }

    const beResetPasswordLink = `${config.get('emailBaseLink')}/employee/reset/password?reset_pwd_tkn=${token}`;
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
      to: rows[0].emp_email,
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
    const beEmployeeDetailsNotFound = error.errList.dbError.ERR_RESET_PASSWORD_NO_DETAILS;
    return res.status(404).send(responseGenerator.dbError(beEmployeeDetailsNotFound));
  }
});

/**
 * @name /employee/reset_password/:reset_pwd_tkn
 *
 * @param ui_new_password : new password of the ****
 * @param reset_pwd_tkn :  token for reset password
 */
router.put(
  '/reset/password/:reset_pwd_tkn',
  auth.protectResetPasswordRoute,
  [vs.isCompanyEmployeePassword('body', 'ui_new_password', constant.passwordValidatorResponses.COMPANY_EMPLOYEE_REGISTER_PASSWORD_RESPONSE)],
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
        `UPDATE employee
          SET emp_pwd = ?, emp_modified_by = emp_id, emp_modified_by_name = emp_name
          WHERE emp_id = ? AND emp_comp_id = ?`,
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
 * Route for the employee profile details
 *
 * @name /employee/profile
 * @memberof /employee
 *
 */
router.get('/profile', auth.protectTokenVerify, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT emp_name AS name , emp_email AS email, emp_mobile_primary AS primaryMobile, emp_DOB AS dob, 
                emp_address AS address, emp_city AS city, emp_state AS state, emp_country AS country, 
                emp_PIN AS pincode, emp_mobile_secondary AS secondaryMobile, emp_gender AS gender
        FROM employee
        WHERE emp_id = ? AND emp_comp_id = ?   
    `,
      [req.user.id, req.user.cid],
    );
    if (rows.length !== 1) {
      const beUserDetailsNotFound = responseGenerator.dbError(error.errList.dbError.ERR_EMPLOYEE_PROFILE_NOT_FOUND);
      return res.status(404).send(beUserDetailsNotFound);
    }
    const description = 'Employee profile details fetched successfully';
    return res.status(200).send(responseGenerator.success('Employee Profile', description, rows));
  } catch (e) {
    console.log(e);
    const beEmployeeProfileError = responseGenerator.dbError(error.errList.dbError.ERR_EMPLOYEE_PROFILE_SELECT_ERROR);
    return res.status(404).send(beEmployeeProfileError);
  }
});

/**
 * Route to upload profile image for an employee
 *
 * @name /employee/profile/image/upload
 * @memberof /employee
 *
 * @param {image_field_name_in_the_front_end} employee_image: employee image field name in the form
 *
 */
router.post('/profile/image/upload', auth.protectTokenVerify, async (req, res) => {
  multer.uploadEmpImage(req, res, async (err) => {
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
      const filePath = constant.employeeImageStorageBaseLocation.PATH + req.file.filename;
      // console.log(filePath);
      try {
        const [rows] = await pool.execute('UPDATE employee SET emp_image = ?  WHERE emp_id = ? AND emp_comp_id = ?', [
          filePath,
          req.user.id,
          req.user.cid,
        ]);
        if (rows.affectedRows !== 1) {
          const errEmpImageUploadUpdateDBNoUpdateNOExp = error.errList.internalError.ERR_EMP_IMG_UPLOAD_DB_UPDATE_NO_UPDATE_NO_EXCEPTION;
          return res.status(404).send(responseGenerator.internalError(errEmpImageUploadUpdateDBNoUpdateNOExp));
        }
        return res.status(200).send(responseGenerator.success('Upload profile image', 'Profile image uploaded successfully', [{ img: filePath }]));
      } catch (e) {
        const errEmpImageUploadUpdateDBError = error.errList.internalError.ERR_EMP_IMG_UPLOAD_DB_UPDATE_ERROR;
        return res.status(404).send(responseGenerator.internalError(errEmpImageUploadUpdateDBError));
      }
    }
  });
});
module.exports = router;
