var Discussion = require('../models/discussionModel');
var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();
var { getToken, isAuth } = require('../util');

/**
 * @swagger
 * /api/discussions/create:
 *   post:
 *     summary: Create a new discussion
 *     description: Creates a new discussion with optional tags.
 *     tags:
 *       - Discussions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the discussion
 *               content:
 *                 type: string
 *                 description: The content of the discussion
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
 *         description: Discussion created successfully.
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
 *                       description: The ID of the discussion
 *                     title:
 *                       type: string
 *                       description: The title of the discussion
 *                     content:
 *                       type: string
 *                       description: The content of the discussion
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
 *                       description: The timestamp of when the discussion was created
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
        // Create a new discussion
        const newDiscussion = new Discussion({
            title,
            content,
            tags
        });

        // Save the discussion to the database
        const savedDiscussion = await newDiscussion.save();

        res.status(201).json({
            success: true,
            message: 'Discussion created successfully',
            data: savedDiscussion
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating discussion',
            error: err.message,
        });
    }
});

/**
 * @swagger
 * /api/discussions:
 *   get:
 *     summary: Get all discussions
 *     description: Retrieve a list of all discussions, with optional sorting by newest, latest activity, and filtering by tag.
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, latestActivity]
 *         description: Sort discussions by newest or latest activity.
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter discussions by tag.
 *     responses:
 *       200:
 *         description: Discussions retrieved successfully.
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
 *                         description: The ID of the discussion
 *                       title:
 *                         type: string
 *                         description: The title of the discussion
 *                       content:
 *                         type: string
 *                         description: The content of the discussion
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
 *                         description: The timestamp of when the discussion was created
 *                       updatedAt:
 *                         type: string
 *                         description: The timestamp of the latest activity in the discussion
 *       500:
 *         description: Internal server error.
 *     tags:
 *       - Discussions
 */
router.get('/', async (req, res) => {
    try {
        const { sortBy, tag } = req.query;

        let sortOrder = {};
        if (sortBy === 'newest') {
            sortOrder = { createdAt: -1 };
        } else if (sortBy === 'latestActivity') {
            sortOrder = { updatedAt: -1 };
        }

        let filter = {};
        if (tag) {
            filter = { 'tags.title': tag };
        }

        const discussions = await Discussion.find(filter).sort(sortOrder);

        res.status(200).json({
            success: true,
            data: discussions
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching discussions',
            error: err.message,
        });
    }
});


module.exports = router; 