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

router.get('/logout', auth.protectTokenCheck, async (req, res) => {
  res.clearCookie('x-id-token');
  return res.status(200).send("<script> alert('You have been logged out successfully'); window.location = '/' </script>");
});


router.get('/notfound', async (req, res) => {
  res.render('error');
});

module.exports = router;
