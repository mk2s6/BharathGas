/**
 * This file contain some samples to create a CRON jobs
 */

/**
 * Instruction to scheduling: https://en.wikipedia.org/wiki/Cron
 * Note that the sixth * is seconds but normally in unix we have only 5 fields
 * in CRON expression.
 *
 * You need to include your crons into app.js using:
 * require('./samples/cron');
 */

const cron = require('../model/cron');

/**
 * Sample to create and start job immediately.
 * NOTE: We have six fields in cron expression but normal unix has 5 only
 */
try {
  cron.createAndStartJob('* * * * * *', () => {
    console.log('My CRON job function to execute');
  });
} catch (e) {
  console.log(e);
}

/**
 * Sample to create and start the job when you want
 * NOTE: We have six fields in cron expression but normal unix has 5 only
 */
// Creating job
let myCronJob;
try {
  myCronJob = cron.createJob('* * * * * *', () => {
    console.log('My CRON job which will start when you call startJob() function');
  });
} catch (e) {
  console.log(`From Create ${e}`);
}
// Start job
try {
  cron.startJob(myCronJob);
} catch (e) {
  console.log(`From Start ${e}`);
}
