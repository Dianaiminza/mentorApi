var express = require('express');
var Mentor = require('../models/mentorModel');
var { getToken, isAuth } = require('../util');
var bcrypt = require('bcryptjs');
var router = express.Router();
var { isAuth, isAdmin } = require('../util');

/**
 * @swagger
 *  /api/mentors:
 *   post:
 *     summary: Create a mentor user
 *     description: Endpoint to create a mentor user.
 *     tags:
 *       - Mentors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 description: Mentor's email
 *               password:
 *                 type: string
 *                 description: Mentor's password
 *               name:
 *                 type: string
 *                 description: Mentor's  name
 *               address:
 *                 type: string
 *                 description: Mentor's address
 *               bio:
 *                 type: string
 *                 description: Mentor's bio
 *               expertise:
 *                 type: string
 *                 description: Mentor's expertise
 *               occupation:
 *                 type: string
 *                 description: Mentor's occupation
 *     responses:
 *       201:
 *         description: Mentor created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   description: Mentor ID
 *                 email:
 *                   type: string
 *                   description: Mentor's email
 *                 firstName:
 *                   type: string
 *                   description: Mentor's first name
 *                 lastName:
 *                   type: string
 *                   description: Mentor's last name
 *                 address:
 *                   type: string
 *                   description: Mentor's address
 *                 bio:
 *                   type: string
 *                   description: Mentor's bio
 *                 expertise:
 *                   type: string
 *                   description: Mentor's expertise
 *                 occupation:
 *                   type: string
 *                   description: Mentor's occupation
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
router.post("/", isAuth, async (req, res) => {
    const newMentor = new Mentor({
        occupation: req.body.occupation,
        expertise: req.body.expertise,
        bio: req.body.bio,
        address: req.body.address,
        password: req.body.password,
        name: req.body.name,
        email: req.body.email,
    });
    const newMentorCreated = await newMentor.save();
    res.status(201).send({ message: "New Mentor Created", data: newMentorCreated });
});
/**
 * @swagger
 * /api/mentors:
 *   get:
 *     summary: Get all mentors
 *     description: Fetches a list of all mentors from the database.
 *     tags:
 *       - Mentors
 *     responses:
 *       200:
 *         description: List of mentors successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the mentor
 *                   name:
 *                     type: string
 *                     description: The name of the mentor
 *                   email:
 *                     type: string
 *                     description: The email of the mentor
 *                   isAdmin:
 *                     type: boolean
 *                     description: Indicates if the mentor has admin privileges
 *                   createdAt:
 *                     type: string
 *                     description: Timestamp of when the mentor record was created
 *                   updatedAt:
 *                     type: string
 *                     description: Timestamp of when the mentor record was last updated
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
    const users = await Mentor.find();
    res.send(users);
});
/**
 * @swagger
 * /api/mentors/{id}:
 *   get:
 *     summary: Get a mentor by ID
 *     description: Retrieves a specific mentor's details using their ID.
 *     tags:
 *       - Mentors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the mentor
 *     responses:
 *       200:
 *         description: Mentor details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the mentor
 *                 name:
 *                   type: string
 *                   description: The name of the mentor
 *                 email:
 *                   type: string
 *                   description: The email of the mentor
 *                 isAdmin:
 *                   type: boolean
 *                   description: Indicates if the mentor has admin privileges
 *                 createdAt:
 *                   type: string
 *                   description: Timestamp of when the mentor record was created
 *                 updatedAt:
 *                   type: string
 *                   description: Timestamp of when the mentor record was last updated
 *       404:
 *         description: Mentor not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", async (req, res) => {

    const mentor = await Mentor.findOne({ _id: req.params.id });
    if (mentor) {
        res.send(user);
    } else {
        res.status(404).send("Mentor Not Found.")
    }
});
/**
 * @swagger
 * /api/mentors/{id}:
 *   put:
 *     summary: Update a mentor's details
 *     description: Updates the details of a mentor identified by their ID.
 *     tags:
 *       - Mentors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the mentor to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the mentor
 *               email:
 *                 type: string
 *                 description: The email of the mentor
 *               password:
 *                 type: string
 *                 description: The password of the mentor (hashed in production)
 *             required:
 *               - name
 *               - email
 *     responses:
 *       200:
 *         description: Mentor successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the mentor
 *                 name:
 *                   type: string
 *                   description: The name of the mentor
 *                 email:
 *                   type: string
 *                   description: The email of the mentor
 *                 token:
 *                   type: string
 *                   description: Authentication token for the mentor
 *       400:
 *         description: Bad request, missing required fields
 *       404:
 *         description: Mentor not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', isAuth, async (req, res) => {
    const mentorId = req.params.id;
    const mentor = await Mentor.findById(mentorId);
    if (mentor) {
        mentor.name = req.body.name || mentor.name;
        mentor.email = req.body.email || mentor.email;
        mentor.password = req.body.password || mentor.password;
        const updatedMentor = await user.save();
        res.send({
            _id: updatedMentor.id,
            name: updatedMentor.name,
            email: updatedMentor.email,
            token: getToken(updatedMentor),
        });
    } else {
        res.status(404).send({ message: 'Mentor Not Found' });
    }
});

/**
 * @swagger
 * /api/mentors/{id}:
 *   delete:
 *     summary: Delete a mentor by ID
 *     description: Deletes a mentor from the database identified by their ID.
 *     tags:
 *       - Mentors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the mentor to delete
 *     responses:
 *       200:
 *         description: Mentor successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the deleted mentor
 *                 name:
 *                   type: string
 *                   description: The name of the deleted mentor
 *                 email:
 *                   type: string
 *                   description: The email of the deleted mentor
 *       404:
 *         description: Mentor not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", isAuth, isAdmin, async (req, res) => {
    const mentor = await Mentor.findOne({ _id: req.params.id });
    if (mentor) {
        const deletedMentor = await mentor.remove();
        res.send(deletedMentor);
    } else {
        res.status(404).send("Mentor Not Found.")
    }
});

module.exports = router; 