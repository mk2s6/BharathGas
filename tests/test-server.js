/**
 * This module create a wrapper functions to make testing of the applicaiton easy.
 */

// NOTE:
// TO IMPORT: const server = require('../test_server');
// HTTP method names are all caps because 'delete' is keyword in JS

const config = require('config');
const axios = require('axios');
const app = require('../app');

// Load encoding needed by mysql2
require('mysql2/node_modules/iconv-lite').encodingExists('foo');

// Helper variables
let server; // Server object
const testServerPort = config.get('serverConfig.port') || 54200; // Port on which server should start
const connections = {};

// Axios defaults base URL
axios.defaults.baseURL = `http://localhost:${testServerPort}`;
// Make AXIOS never reject promise unless the route does not exist
// Here axios will check the status of returned response and check whether
// the status is less than 600 which is all the possible HTTP status and not
// equal to 404. If the condition is true then axios will not throw exception
// and bind the response to promise success.
axios.defaults.validateStatus = status => status < 600 && status !== 404;

// ======================================================================
// PRIVATE API FOR THIS MODULE
// ======================================================================

// ======================================================================
// PUBLIC API EXPOSED FROM THIS MODULE
// ======================================================================

/**
 * Start server for the test environment
 * It runs on localhost and port is taken from TEST_PORT environment value
 */
function start() {
  server = app.listen(testServerPort);

  server.on('connection', (conn) => {
    // console.log('Created Connection');
    const key = `${conn.remoteAddress}:${conn.remotePort}`;
    connections[key] = conn;
    conn.on('close', () => {
      delete connections[key];
    });
  });

  server.destroy = (cb) => {
    server.close(cb);
    /* eslint-disable no-restricted-syntax */
    // eslint-disable-next-line guard-for-in
    for (const key in connections) {
      connections[key].destroy();
      // console.log(connections[key].destroyed);
    }
    /* eslint-enable no-restricted-syntax */
  };
}

/**
 * Ctart server for the test environment
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function close() {
  // console.log('Server Closed');
  server.destroy();
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
}

/**
 * Make a GET request to URI + QueryString with passed Query parameters.
 * This is async function hence use await while calling it.
 *
 * @param uri URI where to make GET request
 * @param params Query parameter as JS object
 * @param headers headers to send with request. Defaults to empty object
 * @param timeout Timeout for this request. Defaults to 1000
 *
 * @returns Response object return as it is from REST API
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function GET(uri, params, headers = {}, timeout = 1000) {
  // let response;
  // try {
  // Axios appends the uri to baseURL before sending request
  const response = await axios.get(uri, { params, headers, timeout });
  return response;
  // } catch (error) {
  //  return error.response;
  // for debugging purpose
  // return JSON.stringify(error.response);
  // }
}

/**
 * Make a POST request to given URI
 * This is async function hence use await while calling it.
 *
 * @param uri URI where to make POST request
 * @param data data for post request
 * @param headers headers to send with request. Defaults to empty object
 * @param timeout Timeout for this request. Defaults to 1000
 *
 * @returns Response object return as it is from REST API
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function POST(uri, data, headers = {}, timeout = 1000) {
  // let response;
  // try {
  // Axios appends the uri to baseURL before sending request
  const response = await axios.post(uri, data, { headers, timeout });
  return response;
  // } catch (error) {
  //  return error.response;
  // for debugging purpose
  // return JSON.stringify(error.response);
  // }
}

/**
 * Make a PUT request to given URI
 * This is async function hence use await while calling it.
 *
 * @param uri URI where to make PUT request
 * @param data data for put request
 * @param headers headers to send with request. Defaults to empty object
 * @param timeout Timeout for this request. Defaults to 1000
 *
 * @returns Response object return as it is from REST API
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function PUT(uri, data, headers = {}, timeout = 1000) {
  // let response;
  // try {
  // Axios appends the uri to baseURL before sending request
  const response = await axios.put(uri, data, { headers, timeout });
  return response;
  // } catch (error) {
  //  return error.response;
  // for debugging purpose
  // return JSON.stringify(error.response);
  // }
}

/**
 * Make a DELETE request to given URI
 * This is async function hence use await while calling it.
 *
 * @param uri URI where to make DELETE request
 * @param data data for delete request
 * @param headers headers to send with request. Defaults to empty object
 * @param timeout Timeout for this request. Defaults to 1000
 *
 * @returns Response object return as it is from REST API
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function DELETE(uri, data, headers = {}, timeout = 1000) {
  // let response;
  // try {
  // Axios appends the uri to baseURL before sending request
  const response = await axios.delete(uri, data, { headers, timeout });
  return response;
  // } catch (error) {
  //  return error.response;
  // for debugging purpose
  // return JSON.stringify(error.response);
  // }
}

module.exports.start = start;
module.exports.close = close;
module.exports.GET = GET;
module.exports.POST = POST;
module.exports.PUT = PUT;
module.exports.DELETE = DELETE;
