var  express =require('express');
var Mentor =require('../models/mentorModel');
var { getToken, isAuth } =require('../util');
var bcrypt = require('bcryptjs');
var router=express.Router();
var { isAuth, isAdmin } =require('../util');

/**
 * @swagger
 * /createMentor:
 *   post:
 *     summary: Create a mentor user
 *     description: Endpoint to create a mentor user.
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

  router.get("/", async (req, res) => {
    const users = await Mentor.find();
    res.send(users);
  });

  router.get("/:id", async (req, res) => {
  
    const mentor = await Mentor.findOne({ _id: req.params.id });
    if (mentor) {
      res.send(user);
    } else {
      res.status(404).send("Mentor Not Found.")
    }
  });

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

  router.delete("/:id", isAuth, isAdmin, async (req, res) => {
    const mentor = await Mentor.findOne({ _id: req.params.id });
    if (mentor) {
      const deletedMentor = await mentor.remove();
      res.send(deletedMentor);
    } else {
      res.status(404).send("Mentor Not Found.")
    }
  });

  module.exports=router; 