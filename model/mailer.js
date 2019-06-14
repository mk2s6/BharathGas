const nodemailer = require('nodemailer'); // nodemailer package used to send emails
const config = require('config');

// transporter object is used for creating an object that uses a SMTP service
// it is the one which is used for authenticating the hosting server and sends email
const transporter = nodemailer.createTransport({
  host: config.get('nodeMailerConfig.host'),
  port: config.get('nodeMailerConfig.port'),
  secure: false,
  auth: {
    user: config.get('nodeMailerConfig.email'),
    pass: config.get('nodeMailerConfig.password'),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
