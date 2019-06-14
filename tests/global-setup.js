/**
 * This file contains code which will run before all the tests only once
 */

// =============================================
// ENVIRONMENT and CONFIGURATION SETTINGS
// =============================================
// Add environment variables from the .env files to the app environment
require('dotenv').config();
const config = require('config');
const setupHelper = require('./setup-helper');

module.exports = async () => {
  console.log('==================================');
  console.log('Executing Global Setup');
  console.log('==================================');

  console.log(`Your Application environment: ${config.get('environment')}`);
  await setupHelper.cleanTestDatabase();
};

// // Installing DB schema Manually
// const schemaSQL = fs.readFileSync(`${__dirname}\\..\\tools\\db_schema\\fsjarsco_tourism.sql`).toString();
// // console.log(schemaSQL);
// try {
//   const result = await conn.query(schemaSQL, []);
// } catch (error) {
//   console.log(error);
//   console.log('Execute SQL error');
//   process.exit(1);
// }

// Set up No FK check
// await conn.execute(`CREATE DATABASE ${config.get('dbConfig.database')}`, []);

// // Change the DB to test DB
// await conn.changeUser({ database: config.get('dbConfig.database') });
