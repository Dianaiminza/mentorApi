var Question = require('../models/questionModel');
var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();
var { getToken, isAuth } = require('../util');

/**
 * @swagger
 * /api/questions/create:
 *   post:
 *     summary: Create a new question
 *     description: Creates a new question with optional tags.
 *     tags:
 *       - Questions
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

router.post('/create', isAuth, async (req, res) => {
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
 *     description: Retrieve a list of all questions with optional search and sorting.
 *     parameters:
 *       - in: query
 *         name: searchKeyword
 *         schema:
 *           type: string
 *         description: Search questions by keyword
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         enum: [newest, active, unanswered]
 *         description: Sort questions by newest, active, or unanswered
 *     responses:
 *       200:
 *         description: Questions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the question
 *                       title:
 *                         type: string
 *                         description: The title of the question
 *                       content:
 *                         type: string
 *                         description: The content of the question
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             title:
 *                               type: string
 *                               description: The title of the tag
 *                             content:
 *                               type: string
 *                               description: The content of the tag
 *                       createdAt:
 *                         type: string
 *                         description: The timestamp of when the question was created
 *                       updatedAt:
 *                         type: string
 *                         description: The timestamp of when the question was last updated
 *       500:
 *         description: Internal server error.
 *     tags:
 *       - Questions
 */
router.get('/', async (req, res) => {
    try {
        const searchKeyword = req.query.searchKeyword
            ? {
                title: {
                    $regex: req.query.searchKeyword,
                    $options: 'i',
                },
            }
            : {};

        let sortOrder;
        if (req.query.sortOrder) {
            switch (req.query.sortOrder) {
                case 'newest':
                    sortOrder = { createdAt: -1 };
                    break;
                case 'active':
                    sortOrder = { updatedAt: -1 };
                    break;
                case 'unanswered':
                    sortOrder = { 'answers.length': 1, createdAt: -1 };
                    break;
                default:
                    sortOrder = { _id: -1 };
            }
        } else {
            sortOrder = { _id: -1 };
        }

        const questions = await Question.find({ ...searchKeyword }).sort(sortOrder);
        res.status(200).json({
            success: true,
            data: questions,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching questions',
            error: err.message,
        });
    }
});
/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     description: Retrieve a specific question by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question to retrieve.
 *     responses:
 *       200:
 *         description: Question retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
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
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Internal server error.
 *     tags:
 *       - Questions
 */

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id);

        if (question) {
            res.status(200).json({
                success: true,
                data: question
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching question',
            error: err.message,
        });
    }
});

module.exports = router;