var express = require('express');
var path = require('path');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
var path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var userRoute = require('./routes/userRoute');
var sessionRoute = require('./routes/sessionRoute');
var mentorRoute = require('./routes/mentorRoute');
var tagRoute = require('./routes/tagRoute');
var questionRoute = require('./routes/questionRoute');
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

require('dotenv').config()
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'))
// app.use(express.static(path.join(__dirname, '//frontend/public')));

const mongodbUrl = process.env.MONGODB_URL
  || 'mongodb+srv://Captain:Captain224@cluster0.ojw4zwx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongodbUrl, {
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000
  }
}).catch(error => console.error('MongoDB connection error:', error));

app.use(bodyParser.json());
app.use('/api/users', userRoute);
app.use('/api/sessions', sessionRoute);
app.use('/api/mentors', mentorRoute);
app.use('/api/tags', tagRoute);
app.use('/api/question', questionRoute);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const sendNotificationEmail = (email) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to the Mentors Platform!',
    text: 'Thank you for signing up on the Mentors Platform. We are excited to have you!',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Your application routes go here...
app.listen(process.env.PORT || 5000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  console.log(`Express server listening on port ${PORT}`);
  console.log(`Base URL is ${BASE_URL}`);
});
