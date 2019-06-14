const express = require('express');
const dt = require('date-and-time');
const auth = require('../model/auth');
const pool = require('../database/db');
const vs = require('../model/validator-sanitizer');
const responseGenerator = require('../model/response-generator');
const constant = require('../model/constant');
const notification = require('../model/notification');

const router = express.Router();

/**
 * This route is used to verify the development or production server is running fine or not
 */
router.get('/server/status', async (req, res) => res.status(200).send('Server is running properly'));

/**
 * This route is used to test some custom code
 */
router.get('/custom', async (req, res) => {
  console.log(dt.isValid('2012-04-32', 'YYYY-MM-DD'));
  res.status(200).send('Server is running properly');
});

/**
 * This route is used by developer for quick testing of validations etc.
 */
router.post('/validator', [vs.isValidStrLenWithTrim('body', 'a', 0, 0, 'Max length allowed is 5 characters.')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['a'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.send('Success');
});

/**
 * Date validator for DB date format
 */
router.post('/validDBdate', [vs.isValidDBDate('body', 'date')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['date'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.send('Success');
});

/**
 * Date validator for DB time format
 */
router.post('/validDBtime', [vs.isValidDBTime('body', 'time')], async (req, res) => {
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['time'];
    // This is if else so we don't need return
    return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
  }
  return res.send('Success');
});

/**
 * Route to add notification
 *
 * @param ui_message: message for the notification
 */

router.post(
  '/add/notification',
  auth.protectTokenVerify,
  [vs.isValidStrLenWithTrim('body', 'ui_message', 3, 255, 'Please enter a valid notification message in between 3 to 255 characters')],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_message'];
      // This is if else so we don't need return
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const rows = await notification.addEmployeeNotification(
        pool,
        1,
        constant.empNotificationType.ENQUIRY,
        constant.notificationStatus.NEW,
        req.body.ui_message,
        1,
        null,
      );
      console.log(rows);
      return res.send('Notification added successfully');
    } catch (e) {
      console.log(e);
    }
  },
);

// /**
//  * @name /reset_password/request
//  *
//  * @param ui_username Email or mobile of the ****
//  */
// router.post('/reset_password/request', [vs.isEmailOrMobile('body', 'ui_username')], async (req, res) => {
//   const errors = vs.getValidationResult(req);
//   if (!errors.isEmpty()) {
//     const fieldsToValidate = ['ui_username'];
//     // This is if else so we don't need return
//     return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
//   }
//   try {
//     const [rows] = await pool.execute(
//       `SELECT cust_id, cust_name, cust_email
//               FROM customer WHERE cust_email = ? OR cust_mobile = ?;`,
//       [req.body.ui_username, req.body.ui_username],
//     );
//     console.log(rows);
//     if (rows.length === 1) {
//       console.log(rows);
//       const token = auth.genAuthTokenResetPassword({
//         id: rows[0].cust_id,
//         username: rows[0].cust_name,
//         role: constant.custRoles.CUSTOMER,
//       });
//       const beResetPasswordLink = `http://test.com/rp?tkn=${token}`;
//       console.log(beResetPasswordLink);
//       const beMessage = `
//         <h3>Reset Password link<h3>
//         <ul>
//           <li>Please use the below link to reset your password</li>
//           <li>${beResetPasswordLink}</li>
//           <li>Note that the above link expires in 30 minutes</li>
//         </ul>
//         `;
//       // mail options which describe about the from to subject
//       // and message to be sent
//       const beMailOptions = {
//         from: config.get('nodeMailerConfig.from'),
//         // to: rows[0].cust_email,
//         to: 'sivakusi12@gmail.com',
//         subject: 'RESET PASSWORD LINK FOR CUSTOMER ACCOUNT',
//         html: beMessage,
//       };
//       // this sends the message
//       mailer.sendMail(beMailOptions, (error, info) => {
//         if (error) {
//           console.log(error);
//           return res
//             .status(500)
//             .send(responseGenerator.errorResponse('Email Delivery Failed', '', 'Message not delivered', '', ''));
//         }
//         return res
//           .status(200)
//           .send(
//             responseGenerator.success('Reset Password Request', 'Reset Password link sent for the registered email', [
//               info.response,
//             ]),
//           );
//       });
//     }
//     // res.send('Hello');
//   } catch (e) {
//     console.log(e);
//     res.send('Error');
//   }
// });

// /**
//  * @name /reset_password/request?tkn=?
//  *
//  * @param ui_new_password new password of the ****
//  * @param tkn token for reset password
//  */
// router.put(
//   '/reset_password/request',
//   auth.protectTestResetPasswordRoute,
//   [vs.isCompanyEmployeePassword('body', 'ui_new_password')],
//   async (req, res) => {
//     const errors = vs.getValidationResult(req);
//     if (!errors.isEmpty()) {
//       const fieldsToValidate = ['ui_new_password'];
//       // This is if else so we don't need return
//       return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
//     }
//     const beUserID = req.user.id;
//     const beNewPassword = req.body.ui_new_password;
//     let beHashedPassword;
//     try {
//       // NOTE We need to await this function as it is async
//       beHashedPassword = await hash.hashPassword(beNewPassword);
//     } catch (e) {
//       // Unable to hash Password
//       // console.log(e);
//       const responseUnableToHash = responseGenerator.internalError(error.errList.internalError.ERR_HASH_PASSWORD);
//       return res.status(500).send(responseUnableToHash);
//     }
//     try {
//       const [rows] = await pool.execute(
//         `UPDATE customer
//           SET cust_password = ?
//           WHERE cust_id = ?`,
//         [beHashedPassword, beUserID],
//       );
//       // Change password successfully
//       if (rows.affectedRows) {
//         const description = 'Password have been updated Successfully for the user';
//         return res.status(200).send(responseGenerator.success('Update password', description, []));
//       }
//       // Unsuccessfully update with no exception
//       const responseUnableToUpdateWithoutException = responseGenerator.internalError(
//         error.errList.internalError.ERR_CUSTOMER_UPDATE_PASSWORD_NO_UPDATE_NO_EXCEPTION,
//       );
//       return res.status(400).send(responseUnableToUpdateWithoutException);
//     } catch (e) {
//       const responseUnableToUpdate = responseGenerator.internalError(
//         error.errList.internalError.ERR_CUSTOMER_CHANGE_PASSWORD_FAILURE_UPDATE_QUERY,
//       );
//       return res.status(400).send(responseUnableToUpdate);
//     }
//   },
// );

// // Transaction Helper
// router.post('/transaction', async (req, res) => {
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();
//     // await conn.query('START'); OR
//     // await conn.query('BEGIN TRANSACTION'); OR
//     const [rows] = await conn.execute('INSERT INTO temp_test (a, b) VALUES (?, ?);', ['2', 'Insert With Transaction.']);
//     // This will fail and rollback happens
//     const [rows1] = await conn.execute('INSERT INTO temp_test_table (a, b) VALUES (?, ?);', [
//       '2',
//       'Insert With Transaction.',
//     ]);
//     await conn.release();
//     // await conn.query('ROLLBACK'); OR
//     res.send('Completed');
//   } catch (e) {
//     console.log(e);
//     await conn.rollback();
//     await conn.release();
//     res.send('Error');
//   }
// });

module.exports = router;
