/**
 * This module create a wrapper to http REST client.
 * HTTP request client is used to make HTTP request to a REST API.
 * Currently we are using axios: https://www.npmjs.com/package/axios
 * In future we may consider moving to feature rich clients like 'request'
 * or superagent.
 *
 * If want, in Future move to https://github.com/request/request-promise
 */

// TO IMPORT: const requestClient = require('../../model/http-request-client');

const axios = require('axios');

// ======================================================================
// PRIVATE API FOR THIS MODULE
// ======================================================================

// ======================================================================
// PUBLIC API EXPOSED FROM THIS MODULE
// ======================================================================

/**
 * Make a GET request to URI + QueryString with passed Query string.
 * This is async function hence use await while calling it.
 *
 * @param uri URI where to make GET request
 * @param queryParams Query parameter as JS object
 *
 * @returns Response object return as it is from REST API
 */
// IMP NOTE as this is async function you need to use await when calling it.
async function makeGETRequest(uri, queryParams) {
  // TODO add timeout, headers etc into call
  // axios.get(uri + { params: queryParams, timeout: timeout, headers: header });
  const response = await axios.get(uri, { params: queryParams });
  return response;
}

module.exports.makeGETRequest = makeGETRequest;
