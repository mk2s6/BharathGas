const express = require('express');
const dt = require('date-and-time');
const auth = require('../model/auth');
const pool = require('../database/db');
const vs = require('../model/validator-sanitizer');
const responseGenerator = require('../model/response-generator');
const constant = require('../model/constant');
const notification = require('../model/notification');
const passport = require('passport')

const router = express.Router();

router.get('/', auth.protectTokenVerify, async (req, res) => {
  return res.render('index');
});

router.post('/logout', auth.protectTokenCheck, async (req, res) => {
  res.clearCookie('x-id-token');
  return res.send(responseGenerator.success('Logout', 'You have been logged out successfully',[]));
});


router.get('/notfound', async (req, res) => {
  res.render('error');
});

module.exports = router;
