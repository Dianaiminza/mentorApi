var Question = require('../models/questionModel');
var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();

/**
 * @swagger
 * /api/tags/questions/{questionId}/tags:
 *   post:
 *     summary: Add a tag to a question
 *     description: Adds a new tag to a specified question.
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the tag
 *               content:
 *                 type: string
 *                 description: The content of the tag
 *     responses:
 *       201:
 *         description: Tag added successfully.
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
 *                       description: The ID of the tag
 *                     title:
 *                       type: string
 *                       description: The title of the tag
 *                     content:
 *                       type: string
 *                       description: The content of the tag
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Internal server error.
 */

router.post('/:questionId/tags', async (req, res) => {
    const { questionId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: 'Title and content are required'
        });
    }

    try {
        // Find the question by ID
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Add the new tag to the question
        const newTag = { title, content };
        question.tags.push(newTag);

        // Save the updated question
        await question.save();

        res.status(201).json({
            success: true,
            message: 'Tag added successfully',
            data: newTag
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error adding tag',
            error: err.message,
        });
    }
});
/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve a list of all tags with optional search and sorting.
 *     parameters:
 *       - in: query
 *         name: searchKeyword
 *         schema:
 *           type: string
 *         description: Search tags by keyword
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         enum: [popular, name, new]
 *         description: Sort tags by popularity, name, or newest
 *     responses:
 *       200:
 *         description: Tags retrieved successfully.
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
 *                       title:
 *                         type: string
 *                         description: The title of the tag
 *                       content:
 *                         type: string
 *                         description: The content of the tag
 *                       createdAt:
 *                         type: string
 *                         description: The timestamp of when the tag was created
 *       500:
 *         description: Internal server error.
 *     tags:
 *       - Tags
 */
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        let tags = [];
        questions.forEach(question => {
            tags = tags.concat(question.tags);
        });

        // Remove duplicate tags
        const uniqueTags = Array.from(new Set(tags.map(tag => tag.title)))
            .map(title => {
                return tags.find(tag => tag.title === title);
            });

        // Apply search filter
        if (req.query.searchKeyword) {
            uniqueTags = uniqueTags.filter(tag =>
                tag.title.toLowerCase().includes(req.query.searchKeyword.toLowerCase())
            );
        }

        // Apply sort filter
        let sortOrder;
        if (req.query.sortOrder) {
            switch (req.query.sortOrder) {
                case 'popular':
                    // Assuming popularity is determined by the number of questions tagged
                    const tagCounts = tags.reduce((acc, tag) => {
                        acc[tag.title] = (acc[tag.title] || 0) + 1;
                        return acc;
                    }, {});
                    uniqueTags.sort((a, b) => tagCounts[b.title] - tagCounts[a.title]);
                    break;
                case 'name':
                    uniqueTags.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'new':
                    uniqueTags.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                default:
                    break;
            }
        }

        res.status(200).json({
            success: true,
            data: uniqueTags
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tags',
            error: err.message,
        });
    }
});
/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     description: Retrieve a specific tag by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tag to retrieve.
 *     responses:
 *       200:
 *         description: Tag retrieved successfully.
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
 *                       description: The ID of the tag
 *                     title:
 *                       type: string
 *                       description: The title of the tag
 *                     content:
 *                       type: string
 *                       description: The content of the tag
 *                     createdAt:
 *                       type: string
 *                       description: The timestamp of when the tag was created
 *       404:
 *         description: Tag not found.
 *       500:
 *         description: Internal server error.
 *     tags:
 *       - Tags
 */

router.get('/tags/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const questions = await Question.find({ 'tags._id': id });
        let tag;

        questions.forEach(question => {
            question.tags.forEach(t => {
                if (t._id.toString() === id) {
                    tag = t;
                }
            });
        });

        if (tag) {
            res.status(200).json({
                success: true,
                data: tag
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Tag not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tag',
            error: err.message,
        });
    }
});

module.exports = router; 