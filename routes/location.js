/**
 * This holds the route to add and view something from the lt_<tables>
 *
 * This is the things it can do: add manufacturer, view them, add category etc.
 * OR add new customer state, equipment status
 *
 */
const express = require('express');
const pool = require('../database/db');
const vs = require('../model/validator-sanitizer');
const responseGenerator = require('../model/response-generator');
const error = require('../model/error');

const router = express.Router();

// /**
//  * This route is used to add a country to the list of countries
//  *
//  * @name /location/country/add
//  * @memberof /location
//  *
//  * @param ui_name : name of the country
//  *
//  */
// router.post(
//   '/country/add',
//   [vs.isValidStrLenWithTrim('body', 'ui_name', 3, 50, 'Country name must be of 3 to 50 characters in length')],
//   auth.protectLtTableUpdate,
//   async (req, res) => {
//     const errors = vs.getValidationResult(req);
//     if (!errors.isEmpty()) {
//       const fieldsToValidate = ['ui_name'];
//       return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
//     }
//     const beName = req.body.ui_name;
//     try {
//       const [rows] = await pool.execute('INSERT INTO lt_country (country, added_by) VALUES (?, ?)', [
//         beName,
//         req.user.id,
//       ]);
//       if (rows.affectedRows === 1) {
//         const beDescription = 'Country added successfully';
//         return res
//           .status(200)
//           .send(responseGenerator.success('Country addition', beDescription, [{ country: beName }]));
//       }
//       const beCountryUnableToInsertNoException = error.errList.internalError.ERR_INSERT_COUNTRY_NO_EXCEPTION_INSERT_ERROR;
//       return res.status(500).send(responseGenerator.internalError(beCountryUnableToInsertNoException));
//     } catch (e) {
//       if (e.code === 'ER_DUP_ENTRY') {
//         const beCountryDuplicateEntry = error.errList.dbError.ERR_INSERT_COUNTRY_DUPLICATE_ENTRY;
//         return res.status(400).send(responseGenerator.dbError(beCountryDuplicateEntry));
//       }
//       const beCountryInsertError = error.errList.internalError.ERR_INSERT_COUNTRY_FAILURE;
//       return res.status(500).send(responseGenerator.internalError(beCountryInsertError));
//     }
//   },
// );

/**
 * this route is used to list the countries
 *
 * @name /location/country/list
 * @memberof /location
 *
 */
router.get('/country/list', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT GROUP_CONCAT(lt_country_country) as country FROM lt_country', []);
    return res.status(200).send(responseGenerator.success('Country list', 'List of Countries', rows[0].country.split(',')));
  } catch (e) {
    console.log(e);
    const beCountryListSelectError = error.errList.internalError.ERR_SELECT_COUNTRY_LIST_FAILURE;
    return res.status(500).send(responseGenerator.internalError(beCountryListSelectError));
  }
});

// /**
//  * This route is used to add a state to the list of states
//  *
//  * @name /location/state/add
//  * @memberof /location
//  *
//  * @param ui_name : name of the state
//  * @param ui_country : Country required of the state
//  *
//  */
// router.post(
//   '/state/add',
//   [
//     vs.isValidStrLenWithTrim('body', 'ui_name', 3, 50, 'State name must be of 3 to 50 characters in length'),
//     vs.isValidStrLenWithTrim('body', 'ui_country', 3, 50, 'Country name must be of 3 to 50 characters in length'),
//   ],
//   auth.protectLtTableUpdate,
//   async (req, res) => {
//     const errors = vs.getValidationResult(req);
//     if (!errors.isEmpty()) {
//       const fieldsToValidate = ['ui_name', 'ui_country'];
//       return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
//     }
//     const beName = req.body.ui_name;
//     const beCountry = req.body.ui_country;
//     try {
//       const [rows] = await pool.execute('INSERT INTO lt_state (state, country, added_by) VALUES (?, ?, ?)', [
//         beName,
//         beCountry,
//         req.user.id,
//       ]);
//       if (rows.affectedRows === 1) {
//         const beDescription = 'State added successfully';
//         return res
//           .status(200)
//           .send(responseGenerator.success('State addition', beDescription, [{ state: beName, country: beCountry }]));
//       }
//       const beStateUnableToInsertNoException = error.errList.internalError.ERR_INSERT_STATE_NO_EXCEPTION_INSERT_ERROR;
//       return res.status(500).send(responseGenerator.internalError(beStateUnableToInsertNoException));
//     } catch (e) {
//       console.log(e);
//       if (e.code === 'ER_DUP_ENTRY') {
//         const beStateDuplicateEntry = error.errList.dbError.ERR_INSERT_STATE_DUPLICATE_ENTRY;
//         return res.status(400).send(responseGenerator.dbError(beStateDuplicateEntry));
//       }
//       const beStateInsertError = error.errList.internalError.ERR_INSERT_STATE_FAILURE;
//       return res.status(500).send(responseGenerator.internalError(beStateInsertError));
//     }
//   },
// );

