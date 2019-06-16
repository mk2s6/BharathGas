/**
 * Here we define constants used in our web application at backend only.
 * These constants are not needed in front end.
 */

// TO IMPORT: const constant = require('./constant');

/**
 * List of Error Types we have
 */
const errType = {
  VALIDATION_ERROR: 0,
  INTERNAL_ERROR: 1,
  DB_ERROR: 2,
  AUTH_ERROR: 3, // Frontend should redirect to Login page
};

/**
 * This are the default images we are having for FSJARS Employees.
 */
const defaultEmpImages = {
  MALE: '/img/profile/emp/DefaultBoy.png',
  FEMALE: '/img/profile/emp/DefaultGirl.png',
};

/**
 * This are the default images we are having for FSJARS Employees.
 */
const defaultCompImages = {
  DEFAULT: '/img/company/DefaultLogo.jpg',
};

/**
 * This are the default images we are having for company employees.
 */
const defaultCompEmpImages = {
  MALE: '/img/profile/companyEmployee/DefaultEmpMale.jpg',
  FEMALE: '/img/profile/companyEmployee/DefaultEmpFeMale.png',
};

/**
 * these are the default roles for the FSJARS employees
 *
 */
const defaultFSJEmpRoles = {
  FSJ_ADMIN: 'FSJ_Admin',
  FSJ_EXECUTIVE: 'FSJ_Executive',
  FSJ_SALES_AND_MKTING: 'FSJ_Sales_n_Mkting',
};

/**
 * This are the default role for company employees.
 */
const defaultCompEmpRoles = {
  OWNER: 'Owner',
  BRANCH_ADMIN: 'Branch Admin',
  COMPANY_ADMIN: 'Company Admin',
  RECEPTIONIST: 'Receptionist',
  SALES_AND_MARKETING: 'Sales and Marketing',
};

/**
 * This are the default Added by for company employees.
 */
const defaultCompEmpAddedBy = {
  DEFAULT: 1,
  NAME: 'FSJ OwnerAnuj',
};

/**
 * This are the default Added by for company branch sort order.
 */
const defaultCompBranchSortOrder = {
  DEFAULT: 1,
};

/**
 * Default roles added by.
 */
const defaultCompRoleAddedBy = {
  DEFAULT: 1,
};

/**
 * email verified code
 */
const emailVerifiedCode = {
  CODE: 1,
};
/**
 * This are the default Added by for company employees.
 */
const defaultNumberOfRoles = {
  DEFAULT: 5,
};

/**
 * List of constant related to JWT
 */
const TOKEN_NAME = 'x-id-token';
const tokenType = {
  KEY: 'tt',
  value: {
    DISTRIBUTOR: 'dist', // Company Employee
    SALES_OFFICER: 'saof', // FSJARS's Employee
    CUSTOMER: 'cust',
  },
};

const permissionKey = {
  CUSTOMER_MANAGEMENT: 'p_com',
  DISTRIBUTOR: 'p_d',
  SALES_OFFICER_MANAGEMENT: 'p_som',
};

/**
 * Responses for the password validatory
 */
const passwordValidatorResponses = {
  EMPLOYEE_LOGIN_PWD_RESPONSE: 'Please enter a valid password',
  EMPLOYEE_REGISTER_PASSWORD_RESPONSE: `Password should contain uppercase character, lowercase character,
  number and symbol. It must be at least 8 characters long. It should not contain any spaces in it!`,
  COMPANY_EMPLOYEE_LOGIN_PWD_RESPONSE: 'Please enter a valid password',
  COMPANY_EMPLOYEE_REGISTER_PASSWORD_RESPONSE: `Password should contain at least 1 uppercase,
  1 lowercase, 1 symbol and 1 number. It must be at least 8 characters long. It should not contain any spaces in it!`,
};

/**
 * Enquiry Task Types
 */
const enquiryTaskType = {
  FOLLOWUP: 'Follow-up',
  OTHER: 'Other',
};

/**
 * EMail verification response string
 */
const emailVerificationRespString = {
  SUCCESS: 'Email verification sent, Please check your email.!',
  FAILURE: 'Email verification failed, please proceed with email verification manually',
};
/**
 * enquiry task completion string
 */
const taskComTitle = {
  COMPLETED: 'Task Completed Successfully',
};

/**
 * Enquiry classification string title
 */
