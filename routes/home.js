const express = require('express');
const dt = require('date-and-time');
const auth = require('../model/auth');
const pool = require('../database/db');
const vs = require('../model/validator-sanitizer');
const responseGenerator = require('../model/response-generator');
const constant = require('../model/constant');
const notification = require('../model/notification');

const router = express.Router();

router.get('/', async (req, res) => {
    console.log('hi');
    res.render('index', {title : 'BharatGas'});
});

module.exports = router;
