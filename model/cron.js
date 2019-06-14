/**
 * This modules defines helper function needed for creating cron jobs.
 * https://www.npmjs.com/package/cron
 */

// TO IMPORT: const cron = require('../cron');
const { CronJob } = require('cron');

/**
 * @private
 * Function to check validity of the schedule. This is needed becuase UNIX has 5 fields in CRON
 * expression but our module has 6 of them. The last one is second.
 *
 * @param {*} schedule Schedule string provided for cron job creation
 *
 * @returns Boolean indicating whether the schedule is valid or not
 */
function isValidSchedule(schedule) {
  const arr = schedule.split(' ').filter(element => element.length !== 0);

  // We can't use the trim because it just trims the left and right but not the center one
  // The earlier filter logic take care of the middle extra spaces too
  // const arr = schedule.trim().split(' ');

  if (arr.length !== 6) {
    throw new Error(`Schedule have only ${arr.length} fields but it should have 6 filed including seconds.
    Normal UNIX cron tab expression has 5 fields but our implementation needs 6.`);
  }
  return true;
}

/**
 * Function which create a cron job and start it immediately, Always use try{}catch(){}
 *
 * @param {String} schedule Cron schedule as string
 * @param {function} fb Function body we want to execute as CRON
 */
function createAndStartJob(schedule, fb) {
  try {
    if (isValidSchedule(schedule)) {
      const job = new CronJob({ cronTime: schedule, onTick: fb, timeZone: 'Asia/Kolkata' });
      job.start();
      return true;
    }
  } catch (e) {
    // Throwing exception is good idea because we dont want server to hang.
    // console.log(e);
    throw e;
  }
  return false;
}

/**
 * Function which create a cron job but don't start it immediately, Always use try{}catch(){}
 *
 * @param {String} schedule Cron schedule as string
 * @param {function} fb Function body we want to execute as CRON
 *
 * @returns Cron Job object, which you need to pass to start method to start
 */
function createJob(schedule, fb) {
  try {
    if (isValidSchedule(schedule)) {
      return new CronJob({ cronTime: schedule, onTick: fb, timeZone: 'Asia/Kolkata' });
    }
  } catch (e) {
    // Throwing exception is good idea because we dont want server to hang.
    // console.log(e);
    throw e;
  }
  return false;
}

/**
 * Function which runs your cron Jobs, Always use try{}catch(){}
 *
 * @param {CronJob} cronJob Cron Job object you got from createJob function
 *
 * @returns Boolean value telling whether cron job has started or not
 */
function startJob(cronJob) {
  try {
    cronJob.start();
    return true;
  } catch (e) {
    // Throwing exception is good idea because we dont want server to hang.
    // console.log(e);
    throw e;
  }
}

module.exports.createAndStartJob = createAndStartJob;
module.exports.createJob = createJob;
module.exports.startJob = startJob;
