var Question = require('../models/questionModel');
var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();

/**
 * @swagger
 * /api/questions/create:
 *   post:
 *     summary: Create a new question
 *     description: Creates a new question with optional tags.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the question
 *               content:
 *                 type: string
 *                 description: The content of the question
 *               tags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: The title of the tag
 *                     content:
 *                       type: string
 *                       description: The content of the tag
 *     responses:
 *       201:
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Request success status
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the question
 *                     title:
 *                       type: string
 *                       description: The title of the question
 *                     content:
 *                       type: string
 *                       description: The content of the question
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             description: The title of the tag
 *                           content:
 *                             type: string
 *                             description: The content of the tag
 *                     createdAt:
 *                       type: string
 *                       description: The timestamp of when the question was created
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */

router.post('/create', async (req, res) => {
    const { title, content, tags } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: 'Title and content are required'
        });
    }

    try {
        // Create a new question
        const newQuestion = new Question({
            title,
            content,
            tags
        });

        // Save the question to the database
        const savedQuestion = await newQuestion.save();

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: savedQuestion
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating question',
            error: err.message,
        });
    }
});

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     description: Retrieve a list of all questions.
 *     responses:
 *       200:
 *         description: Questions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the question
 *                   title:
 *                     type: string
 *                     description: The title of the question
 *                   content:
 *                     type: string
 *                     description: The content of the question
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: The title of the tag
 *                         content:
 *                           type: string
 *                           description: The content of the tag
 *                   createdAt:
 *                     type: string
 *                     description: The timestamp of when the question was created
 *       500:
 *         description: Internal server error.
 */

router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json({
            success: true,
            data: questions
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching questions',
            error: err.message,
        });
    }
});

module.exports = router; 