const enqClassChanged = {
  CHANGE_OF_CLASS: 'Enquiry classification change',
};
/**
 * Enquiry Status
 */
const enquiryStatus = {
  IN_PROGRESS: 'In-Progress',
  CONVERTED: 'Converted',
  LOSS: 'Loss',
};

/**
 * Enquiry Comment Type
 */
const enqCommentType = {
  COMMENT: 'Comment',
  FOLLOWUP: 'Follow-Up',
  CLASSIFICATION: 'Classification',
  TASK: 'Task',
  ASSIGNMENT_CHANGE: 'Assignment-Change',
};

/**
 * Notification Status
 */
const notificationStatus = {
  NEW: 'New',
  READ: 'Read',
  UNREAD: 'Unread',
};

/**
 * Notification Type
 */
const empNotificationType = {
  ENQUIRY: 'Enquiry',
  TASK: 'Task',
};

/**
 * Notification prefix strings
 */
const notificationPrefixString = {
  FOLLOW_UP_DUE_TODAY: 'Followups for today : ',
  FOLLOW_UP_OVERDUE_TODAY: 'Followups over due : ',
  ENQUIRY_ASSIGNMENT: 'The Enquiry assigned is ',
  ENQUIRY_COMMENT: 'Comment added for an enquiry: ',
  TASK_CREATION: 'The Task assigned is: ',
};

/**
 * Email subjects
 */
const emailSubject = {
  RESET_PASSWORD: 'Reset password link for TMS',
  EMAIL_VERIFICATION: 'Email verification for TMS',
  ENQUIRY_FOLLOWUP: 'FollowUps Pending for today',
};

/**
 * Due filter types
 */
const dueFilterTypes = {
  DUE_TODAY: 'due_today',
  DUE_FUTURE: 'due_future',
  DUE_TODAY_AND_OVERDUE: 'due_today_and_overdue',
};

/**
 * User filter types
 *
 */
const userFilterTypes = {
  MY: 'my',
  ALL: 'all',
};

/**
 * employee role list types
 *
 */
const empRoleListTypes = {
  COMPANY: 'company',
  BRANCH: 'branch',
};

// ============================================
// For TESTING ONLY
// ============================================
/**
 * Time taken by beforeAll function for its setup including DB setup
 * and some other work.
 */
const testTimeout = {
  beforeAll: 10000,
  afterAll: 10000,
};

const employeeImageStorageBaseLocation = {
  DEFAULT: '.\\public\\img\\profile\\emp\\',
  PATH: '/img/profile/emp/',
};

module.exports.errType = errType;
module.exports.defaultEmpImages = defaultEmpImages;
module.exports.defaultCompImages = defaultCompImages;
module.exports.defaultCompEmpImages = defaultCompEmpImages;
module.exports.defaultFSJEmpRoles = defaultFSJEmpRoles;
module.exports.defaultCompEmpRoles = defaultCompEmpRoles;
module.exports.defaultCompEmpAddedBy = defaultCompEmpAddedBy;
module.exports.defaultCompRoleAddedBy = defaultCompRoleAddedBy;
module.exports.defaultNumberOfRoles = defaultNumberOfRoles;
module.exports.emailVerifiedCode = emailVerifiedCode;
module.exports.defaultCompBranchSortOrder = defaultCompBranchSortOrder;
module.exports.TOKEN_NAME = TOKEN_NAME;
module.exports.tokenType = tokenType;
module.exports.permissionKey = permissionKey;
module.exports.passwordValidatorResponses = passwordValidatorResponses;
module.exports.enquiryTaskType = enquiryTaskType;
module.exports.emailVerificationRespString = emailVerificationRespString;
module.exports.enquiryStatus = enquiryStatus;
module.exports.taskComTitle = taskComTitle;
module.exports.enqClassChanged = enqClassChanged;
module.exports.enqCommentType = enqCommentType;
module.exports.notificationStatus = notificationStatus;
module.exports.empNotificationType = empNotificationType;
module.exports.notificationPrefixString = notificationPrefixString;
module.exports.emailSubject = emailSubject;
module.exports.dueFilterTypes = dueFilterTypes;
module.exports.userFilterTypes = userFilterTypes;
module.exports.empRoleListTypes = empRoleListTypes;
module.exports.testTimeout = testTimeout;
module.exports.employeeImageStorageBaseLocation = employeeImageStorageBaseLocation;
