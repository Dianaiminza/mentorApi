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
 *             required:
 *               - email
 *               - password
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
 *     tags:
 *       - Users
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
 *                 format: email
 *                 description: The email of the user
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: yourpassword123
 *             required:
 *               - email
 *               - password
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
 *     tags:
 *       - Users
 */
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Email or Password.' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Email or Password.' });
    }

    // Generate a JWT token
    const token = getToken(user);

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Internal server error.',
      error: err.message,
    });
  }
});
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with email, name, and password.
 *     tags:
 *       - Users
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
 *                 description: The password for the user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the newly created user
 *                 name:
 *                   type: string
 *                   description: The name of the newly created user
 *                 email:
 *                   type: string
 *                   description: The email of the newly created user
 *                 isAdmin:
 *                   type: boolean
 *                   description: Indicates if the user is an admin
 *                 token:
 *                   type: string
 *                   description: Authentication token for the user
 *       400:
 *         description: Bad request. Missing required fields or invalid data.
 *       409:
 *         description: Conflict. Email already exists.
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }
  // Validate placeholder values
  const placeholderValues = ['string', 'password', 'name'];
  if (placeholderValues.includes(name) || placeholderValues.includes(email) || placeholderValues.includes(password)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided'
    });
  }
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash the password
    bcrypt.hash(password, 8, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error hashing password',
          error: err.message
        });
      }

      // Create and save the new user
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
 *     tags:
 *       - Users
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
 * /api/users/createadmin:
 *   get:
 *     summary: Get admin details
 *     description: Retrieve admin details.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successful response of admin details.
 */
router.get('/createadmin', async (req, res) => {
  try {
    const hash = await bcrypt.hash("Test@123", 8);

    const user = new User({
      name: 'Captain',
      email: 'dianaiminza.99@gmail.com',
      password: hash,
      isAdmin: true,
    });

    const newUser = await user.save();
    res.send(newUser);
  } catch (error) {
    res.send({ message: error.message });
  }
});
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get User by ID
 *     description: Fetches user details by their ID.
 *     tags:
 *       - Users
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
 *     tags:
 *       - Users
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


module.exports = router; 