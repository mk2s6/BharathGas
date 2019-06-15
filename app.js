// =============================================
// ENVIRONMENT and CONFIGURATION SETTINGS
// =============================================
const config = require('config');

// Check configuration settings
if (config.get('environment') === 'default') {
  console.log('Please set the NODE_ENV to a valid values (development/production/testing/staging).');
  process.exit(1);
}

if (config.get('environment') !== 'test') {
  console.log(`Your Application environment: ${config.get('environment')}`);
  // console.log(`Your Application TimeZone: ${process.env.TZ}`);
}

// =============================================
// Load necessary MODULES for our APP
// =============================================
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const moment = require('moment');
const responseGenerator = require('./model/response-generator');
const constant = require('./model/constant');

// const passport = require('passport');

/**
 * Require for Routing
 */
const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
// const fsjarsEmployeeRouter = require('./routes/fsjars_employee');
const locationRouter = require('./routes/location');
// const companyRouter = require('./routes/company');
// const enquiryRouter = require('./routes/enquiry');
const companyEmployeeRouter = require('./routes/employee');
// const notificationRouter = require('./routes/notification');

const app = express();

if (config.get('logging') === 'true') {
  app.use(logger('dev'));
}

// TODO convert time to UTC time
app.use((req, res, next) => {
  req.utc_start_time = moment.utc();
  // console.log(`Form middleware: ${req.utc_start_time.format()}`);
  // console.log(req.utc_start_time.getTimezoneOffset());
  next();
});

const corsOptions = {
  allowedHeaders: [
    'content-type',
    'vary',
    'age',
    'server',
    'keep-alive',
    'etag',
    'date',
    'content-length',
    'content-encoding',
    'connection',
    constant.TOKEN_NAME,
  ],
  exposedHeaders: [
    'content-type',
    'vary',
    'age',
    'server',
    'keep-alive',
    'etag',
    'date',
    'content-length',
    'content-encoding',
    'connection',
    constant.TOKEN_NAME,
  ],
};

// disable the x-powered-by headers
app.disable('x-powered-by');

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

/**
 * Session and Authentication
 */
// app.use(passport.initialize());

/**
 *  Routing
 *  Here we have all routes defined in our production application
 */
app.use('/test', indexRouter);
// app.use('/users', usersRouter);
// app.use('/fsjars_employee', fsjarsEmployeeRouter);
app.use('/location', locationRouter);
// app.use('/company', companyRouter);
// app.use('/enquiry', enquiryRouter);
app.use('/employee', companyEmployeeRouter);
// app.use('/notification', notificationRouter);

/**
 * Routes defined for testing only included in test environment
 */
if (config.get('environment') === 'test') {
  // eslint-disable-next-line global-require
  const testValidatorSanitizerRouter = require('./tests/test_helper/test-validator-sanitizer');
  app.use('/QA/validator_sanitizer', testValidatorSanitizerRouter);
}
// catch 404 and forward to error handler

app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  // TODO Add environment setting for development and production and enable this
  //  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(responseGenerator.errorResponse('Not Found', err.status, 'Resource you are trying to access is not found', '', req.url));
});

module.exports = app;
