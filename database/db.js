const mysql = require('mysql2/promise');
const config = require('config');

// const mysql = require('promise-mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.get('dbConfig.host'),
  user: config.get('dbConfig.user'),
  password: config.get('dbConfig.password'),
  database: config.get('dbConfig.database'),
  // timezone: 'Z', // We don't need this parameter as we are not doing conversion
  dateStrings: true,
});

pool.on('connection', (conn) => {
  conn.query("SET time_zone='+00:00';", (error) => {
    if (error) {
      throw error;
    }
  });
});

//
// This we have created because we need to temporarily change driver from mysql2 to promise-mysql.
// As we have plans to move to mysql2 in future we need to have consistent API used in our codebase.
// mysql2 has pool.execute function which returns [rows, fields] but promise-mysql does not hence
// this function provide wrapper to promise-mysql which is consistent to mysql2.execute call.
//
// Steps to move to mysql2
// - const mysql = require('mysql2/promise');
// - Remove this wrapper function.
// - Change module.exports = pool;
// - Comment the pool.query() call which is below the wrapper function and uncomment pool.execute()
//

/**
 * Wrapper to pool.query function.
 *
 * @public
 * @async
 * @param queryStr Query you want to execute
 * @param {array} fileds array containing values to be replaced in query
 *
 * @return {string} Array containing results and fields
 */
// IMP NOTE as this is async function you need to use await when calling it.
/* const dbWrapper = {
  execute: async (queryStr, fields) => {
  const rows = await pool.query(queryStr, fields);
  return [rows];
}
}
*/

// TODO: Add code to check if connection is successful or not
// pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });

// This uses prepare statement hence it should be prefered
if (config.get('environment') !== 'test') {
  pool.execute('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) throw error;
    console.log('Connection to DB is successful and answer to query is : ', results[0].solution);
  });
}
// module.exports = dbWrapper;

module.exports = pool;
