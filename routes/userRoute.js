var  express =require('express');
var User =require('../models/userModel');
var { getToken, isAuth } =require('../util');
var bcrypt = require('bcryptjs');
var router=express.Router();
const nodemailer = require('nodemailer');
var { isAuth, isAdmin } =require('../util');

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

router.put('/:id', isAuth, async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    const updatedUser = await user.save();
    res.send({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: getToken(updatedUser),
    });
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
});

router.post('/signin', async (req, res) => {
  const signinUser = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (signinUser) {
    res.send({
      _id: signinUser.id,
      name: signinUser.name,
      email: signinUser.email,
      isAdmin: signinUser.isAdmin,
      token: getToken(signinUser),
    });
  } else {
    res.status(401).send({ message: 'Invalid Email or Password.' });
  }
});
/**
 * @swagger
 * /register:
 *   post:
 *     summary: User Sign up
 *     description: Users sign up.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *               name:
 *                 type: string
 *                 description: User's  name
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 Name:
 *                   type: string
 *                   description: User's f name
 *                 success:
 *                   type: boolean
 *                   description: Request success status
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
router.post('/register', async (req, res) => {
  bcrypt.hash(req.body.password,8, async(err,hash)=>{  
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hash,
  });
  const newUser = await user.save();
  // Send notification email
  sendNotificationEmail(email);
  if (newUser) {
    res.send({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      token: getToken(newUser),
    });
  } else {
    res.status(401).send({ message: 'Invalid User Data.' });
  }

  })
});
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users
 *     description: Retrieve users.
 *     responses:
 *       200:
 *         description: Successful response.
 */
router.get("/", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get("/:id", isAuth, async (req, res) => {
  
  const user = await User.findOne({ _id: req.params.id });
  if (user) {
    res.send(user);
  } else {
    res.status(404).send("User Not Found.")
  }
});
/**
 * @swagger
 * /:id:
 *   delete:
 *     summary: Delete user per id
 *     description: Delete user  details.
 *     responses:
 *       200:
 *         description: Successful response.
 */
router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (user) {
    const deletedUser = await user.remove();
    res.send(deletedUser);
  } else {
    res.status(404).send("Users Not Found.")
  }
});
/**
 * @swagger
 * /createadmin:
 *   get:
 *     summary: Get admin details
 *     description: Retrieve admin details.
 *     responses:
 *       200:
 *         description: Successful response of admin details.
 */
router.get('/createadmin', async (req, res) => {
  try {
    const user = new User({
      name: 'Captain',
      email: 'dianaiminza.99@gmail.com',
      password: '4567',
      isAdmin: true,
    });
    const newUser = await user.save();
    res.send(newUser);
  } catch (error) {
    res.send({ message: error.message });
  }
});

module.exports=router; 