/**
 * this route is used to list the states
 *
 * @name /location/state/list/:ui_country
 * @memberof /location
 *
 */
router.get(
  '/state/list/:ui_country',
  // vs.isValidCountry('params', 'ui_country'),
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_country'];
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const [rows] = await pool.execute('SELECT GROUP_CONCAT(lt_state_state) as state FROM lt_state WHERE lt_state_country = ?', [
        req.params.ui_country,
      ]);
      return res.status(200).send(responseGenerator.success('State list', 'List of States', rows[0].state.split(',')));
    } catch (e) {
      const beStateListSelectError = error.errList.internalError.ERR_SELECT_STATE_LIST_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beStateListSelectError));
    }
  },
);

// /**
//  * This route is used to add a city to the list of cities
//  *
//  * @name /location/city/add
//  * @memberof /location
//  *
//  * @param ui_name : name of the city
//  * @param ui_state : state required of the city
//  *
//  */
// router.post(
//   '/city/add',
//   [
//     vs.isValidStrLenWithTrim('body', 'ui_name', 3, 50, 'City name must be of 3 to 50 characters in length'),
//     vs.isValidStrLenWithTrim('body', 'ui_state', 3, 50, 'State name must be of 3 to 50 characters in length'),
//   ],
//   auth.protectLtTableUpdate,
//   async (req, res) => {
//     const errors = vs.getValidationResult(req);
//     if (!errors.isEmpty()) {
//       const fieldsToValidate = ['ui_name', 'ui_state'];
//       return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
//     }
//     const beName = req.body.ui_name;
//     const beState = req.body.ui_state;
//     try {
//       const [rows] = await pool.execute('INSERT INTO lt_city (city, state, added_by) VALUES (?, ?, ?)', [
//         beName,
//         beState,
//         req.user.id,
//       ]);
//       if (rows.affectedRows === 1) {
//         const beDescription = 'City added successfully';
//         return res
//           .status(200)
//           .send(responseGenerator.success('City addition', beDescription, [{ city: beName, state: beState }]));
//       }
//       const beCityUnableToInsertNoException = error.errList.internalError.ERR_INSERT_CITY_NO_EXCEPTION_INSERT_ERROR;
//       return res.status(500).send(responseGenerator.internalError(beCityUnableToInsertNoException));
//     } catch (e) {
//       console.log(e);
//       if (e.code === 'ER_DUP_ENTRY') {
//         const beCityDuplicateEntry = error.errList.dbError.ERR_INSERT_CITY_DUPLICATE_ENTRY;
//         return res.status(400).send(responseGenerator.dbError(beCityDuplicateEntry));
//       }
//       const beCityInsertError = error.errList.internalError.ERR_INSERT_CITY_FAILURE;
//       return res.status(500).send(responseGenerator.internalError(beCityInsertError));
//     }
//   },
// );

/**
 * this route is used to list the cities
 *
 * @name /location/city/list/:ui_state
 * @memberof /location
 *
 */
router.get(
  '/city/list/:ui_state',
  // vs.isValidState('params', 'ui_state'),
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['ui_state'];
      return res.status(422).send(responseGenerator.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const [rows] = await pool.execute('SELECT GROUP_CONCAT(lt_city_city) as city FROM lt_city WHERE lt_city_state = ?', [req.params.ui_state]);
      return res.status(200).send(responseGenerator.success('City list', 'List of Cities', rows[0].city.split(',')));
    } catch (e) {
      const beCityListSelectError = error.errList.internalError.ERR_SELECT_CITY_LIST_FAILURE;
      return res.status(500).send(responseGenerator.internalError(beCityListSelectError));
    }
  },
);

module.exports = router;
