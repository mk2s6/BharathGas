const express = require('express');
// TODO Change hash to auth
const config = require('config');
const auth = require('../model/auth');
const hash = require('../model/auth');
const pool = require('../database/db');
const hf = require('../model/helper-function');
const vs = require('../model/validator-sanitizer');
const responseGenerator = require('../model/response-generator');
const constant = require('../model/constant');
const mailer = require('../model/mailer');
const error = require('../model/error');

const router = express.Router();

/**
 * Route to check whether the company code is available or not
 * @name /company/check/company_code/:ui_code
 *
 * @param ui_company_code : code to be checked in the Database
 */
router.get('/check/company_code/:ui_code', [vs.isValidCompanyCode('params', 'ui_code')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['ui_code'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) AS isExistingCode FROM company WHERE comp_code = ?', [req.params.ui_code]);
    if (rows[0].isExistingCode === 0) {
      return res.status(200).send(
        responseGenerator.success('Company code', 'Company code available', [
          {
            companyCode: req.body.ui_company_code,
          },
        ]),
      );
    }
    const responseCompanyCodeNotAvailable = error.errList.dbError.ERR_COMPANY_CODE_NOT_AVAILABLE;
    return res.status(400).send(responseGenerator.dbError(responseCompanyCodeNotAvailable));
  } catch (e) {
    console.log(e);
    const respCompCodeSelectFailure = error.errList.internalError.ERR_COMPANY_CODE_SELECT_FAILURE;
    return res.status(500).send(responseGenerator.internalError(respCompCodeSelectFailure));
  }
});

/**
 * Company registration route
 *
 * @name /company/register
 *
 * @param ui_company_name : name of the company
 * @param ui_company_description : description of the company
 * @param ui_company_code : code chosen by the owner for the company
 * @param ui_owner_name : name of the owner of the company
 * @param ui_owner_email : email of the owner of the company
 * @param ui_owner_password : password for the company's owner account
 * @param ui_owner_mobile : mobile number of the owner of the company
 * @param ui_owner_secondary_mobile : secondary mobile number of the owner of company
 * @param ui_owner_gender : gender of the owner of the company
 * @param ui_owner_dob : date of birth of the owner
 * @param ui_owner_address : address where the owner lives
 * @param ui_owner_city : city where the owner lives
 * @param ui_owner_state : state where the owner lives
 * @param ui_owner_country : country where the owner lives
 * @param ui_owner_pincode : pincode of the owner's address
 * @param ui_branch_name : name of the branch to be registered
 * @param ui_branch_email : email of the branch
 * @param ui_branch_contact : contact number of the branch
 * @param ui_branch_address : address where the branch is located
 * @param ui_branch_city : city where the branch is located
 * @param ui_branch_state : state where the branch is located
 * @param ui_branch_country : country where the branch is located
 * @param ui_branch_pincode : pincode of the branch location
 *
 */

