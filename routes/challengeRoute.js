var Challenge = require('../models/challengeModel');
var express = require('express');
var router = express.Router();


/**
 * @swagger
 * /api/challenges:
 *   post:
 *     summary: Create a new challenge
 *     description: Create a new challenge with title, description, and difficulty level.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the challenge
 *                 example: "New Challenge"
 *               description:
 *                 type: string
 *                 description: The description of the challenge
 *                 example: "This is a description of the challenge."
 *               difficulty:
 *                 type: string
 *                 description: The difficulty level of the challenge
 *                 example: "Easy"
 *             required:
 *               - title
 *               - description
 *               - difficulty
 *     responses:
 *       201:
 *         description: Challenge created successfully.
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
 *                     title:
 *                       type: string
 *                       description: The title of the challenge
 *                     description:
 *                       type: string
 *                       description: The description of the challenge
 *                     difficulty:
 *                       type: string
 *                       description: The difficulty level of the challenge
 *       400:
 *         description: Bad request if required fields are missing.
 *       500:
 *         description: Internal server error.
 *     tags:
 *       - Challenges
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, difficulty } = req.body;

        if (!title || !description || !difficulty) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and difficulty are required'
            });
        }

        const challenge = new Challenge({
            title,
            description,
            difficulty,
        });

        await challenge.save();

        res.status(201).json({
            success: true,
            data: challenge
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating challenge',
            error: err.message
        });
    }
});


/**
 * @swagger
 * /api/challenges:
 *   get:
 *     summary: Get all challenges
 *     description: Retrieve a list of all challenges.
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully.
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
 *                         description: The ID of the challenge
 *                       title:
 *                         type: string
 *                         description: The title of the challenge
 *                       description:
 *                         type: string
 *                         description: The description of the challenge
 *                       difficulty:
 *                         type: string
 *                         description: The difficulty level of the challenge
 *                       createdAt:
 *                         type: string
 *                         description: The timestamp of when the challenge was created
 *                       updatedAt:
 *                         type: string
 *                         description: The timestamp of when the challenge was last updated
 *       500:
 *         description: Internal server error.
 *     tags:
 *       - Challenges
 */

router.get('/', async (req, res) => {
    try {
        const challenges = await Challenge.find();
        res.status(200).json({
            success: true,
            data: challenges
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching challenges',
            error: err.message
        });
    }
});

module.exports = router; 