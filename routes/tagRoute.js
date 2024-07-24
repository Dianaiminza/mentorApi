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
*     description: Retrieve a list of all tags from questions.
*     responses:
*       200:
*         description: Tags retrieved successfully.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   title:
*                     type: string
*                     description: The title of the tag
*                   content:
*                     type: string
*                     description: The content of the tag
*       500:
*         description: Internal server error.
*/

router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        let tags = [];
        questions.forEach(question => {
            tags = tags.concat(question.tags);
        });
        res.status(200).json({
            success: true,
            data: tags
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tags',
            error: err.message,
        });
    }
});
module.exports = router; 