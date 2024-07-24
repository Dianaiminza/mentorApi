var express = require('express');
var User = require('../models/userModel');
var { getToken, isAuth } = require('../util');
var bcrypt = require('bcryptjs');
var router = express.Router();
const nodemailer = require('nodemailer');
var { isAuth, isAdmin } = require('../util');

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
    subject: 'Welcome to HerTechQuest Platform!',
    text: 'Thank you for signing up on HerTechQuest Platform. We are excited to have you!',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Edit user by ID
 *     description: Update user details based on the provided user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: User successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the updated user
 *                 name:
 *                   type: string
 *                   description: The updated name of the user
 *                 email:
 *                   type: string
 *                   description: The updated email of the user
 *                 isAdmin:
 *                   type: boolean
 *                   description: Indicates if the user is an admin
 *                 token:
 *                   type: string
 *                   description: JWT token for the updated user
 *       400:
 *         description: Bad request if invalid input data is provided.
 *       404:
 *         description: User not found with the provided ID.
 *       500:
 *         description: Internal server error.
 */
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
/**
 * @swagger
 * /api/users/signin:
 *   post:
 *     summary: User Sign-In
 *     description: Authenticate a user and return user details and a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: Successful sign-in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the authenticated user
 *                 name:
 *                   type: string
 *                   description: The name of the authenticated user
 *                 email:
 *                   type: string
 *                   description: The email of the authenticated user
 *                 isAdmin:
 *                   type: boolean
 *                   description: Indicates if the user is an admin
 *                 token:
 *                   type: string
 *                   description: JWT token for the authenticated user
 *       401:
 *         description: Invalid email or password.
 *       500:
 *         description: Internal server error.
 */
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
 * /api/users/register:
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
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  try {
    bcrypt.hash(password, 8, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error hashing password',
          error: err.message
        });
      }

      const user = new User({
        name,
        email,
        password: hash,
      });

      const newUser = await user.save();

      // Send notification email
      sendNotificationEmail(newUser.email);

      res.status(201).json({
        success: true,
        data: {
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          isAdmin: newUser.isAdmin,
          token: getToken(newUser),
        }
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: err.message,
    });
  }
});
/**
 * @swagger
 * /api/users:
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
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get User by ID
 *     description: Fetches user details by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Successful response with user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the user
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 isAdmin:
 *                   type: boolean
 *                   description: Indicates if the user is an admin
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User Not Found.');
    }
  } catch (err) {
    res.status(500).send({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
});
/**
 * @swagger
 * /api/users/:id:
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
 * /api/users/createadmin:
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

module.exports = router; 