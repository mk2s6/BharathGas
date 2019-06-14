//
// This module create some helper functions. Use this functions elsewhere
// in code instead of writing logic
//
// TO IMPORT: const hf = require('../../model/helper-function');

// FUTURE TASK
// Node.js has experimental support for ES6 hence we can't use syntax like
// import {sleep, isEmptyJSON} from  '<path to helper-function.js>'
// But when we get that as long term support in node.js convert this to import
//

const validatorLibrary = require('validator');
const dateAndTime = require('date-and-time');

// ======================================================================
// PRIVATE API FOR THIS MODULE
// ======================================================================

// ======================================================================
// PUBLIC API EXPOSED FROM THIS MODULE
// ======================================================================

/**
 * Check whether the object (JSON can be used) is empty or not. This also check if object
 * is undefined or null. Generally used when we get response from external API.
 *
 * @param {object|JSON} obj JS variable/object/JSON
 *
 * @returns {boolean} Representing whether the object is empty or not
 */
function isEmptyJSON(obj) {
  // only using obj === will work but this is just for readability
  if (obj === null || obj === undefined) {
    return true;
  }
  return !Object.keys(obj).length;
}

/**
 * Check if the given string is email or not
 *
 * @param {string} val
 *
 * @returns {boolean} Representing whether the string is email or not
 */
function isEmail(val) {
  return validatorLibrary.isEmail(val);
}

/**
 *
 * @param {object | JSON } defaultEmpRoleInsertData array of default employee roles and settings
 * @param {int} compId : company id
 *
 * @returns {string} with the multiple insert data
 */
function empMultiRoleValueInsertString(defaultEmpRoleInsertData, compId) {
  let valueString = '';
  defaultEmpRoleInsertData.forEach((role, i) => {
    valueString += `( '${role.role}', ${compId}, ${role.enq_mgmt}, ${role.comp_setting}, ${role.emp_mgmt}, ${
      role.role_added_by
    })`;
    if (i < defaultEmpRoleInsertData.length - 1) valueString += ',';
    else valueString += ';';
  });
  return valueString;
}

/**
 * Make execution sleep for ms sec
 * NOTE: There is similar module in nodejs: https://www.npmjs.com/package/sleep
 * This module halts nodejs event loop that is not desirable.
 * Use that only for debugging
 *
 * @param {number} ms Time in mille second to wait before execution continue
 *
 * @returns {boolean} Representing whether the object is empty or not
 */
// Implementation: https://stackoverflow.com/a/41957152
// https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * @param {string} originalString //the actual string to be masked
 * @param {string} maskText the string to be checked for masking
 * @param {string} responseString if the comparison is true the masked string which has to be sent
 */
function maskStringNoCaseSensitive(originalString, maskText, responseString) {
  // we need the case in sensitive comparison so we have added toLowerCase
  const localMaskText = maskText.toLowerCase();
  if (originalString.toLowerCase().includes(localMaskText)) return responseString;
  return originalString;
}

// ========================================================================
// DATE and TIME RELATED
// ========================================================================

/**
 * This function checks if the date passed in JSON adhers to our YYYY-MM-DD format
 *
 * @param {string} dateString //the actual string to be masked
 *
 * @returns {boolean} Representing whether the format is correct or not
 */
function isDBDateFormat(dateString) {
  if (dateAndTime.isValid(dateString, 'YYYY-MM-DD')) {
    return true;
  }
  return false;
}

/**
 * Convert Standard JS Date object to FSJDate String i.e. YYYY-MM-DD format
 *
 * @param {Date} date Standard JS Date object
 *
 * @returns {string} FSJ date format i.e. YYYY-MM-DD
 */
// Ref: https://stackoverflow.com/a/23593099
function dateToDBDate(dateParam) {
  // Separate day, month and year from Date object
  let month = (dateParam.getMonth() + 1).toString();
  let day = dateParam.getDate().toString();
  const year = dateParam.getFullYear().toString();

  // Make one digit day and month to two digit.
  if (month.length < 2) {
    month = `0${month}`;
  }
  if (day.length < 2) {
    day = `0${day}`;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Convert dateString to the FSJDate format. This Date string is
 * internally passed to the Date() constructor.
 *
 * @param {string} dateString string that can be passsed to Date() constructor
 *
 * @returns {string} FSJ date format i.e. YYYY-MM-DD
 */
function dateStringToDBDate(dateString) {
  const myDate = new Date(dateString);
  return dateToDBDate(myDate);
}

/**
 * Get Today's Date in FSJ format
 *
 * @returns {FSJDateFormat} Today's date in FSJ date format i.e. YYYY-MM-DD
 */
function getDBFormatToday() {
  const today = new Date();
  return dateToDBDate(today);
}

/**
 * Get Yesterday's date in FSJ format
 *
 * @returns {FSJDateFormat} Yesterday's date in FSJ date format i.e. YYYY-MM-DD
 */
function getDBFormatYesterday() {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return dateToDBDate(yesterday);
}

/**
 * This function checks if the date passed in JSON adhers to our HH:MM:SS format
 *
 * @param {string} dateString //the actual string to be masked
 *
 * @returns {boolean} Representing whether the format is correct or not
 */
function isDBTimeFormat(timeString) {
  if (dateAndTime.isValid(timeString, 'HH:mm:ss')) {
    return true;
  }
  return false;
}

module.exports.isEmptyJSON = isEmptyJSON;
module.exports.isEmail = isEmail;
module.exports.empMultiRoleValueInsertString = empMultiRoleValueInsertString;
module.exports.sleep = sleep;
module.exports.maskStringNoCaseSensitive = maskStringNoCaseSensitive;
module.exports.isDBDateFormat = isDBDateFormat;
module.exports.dateToDBDate = dateToDBDate;
module.exports.dateStringToDBDate = dateStringToDBDate;
module.exports.getDBFormatToday = getDBFormatToday;
module.exports.getDBFormatYesterday = getDBFormatYesterday;
module.exports.isDBTimeFormat = isDBTimeFormat;
