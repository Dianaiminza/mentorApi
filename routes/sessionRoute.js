var express = require('express');
var Mentor = require('../models/mentorModel');
var User = require('../models/userModel');
var Session = require('../models/sessionModel');
var { getToken, isAuth } = require('../util');
var bcrypt = require('bcryptjs');
var router = express.Router();

/**
 * @swagger
 * /sessions/{sessionId}/accept:
 *   put:
 *     summary: Accept a mentorship session
 *     description: Updates the status of a mentorship session to 'accepted'.
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the mentorship session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentorId:
 *                 type: string
 *                 description: The ID of the mentor
 *     responses:
 *       200:
 *         description: Mentorship session accepted.
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
 *                     sessionId:
 *                       type: string
 *                       description: The ID of the mentorship session
 *                     mentorId:
 *                       type: string
 *                       description: The ID of the mentor
 *                     menteeId:
 *                       type: string
 *                       description: The ID of the mentee
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of questions for the session
 *                     menteeEmail:
 *                       type: string
 *                       description: The email of the mentee
 *                     status:
 *                       type: string
 *                       description: The status of the session
 *                     createdAt:
 *                       type: string
 *                       description: The timestamp of when the session was created
 *                     acceptedAt:
 *                       type: string
 *                       description: The timestamp of when the session was accepted
 *       400:
 *         description: Bad request.
 *       403:
 *         description: You are not authorized to accept this session.
 *       404:
 *         description: Mentorship session not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:sessionId/accept', isAuth, async (req, res) => {
    const { sessionId } = req.params;
    const { mentorId } = req.body;

    if (!mentorId) {
        return res.status(400).json({
            success: false,
            message: 'mentorId is required'
        });
    }

    try {
        // Retrieve the mentorship session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Mentorship session not found'
            });
        }

        if (session.mentorId.toString() !== mentorId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to accept this session'
            });
        }

        // Update the status of the session to 'accepted'
        session.status = 'accepted';
        session.acceptedAt = new Date();

        const updatedSession = await session.save();

        res.status(200).json({
            success: true,
            message: 'Mentorship session accepted',
            data: updatedSession
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error accepting mentorship session',
            error: err.message,
        });
    }
});

/**
* @swagger
* /api/sessions/{sessionId}/reject:
*   put:
*     summary: Reject a mentorship session
*     description: Updates the status of a mentorship session to 'rejected'.
*     tags:
*       - Sessions
*     parameters:
*       - in: path
*         name: sessionId
*         required: true
*         schema:
*           type: string
*         description: The ID of the mentorship session
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               mentorId:
*                 type: string
*                 description: The ID of the mentor
*     responses:
*       200:
*         description: Mentorship session rejected.
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
*                     sessionId:
*                       type: string
*                       description: The ID of the mentorship session
*                     mentorId:
*                       type: string
*                       description: The ID of the mentor
*                     menteeId:
*                       type: string
*                       description: The ID of the mentee
*                     questions:
*                       type: array
*                       items:
*                         type: string
*                       description: Array of questions for the session
*                     menteeEmail:
*                       type: string
*                       description: The email of the mentee
*                     status:
*                       type: string
*                       description: The status of the session
*                     createdAt:
*                       type: string
*                       description: The timestamp of when the session was created
*                     rejectedAt:
*                       type: string
*                       description: The timestamp of when the session was rejected
*       400:
*         description: Bad request.
*       403:
*         description: You are not authorized to reject this session.
*       404:
*         description: Mentorship session not found.
*       500:
*         description: Internal server error.
*/
router.put('/:sessionId/reject', isAuth, async (req, res) => {
    const { sessionId } = req.params;
    const { mentorId } = req.body;

    if (!mentorId) {
        return res.status(400).json({
            success: false,
            message: 'mentorId is required'
        });
    }

    try {
        // Retrieve the mentorship session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Mentorship session not found'
            });
        }

        if (session.mentorId.toString() !== mentorId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to reject this session'
            });
        }

        // Update the status of the session to 'rejected'
        session.status = 'rejected';
        session.rejectedAt = new Date();

        const updatedSession = await session.save();

        res.status(200).json({
            success: true,
            message: 'Mentorship session rejected',
            data: updatedSession
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting mentorship session',
            error: err.message,
        });
    }
});
/**
 * @swagger
 * /api/sessions/create:
 *   post:
 *     summary: Create a new mentorship session
 *     description: Creates a new mentorship session with the given mentor and mentee details.
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentorId:
 *                 type: string
 *                 description: The ID of the mentor
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of questions for the session
 *               menteeEmail:
 *                 type: string
 *                 description: The email of the mentee
 *             required:
 *               - mentorId
 *               - menteeEmail
 *     responses:
 *       201:
 *         description: Mentorship session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Request success status
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the created session
 *                     mentorId:
 *                       type: string
 *                       description: The ID of the mentor
 *                     menteeId:
 *                       type: string
 *                       description: The ID of the mentee
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of questions for the session
 *                     menteeEmail:
 *                       type: string
 *                       description: The email of the mentee
 *       400:
 *         description: Bad request. Missing required fields
 *       404:
 *         description: Mentee not found
 *       500:
 *         description: Internal server error
 */

