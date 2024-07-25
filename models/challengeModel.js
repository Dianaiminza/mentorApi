
var mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const challengeModel = mongoose.model('Challenge', ChallengeSchema);
module.exports = challengeModel;