router.post(
  '/register',
  [
    vs.isValidStrLenWithTrim('body', 'ui_company_name', 3, 100, 'Please enter a valid company name between 3 to 100 characters only.'),
    vs.isValidStrLenWithTrim(
      // This works for undefined values too
      'body',
      'ui_company_description',
      0,
      2000,
      'Please enter the valid company description without exceeding 2000 characters.',
    ),
    vs.isValidCompanyCode('body', 'ui_company_code'),
    vs.isValidStrLenWithTrim('body', 'ui_owner_name', 3, 50, 'Please enter the valid owner’s name between 3 to 50 characters only.'),
    vs.isEmail('body', 'ui_owner_email'),
    vs.isCompanyEmployeePassword('body', 'ui_owner_password', constant.passwordValidatorResponses.COMPANY_EMPLOYEE_REGISTER_PASSWORD_RESPONSE),
    vs.isMobile('body', 'ui_owner_mobile'),
    vs.ifExistIsMobile('body', 'ui_owner_secondary_mobile'),
    vs.isGender('body', 'ui_owner_gender'),
    vs.isDOB('body', 'ui_owner_dob'),
    vs.isValidStrLenWithTrim('body', 'ui_owner_address', 3, 255, 'Please enter the valid address of the owner between 3 to 255 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_owner_city', 3, 50, 'Please enter the valid city name for the owner between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_owner_state', 3, 50, 'Please enter the valid state name for the owner between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_owner_country', 3, 50, 'Please enter the valid country name for the owner between 3 to 50 characters.'),
    vs.isPINCODE('body', 'ui_owner_pincode'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_name', 3, 100, 'Please enter the valid branch name between 3 to 100 characters only.'),
    vs.ifExistIsEmail('body', 'ui_branch_email'),
    vs.isValidStrLenWithTrim(
      'body',
      'ui_branch_contact',
      0, // Works when we don't send branch contact details
      20,
      'Please enter the valid contact for a branch',
    ),
    vs.isValidStrLenWithTrim('body', 'ui_branch_address', 3, 255, 'Please enter the valid address for branch between 3 to 255 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_city', 3, 50, 'Please enter the valid city for branch between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_state', 3, 50, 'Please enter the valid state for branch between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_country', 3, 50, 'Please enter the valid country for branch between 3 to 50 characters.'),
    vs.isPINCODE('body', 'ui_branch_pincode'),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = [
        'ui_company_name',
        'ui_company_description',
        'ui_company_code',
        'ui_owner_name',
        'ui_owner_email',
        'ui_owner_password',
        'ui_owner_mobile',
        'ui_owner_secondary_mobile',
        'ui_owner_gender',
        'ui_owner_dob',
        'ui_owner_address',
        'ui_owner_city',
        'ui_owner_state',
        'ui_owner_country',
        'ui_owner_pincode',
        'ui_branch_name',
        'ui_branch_email',
        'ui_branch_contact',
        'ui_branch_address',
        'ui_branch_city',
        'ui_branch_state',
        'ui_branch_country',
        'ui_branch_pincode',
      ];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }

    // Initialize optional variables
    const beCompanyDescription = req.body.ui_company_description || null;
    const beBranchContact = req.body.ui_branch_contact || null;
    const beBranchEmail = req.body.ui_branch_email || null;
    const bePassword = req.body.ui_owner_password;
    const beOwnerSecondaryMobile = req.body.ui_owner_secondary_contact || null;
    let beHashedPassword = '';

    // Hash password
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
    let companyInsert;
    let companyEmpInsert;
    let branchInsert;

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

    // Insert company details
    try {
      [companyInsert] = await conn.query(
        `
          INSERT INTO company (comp_name, comp_code ,comp_description, comp_img, comp_RM, comp_RM_name)
          VALUES (?, ?, ?, ?, ?, ?);
        `,
        [req.body.ui_company_name, req.body.ui_company_code, beCompanyDescription, constant.defaultCompImages.DEFAULT, null, null],
      );
      if (companyInsert.affectedRows !== 1) {
        await conn.rollback();
        await conn.release();
        const beCompInsertSuccessNoInsert = error.errList.internalError.ERR_COMPANY_REGISTER_NO_INSERT_NO_EXCEPTION;
        return res.status(500).send(responseGenerator.internalError(beCompInsertSuccessNoInsert));
      }
    } catch (e) {
      // Insert Company Failure
      console.log(e);
      await conn.rollback();
      await conn.release();
      if (e.code === 'ER_DUP_ENTRY') {
        const beCompCodeExists = error.errList.dbError.ERR_COMPANY_REGISTER_COMPANY_CODE_EXISTS;
        return res.status(400).send(responseGenerator.dbError(beCompCodeExists));
      }
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_REGISTER_INSERT_DETAILS_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }

    const empImage = req.body.ui_owner_gender === 'Male' ? constant.defaultCompEmpImages.MALE : constant.defaultCompEmpImages.FEMALE;
    // Insert Owner
    try {
      [companyEmpInsert] = await conn.query(
        ` INSERT INTO employee (emp_name , emp_email, emp_pwd, emp_mobile_primary, emp_mobile_secondary, emp_DOB, 
          emp_address, emp_city, emp_state, emp_country, emp_PIN, emp_image, 
          emp_gender, emp_role, emp_comp_code, emp_comp_id, emp_last_login_IP, emp_added_by, emp_added_by_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          req.body.ui_owner_name,
          req.body.ui_owner_email,
          beHashedPassword,
          req.body.ui_owner_mobile,
          beOwnerSecondaryMobile,
          req.body.ui_owner_dob,
          req.body.ui_owner_address,
          req.body.ui_owner_city,
          req.body.ui_owner_state,
          req.body.ui_owner_country,
          req.body.ui_owner_pincode,
          empImage,
          req.body.ui_owner_gender,
          constant.defaultCompEmpRoles.OWNER,
          req.body.ui_company_code,
          companyInsert.insertId,
          req.ip,
          constant.defaultCompEmpAddedBy.DEFAULT,
          constant.defaultCompEmpAddedBy.NAME,
        ],
      );
      if (companyEmpInsert.affectedRows !== 1) {
        await conn.rollback();
        const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_COMPANY_OWNER_REGISTER_NO_INSERT_NO_EXCEPTION;
        return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
      }
    } catch (e) {
      // Insert Owner failure
      console.log(e);
      await conn.rollback();
      await conn.release();
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_OWNER_REGISTER_INSERT_DETAILS_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }

    // Insert Branch Details
    try {
      [branchInsert] = await conn.query(
        `
            INSERT INTO branch(bran_name, bran_contact, bran_email, bran_address, bran_city, bran_state,
              bran_country, bran_PIN, bran_sort_order, bran_comp_id, bran_added_by, bran_added_by_name)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
        [
          req.body.ui_branch_name,
          beBranchContact,
          beBranchEmail,
          req.body.ui_branch_address,
          req.body.ui_branch_city,
          req.body.ui_branch_state,
          req.body.ui_branch_country,
          req.body.ui_branch_pincode,
          constant.defaultCompBranchSortOrder.DEFAULT,
          companyInsert.insertId,
          companyEmpInsert.insertId,
          req.body.ui_owner_name,
        ],
      );
      if (branchInsert.affectedRows !== 1) {
        await conn.rollback();
        await conn.release();
        const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_COMPANY_BRANCH_REGISTER_NO_INSERT_NO_EXCEPTION;
        return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
      }
    } catch (e) {
      // Insert Branch Details Failure
      console.log(e);
      await conn.rollback();
      await conn.release();
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_BRANCH_REGISTER_INSERT_DETAILS_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }

    let token;
    try {
      token = auth.genAuthTokenVerifyEmail({
        id: companyEmpInsert.insertId,
        username: req.body.ui_owner_name,
        cid: companyInsert.insertId,
        emailVerify: true,
      });
    } catch (e) {
      await conn.rollback();
      await conn.release();
      const responseGenerateTokenError = responseGenerator.internalError(error.errList.internalError.ERR_AUTH_TOKEN_GENERATION_ERROR);
      return res.status(405).send(responseGenerateTokenError);
    }

    const beEmailVerifyLink = `${config.get('emailBaseLink')}/email/verify?email_verify_tkn=${token}`;
    // console.log(beEmailVerifyLink);
    const beMessage = `
      <div>
        <h5>Dear ${req.body.ui_owner_name},<h5>
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
      to: req.body.ui_owner_email,
      // to: 'sharma.anuj1991@gmail.com',
      subject: constant.emailSubject.EMAIL_VERIFICATION,
      html: beMessage,
    };

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
    let beEmailVerificationSent = false;
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

    const beEmailVerificationRespStr = beEmailVerificationSent
      ? constant.emailVerificationRespString.SUCCESS
      : constant.emailVerificationRespString.FAILURE;

    return res.status(200).send(
      responseGenerator.success('Company Registration', 'Company registration was successful!.', [
        {
          companyName: req.body.ui_company_name,
          companyDescription: req.body.ui_company_description,
          companyCode: req.body.ui_company_code,
          ownerName: req.body.ui_owner_name,
          ownerEmail: req.body.ui_owner_email,
          ownerMobile: req.body.ui_owner_mobile,
          ownerSecondaryMobile: beOwnerSecondaryMobile,
          ownerGender: req.body.ui_owner_gender,
          ownerDob: req.body.ui_owner_dob,
          ownerAddress: req.body.ui_owner_address,
          ownerCity: req.body.ui_owner_city,
          ownerState: req.body.ui_owner_state,
          ownerCountry: req.body.ui_owner_country,
          ownerPinCode: req.body.ui_owner_pincode,
          branchName: req.body.ui_branch_name,
          branchEmail: req.body.ui_branch_email,
          branchContact: beBranchContact,
          branchAddress: req.body.ui_branch_address,
          branchCity: req.body.ui_branch_city,
          branchState: req.body.ui_branch_state,
          branchCountry: req.body.ui_branch_country,
          branchPinCode: req.body.ui_branch_pincode,
          metaEmailVerificationEmail: beEmailVerificationRespStr,
        },
      ]),
    );
  },
);

/**
 * Route to change the details of the company
 *
 * @name /company/change/details
 *
 * @param ui_company_name : name of the company
 * @param ui_description : description of the company
 *
 */
router.put(
  '/change/details',
  auth.protectCompanySettingRoute,
  [
    vs.isValidStrLenWithTrim('body', 'ui_company_name', 3, 100, 'Please enter a valid company name between 3 to 100 characters only.'),
    vs.isValidStrLenWithTrim(
      // This works for undefined values too
      'body',
      'ui_description',
      0,
      2000,
      'Please enter the valid company description without exceeding 2000 characters.',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_company_name', 'ui_description'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const beDescription = req.body.ui_description || null;
      const [rows] = await pool.execute(
        `
      UPDATE company
      SET comp_name = ?, comp_description = ?
      WHERE comp_id = ?
      `,
        [req.body.ui_company_name, beDescription, req.user.cid],
      );
      // console.log(branchInsert);
      if (rows.affectedRows !== 1) {
        const beCompanyUpdateSuccessNoUpdate = error.errList.internalError.ERR_COMPANY_UPDATE_NO_UPDATE_NO_EXCEPTION;
        return res.status(500).send(responseGenerator.internalError(beCompanyUpdateSuccessNoUpdate));
      }
      return res.status(200).send(
        responseGenerator.success('Company details update', 'company details update successful', [
          {
            companyName: req.body.ui_company_name,
            companyDescription: req.body.ui_description,
          },
        ]),
      );
    } catch (e) {
      console.log(e);
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_COMPANY_UPDATE_DETAILS_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }
  },
);

// //////////////////////////////////////////////////////////////////////////////////////
// ////
// ////      BRANCH RELATED ROUTES
// ////
// //////////////////////////////////////////////////////////////////////////////////////

/**
 * Route to add a branch
 *
 * @name /company/branch/add
 *
 * @param ui_branch_name : name of the branch to be registered
 * @param ui_branch_address : address where the branch is located
 * @param ui_branch_city : city where the branch is located
 * @param ui_branch_state : state where the branch is located
 * @param ui_branch_country : country where the branch is located
 * @param ui_branch_pincode : pincode of the branch location
 * @param [ui_branch_contact]: Contact number of a branch (mobile/landline)
 * @param [ui_branch_email]: Email address of branch
 *
 */
router.post(
  '/branch/add',
  auth.protectCompanySettingRoute,
  [
    vs.isValidStrLenWithTrim('body', 'ui_branch_name', 3, 100, 'Please enter a valid branch name between 3 to 100 characters only.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_address', 3, 255, 'Please enter a valid address for the branch between 3 to 255 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_city', 3, 50, 'Please enter a valid city name for the branch between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_state', 3, 50, 'Please enter a valid state name for the branch between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_country', 3, 50, 'Please enter a valid country name for the branch between 3 to 50 characters.'),
    vs.isPINCODE('body', 'ui_branch_pincode'),
    vs.ifExistIsEmail('body', 'ui_branch_email'),
    vs.isValidStrLenWithTrim(
      'body',
      'ui_branch_contact',
      0, // Works when we don't send branch contact details
      20,
      'Please enter the valid contact for a branch',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = [
        'ui_branch_name',
        'ui_branch_address',
        'ui_branch_city',
        'ui_branch_state',
        'ui_branch_country',
        'ui_branch_pincode',
        'ui_branch_contact',
        'ui_branch_email',
      ];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const beBranchEmail = req.body.ui_branch_email || null;
    const beBranchContact = req.body.ui_branch_contact || null;
    let branchInsert;
    try {
      [branchInsert] = await pool.execute(
        `
                INSERT INTO branch(bran_name, bran_contact, bran_email, bran_address, bran_city, bran_state, 
                  bran_country, bran_PIN, bran_comp_id, bran_added_by, bran_added_by_name, bran_sort_order)
                SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, emp_name, (SELECT (MAX(bran_sort_order)+1) FROM branch WHERE bran_comp_id = ?)
                FROM employee WHERE emp_id = ? AND emp_comp_id = ?
              `,
        [
          req.body.ui_branch_name,
          beBranchContact,
          beBranchEmail,
          req.body.ui_branch_address,
          req.body.ui_branch_city,
          req.body.ui_branch_state,
          req.body.ui_branch_country,
          req.body.ui_branch_pincode,
          req.user.cid,
          req.user.id,
          req.user.cid,
          req.user.id,
          req.user.cid,
        ],
      );
      // console.log(branchInsert);
      if (branchInsert.affectedRows !== 1) {
        const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_BRANCH_INSERT_NO_INSERT_NO_EXCEPTION;
        return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
      }
      return res.status(200).send(
        responseGenerator.success('Branch Registration', 'Branch registration successful', [
          {
            branchName: req.body.ui_branch_name,
            branchEmail: beBranchEmail,
            branchContact: beBranchContact,
            branchAddress: req.body.ui_branch_address,
            branchCity: req.body.ui_branch_city,
            branchState: req.body.ui_branch_state,
            branchCountry: req.body.ui_branch_country,
            branchPinCode: req.body.ui_branch_pincode,
          },
        ]),
      );
    } catch (e) {
      console.log(e);
      if (e.code === 'ER_DUP_ENTRY') {
        const beUnableToInsertDetailsToDb = error.errList.dbError.ERR_BRANCH_NAME_ALREADY_EXISTS;
        return res.status(500).send(responseGenerator.dbError(beUnableToInsertDetailsToDb));
      }
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_BRANCH_INSERT_DETAILS_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }
  },
);

/**
 * Route to modify a branch details
 *
 * @name /company/branch/modify/:branch_id
 *
 * @param ui_branch_id: id of the branch which is to be updated
 * @param ui_branch_name : name of the branch to be registered
 * @param ui_branch_address : address where the branch is located
 * @param ui_branch_city : city where the branch is located
 * @param ui_branch_state : state where the branch is located
 * @param ui_branch_country : country where the branch is located
 * @param ui_branch_pincode : pincode of the branch location
 * @param [ui_branch_contact]: Contact number of a branch (mobile/landline)
 * @param [ui_branch_email]: Email address of branch
 *
 */
router.put(
  '/branch/modify/:branch_id',
  auth.protectCompanySettingRoute,
  [
    vs.isNumeric('params', 'branch_id', 'Please provide a valid Branch Id'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_name', 3, 100, 'Please enter a valid branch name between 3 to 100 characters only.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_address', 3, 255, 'Please enter a valid address for the branch between 3 to 255 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_city', 3, 50, 'Please enter a valid city name for the branch between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_state', 3, 50, 'Please enter a valid state name for the branch between 3 to 50 characters.'),
    vs.isValidStrLenWithTrim('body', 'ui_branch_country', 3, 50, 'Please enter a valid country name for the branch between 3 to 50 characters.'),
    vs.isPINCODE('body', 'ui_branch_pincode'),
    vs.ifExistIsEmail('body', 'ui_branch_email'),
    vs.isValidStrLenWithTrim(
      'body',
      'ui_branch_contact',
      0, // Works when we don't send branch contact details
      20,
      'Please enter the valid contact for a branch',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = [
        'branch_id',
        'ui_branch_name',
        'ui_branch_address',
        'ui_branch_city',
        'ui_branch_state',
        'ui_branch_country',
        'ui_branch_pincode',
        'ui_branch_contact',
        'ui_branch_email',
      ];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    const beBranchEmail = req.body.ui_branch_email || null;
    const beBranchContact = req.body.ui_branch_contact || null;
    let branchUpdate;
    try {
      [branchUpdate] = await pool.execute(
        `
                UPDATE branch, employee
                SET bran_name = ?, bran_contact = ?, bran_email = ?, bran_address = ?, bran_city = ?, bran_state = ?, 
                  bran_country = ?, bran_PIN = ?, bran_modified_by = ?, bran_modified_by_name = emp_name
                WHERE bran_id = ? AND bran_comp_id = ? AND emp_id = ? AND emp_comp_id = ?
              `,
        [
          req.body.ui_branch_name,
          beBranchContact,
          beBranchEmail,
          req.body.ui_branch_address,
          req.body.ui_branch_city,
          req.body.ui_branch_state,
          req.body.ui_branch_country,
          req.body.ui_branch_pincode,
          req.user.id,
          req.params.branch_id,
          req.user.cid,
          req.user.id,
          req.user.cid,
        ],
      );
      // console.log(branchUpdate);
      if (branchUpdate.affectedRows !== 1) {
        const beCompanyInsertSuccessNoInsert = error.errList.internalError.ERR_BRANCH_UPDATE_NO_UPDATE_NO_EXCEPTION;
        return res.status(500).send(responseGenerator.internalError(beCompanyInsertSuccessNoInsert));
      }
      return res.status(200).send(
        responseGenerator.success('Branch update', 'Branch update successful', [
          {
            branchName: req.body.ui_branch_name,
            branchEmail: beBranchEmail,
            branchContact: beBranchContact,
            branchAddress: req.body.ui_branch_address,
            branchCity: req.body.ui_branch_city,
            branchState: req.body.ui_branch_state,
            branchCountry: req.body.ui_branch_country,
            branchPinCode: req.body.ui_branch_pincode,
          },
        ]),
      );
    } catch (e) {
      console.log(e);
      if (e.code === 'ER_DUP_ENTRY') {
        const beUnableToInsertDetailsToDb = error.errList.dbError.ERR_BRANCH_NAME_ALREADY_EXISTS;
        return res.status(500).send(responseGenerator.dbError(beUnableToInsertDetailsToDb));
      }
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_BRANCH_UPDATE_DETAILS_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }
  },
);

/**
 * Route to give the list of branches and its details for a particular user
 * to which user has access. For example, Branch admin or faculty can have access
 * to many branches but not all branches. However, company owner and company admin
 * can have access to all branches. There is no need to give the route which list
 * all branches under a company because if the employee is company owner he will get
 * list of all branches
 *
 * @name /company/branch/list
 *
 */
router.get('/branch/list', auth.protectTokenVerify, async (req, res) => {
  if (req.user.role === constant.defaultCompEmpRoles.OWNER || req.user.role === constant.defaultCompEmpRoles.COMPANY_ADMIN) {
    try {
      const [rows] = await pool.execute(
        `SELECT bran_id AS branchId, bran_name AS branchName, bran_email AS branchEmail,
          bran_contact AS branchContact, bran_address AS branchAddress, bran_city as branchCity,
          bran_state AS branchState
        FROM branch
        WHERE bran_comp_id = ?
        ORDER BY bran_id
        `,
        [req.user.cid],
      );
      return res.status(200).send(responseGenerator.success('List of branches', 'List of branches under the company', rows));
    } catch (e) {
      const beGetDetailsOfListOfBranchesFailure = error.errList.internalError.ERR_BRANCH_LIST_SELECT_ALL_QUERY_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beGetDetailsOfListOfBranchesFailure));
    }
  } else {
    // Object destructing syntax which fetches bids from req.user object
    const { bids } = req.user;
    const bidsJoinString = bids.join();
    // console.log('hello');
    console.log(bidsJoinString);
    try {
      const [rows] = await pool.execute(
        `SELECT bran_id AS branchId, bran_name AS branchName,
            bran_email AS branchEmail, bran_contact AS branchContact, bran_address AS branchAddress, 
            bran_city as branchCity, bran_state AS branchState
        FROM branch
        WHERE bran_id IN ( ${bidsJoinString} )
        ORDER BY bran_id`,
        [],
      );
      return res.status(200).send(responseGenerator.success('List of branches', 'List of branches related to employee', rows));
    } catch (e) {
      console.log(e);
      const beGetDetailsOfListOfBranchesFailure = error.errList.internalError.ERR_BRANCH_LIST_SELECT_BRANCHES_OF_EMPLOYEE_QUERY_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beGetDetailsOfListOfBranchesFailure));
    }
  }
});

/**
 * This route is used to access a single branch details
 *
 * @name /company/branch/detail/:branch_id
 *
 * @param branch_id : id of the particular branch details
 */
router.get('/branch/detail/:branch_id', [vs.isNumeric('params', 'branch_id', 'Please provide a valid Branch Id')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['branch_id'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  const branchArray = [parseInt(req.params.branch_id, 10)];
  // console.log(auth.protectBranchAccess(req, res, branchArray));
  if (auth.protectBranchAccess(req, res, branchArray)) {
    try {
      const [rows] = await pool.execute(
        `SELECT bran_name AS branchName, bran_email AS branchEmail, bran_contact AS branchContact, 
            bran_address AS branchAddress, bran_city as branchCity, bran_state AS branchState, 
            bran_country AS branchCountry, bran_PIN AS branchPincode
        FROM branch
        WHERE bran_id = ? AND bran_comp_id = ?`,
        [req.params.branch_id, req.user.cid],
      );

      if (rows.length === 0) {
        const beGetDetailsOfListOfBranchesFailure = error.errList.dbError.ERR_BRANCH_SELECT_BRANCH_DOES_NOT_EXIST;
        return res.status(404).send(responseGenerator.dbError(beGetDetailsOfListOfBranchesFailure));
      }
      return res.status(200).send(responseGenerator.success('Branch Details', 'Details of the branch', rows));
    } catch (e) {
      console.log(e);
      const beGetDetailsOfListOfBranchesFailure = error.errList.internalError.ERR_BRANCH_SELECT_QUERY_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beGetDetailsOfListOfBranchesFailure));
    }
  }
  // This is unreachable code but added to solve eslint error
  return false;
});

/**
 * Route to get the employee list all in the company
 *
 * @name /company/employee/list/all
 *
 */
router.get('/employee/list/all', auth.protectEmployeeMgmtRoute, async (req, res) => {
  try {
    const [employeeList] = await pool.execute(
      `
    SELECT emp_id AS id, emp_name AS empName, emp_email AS empEmail, emp_mobile_primary AS empMobile, emp_is_email_verified, 
            emp_role AS empRole FROM employee WHERE emp_comp_id = ?
    `,
      [req.user.cid],
    );
    return res.status(200).send(responseGenerator.success('All employee list', 'List of all employees', employeeList));
  } catch (e) {
    const beGetDetailsOfListOfEmployeesInCOmpanyFailure = error.errList.internalError.ERR_COMPANY_SELECT_EMPLOYEE_QUERY_FAILURE;
    return res.status(500).send(responseGenerator.internalError(beGetDetailsOfListOfEmployeesInCOmpanyFailure));
  }
});

/**
 * Route to get the employee list in particular branch of the company
 *
 * @name /company/employee/list/branch/:branch_id
 *
 */
router.get('/employee/list/branch/:branch_id', auth.protectEmployeeMgmtRoute, async (req, res) => {
  try {
    const [employeeList] = await pool.execute(
      `
    SELECT emp_id AS id, emp_name AS empName, emp_email AS empEmail, emp_mobile_primary AS empMobile, emp_is_email_verified, 
            emp_role AS empRole FROM employee 
    WHERE emp_id IN ( SELECT emb_emp_id FROM employee_manages_branch WHERE emb_bran_id = ? AND emp_comp_id = ? ) AND emp_comp_id = ?
    `,
      [req.params.branch_id, req.user.cid, req.user.cid],
    );
    return res.status(200).send(responseGenerator.success('Employee list for branch', 'List of all employees in a particular branch', employeeList));
  } catch (e) {
    console.log(e);
    const beGetDetailsOfListOfEmployeesInCOmpanyFailure = error.errList.internalError.ERR_COMPANY_SELECT_BRANCH_EMPLOYEES_QUERY_FAILURE;
    return res.status(500).send(responseGenerator.internalError(beGetDetailsOfListOfEmployeesInCOmpanyFailure));
  }
});

module.exports = router;

// =====================================================================
// BOOK KEEPING CODE (Code which we are not using but has good concepts)
// =====================================================================

// CONCEPT: Add data of SELECT statement into another table
//
// Form company register route
// // Insert Default Roles for new company
// try {
//   [roleInsert] = await conn.query(
//     `INSERT INTO lt_emp_role (lt_emp_role, lt_emp_role_comp_id, lt_emp_role_enq_mgmt,
// lt_emp_role_comp_setting, lt_emp_role_employee_mgmt,
//           lt_emp_role_added_by)
//           SELECT lt_emp_role, ? AS lt_emp_role_comp_id, lt_emp_role_enq_mgmt,
// lt_emp_role_comp_setting, lt_emp_role_employee_mgmt,
//           ? AS lt_emp_role_added_by
//           FROM lt_emp_role WHERE lt_emp_role_comp_id = '1'`,
//     [companyInsert.insertId, constant.defaultCompRoleAddedBy.DEFAULT],
//   );
//   if (roleInsert.affectedRows !== constant.defaultNumberOfRoles.DEFAULT) {
//     await conn.rollback();
//     await conn.release();
//     const beCompanyInsertEmpRoleSuccessNoInsert =
//       error.errList.internalError
//         .ERR_COMPANY_REGISTER_INSERT_EMPLOYEE_ROLE_NO_INSERT_NO_EXCEPTION;
//     return res
//       .status(500)
//       .send(responseGenerator.internalError(beCompanyInsertEmpRoleSuccessNoInsert));
//   }
// } catch (e) {
//   // Insert Default Roles failure
//   console.log(e);
//   await conn.rollback();
//   await conn.release();
//   const beUnableToInsertDetailsToDb =
//     error.errList.internalError.ERR_COMPANY_REGISTER_INSERT_EMPLOYEE_ROLE_INSERT_FAILURE;
//   return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
// }