router.post('/create', isAuth, async (req, res) => {
    const { mentorId, questions, menteeEmail } = req.body;

    if (!mentorId || !menteeEmail) {
        return res.status(400).json({
            success: false,
            message: 'mentorId and menteeEmail are required'
        });
    }

    try {
        // Retrieve the mentee user record using email
        const mentee = await User.findOne({ email: menteeEmail });
        if (!mentee) {
            return res.status(404).json({
                success: false,
                message: 'Mentee user not found'
            });
        }

        // Create a new mentorship session
        const sessionData = {
            mentorId: mongoose.Types.ObjectId(mentorId),
            menteeId: mentee._id,
            questions,
            menteeEmail
        };

        const newSession = new Session(sessionData);
        const savedSession = await newSession.save();

        res.status(201).json({
            success: true,
            data: savedSession
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating mentorship session',
            error: err.message,
        });
    }
});

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Fetch mentorship sessions
 *     description: Fetches mentorship sessions based on the user ID and role.
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *         description: The role of the user (mentee or mentor)
 *     responses:
 *       200:
 *         description: Mentorship sessions fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Request success status
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the mentorship session
 *                       mentorId:
 *                         type: string
 *                         description: The ID of the mentor
 *                       menteeId:
 *                         type: string
 *                         description: The ID of the mentee
 *                       questions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Array of questions for the session
 *                       menteeEmail:
 *                         type: string
 *                         description: The email of the mentee
 *                       status:
 *                         type: string
 *                         description: The status of the session
 *                       createdAt:
 *                         type: string
 *                         description: The timestamp of when the session was created
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
router.get('/', isAuth, async (req, res) => {
    const { userId, role } = req.query;

    if (!userId || !role) {
        return res.status(400).json({
            success: false,
            message: 'userId and role are required'
        });
    }

    try {
        let sessions;

        if (role === 'mentee') {
            // Fetch sessions created by the user as a mentee
            sessions = await Session.find({ menteeId: userId });
        } else if (role === 'mentor') {
            // Fetch sessions assigned to the user as a mentor
            sessions = await Session.find({ mentorId: userId });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching mentorship sessions',
            error: err.message,
        });
    }
});

/**
 * @swagger
 * /api/sessions/{sessionId}/review:
 *   post:
 *     summary: Review a mentorship session
 *     description: Review a mentorship session after the session is completed.
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the mentorship session
  *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menteeId:
 *                 type: string
 *                 description: The ID of the mentee
 *               rating:
 *                 type: number
 *                 description: The rating given for the session
 *               comments:
 *                 type: string
 *                 description: Comments provided for the session
 *     responses:
 *       201:
 *         description: Review added successfully.
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
 *                     sessionId:
 *                       type: string
 *                       description: The ID of the mentorship session
 *                     menteeId:
 *                       type: string
 *                       description: The ID of the mentee
 *                     rating:
 *                       type: number
 *                       description: The rating given for the session
 *                     comments:
 *                       type: string
 *                       description: Comments provided for the session
 *                     reviewDate:
 *                       type: string
 *                       description: The timestamp of when the review was added
 *       400:
 *         description: Bad request.
 *       403:
 *         description: You are not authorized to review this session.
 *       404:
 *         description: Mentorship session not found.
 *       500:
 *         description: Internal server error.
 */

router.post('/:sessionId/review', isAuth, async (req, res) => {
    const { sessionId } = req.params;
    const { menteeId, rating, comments } = req.body;

    if (!menteeId || typeof rating !== 'number' || !comments) {
        return res.status(400).json({
            success: false,
            message: 'menteeId, rating, and comments are required'
        });
    }

    try {
        // Retrieve the mentorship session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Mentorship session not found'
            });
        }

        if (session.menteeId !== menteeId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to review this session'
            });
        }

        // Add the review to the MentorshipSession document
        session.review = {
            rating,
            comments,
            reviewDate: new Date() // Use server timestamp in production
        };

        await session.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: {
                sessionId: sessionId,
                menteeId,
                rating,
                comments,
                reviewDate: session.review.reviewDate.toISOString()
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error adding review',
            error: err.message,
        });
    }
});

/**
* @swagger
* /api/sessions/{sessionId}/review:
*   delete:
*     summary: Delete a mentorship session review
*     description: Delete a review for a mentorship session.
*     tags:
*       - Sessions
*     parameters:
*       - in: path
*         name: sessionId
*         required: true
*         schema:
*           type: string
*         description: The ID of the mentorship session
*     responses:
*       200:
*         description: Review deleted successfully.
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
*       404:
*         description: Mentorship session or review not found.
*       500:
*         description: Internal server error.
*/

router.delete('/:sessionId/review', isAuth, async (req, res) => {
    const { sessionId } = req.params;

    try {
        // Retrieve the mentorship session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Mentorship session not found'
            });
        }

        if (!session.review) {
            return res.status(404).json({
                success: false,
                message: 'No review found for this session'
            });
        }

        // Delete the review from the MentorshipSession document
        session.review = undefined;
        await session.save();

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: err.message,
        });
    }
});

module.exports = router; 