const express = require('express');
// TODO Change hash to auth
const config = require('config');
const url = require('url');
const auth = require('../model/auth');
const hash = require('../model/auth');
const pool = require('../database/db');
const hf = require('../model/helper-function');
const vs = require('../model/validator-sanitizer');
const responseGenerator = require('../model/response-generator');
const constant = require('../model/constant');
const error = require('../model/error');
const mailer = require('../model/mailer');
const multer = require('../model/multer');

const router = express.Router();

/**
 * Route for customer login page
 * @name /customer/login
 */
router.get('/login', async (req, res) => res.render('customerLogin'));


module.exports = router;