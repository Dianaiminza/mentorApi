var mongoose = require('mongoose');
const tagSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);
const discussionSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String },
    tags: [tagSchema],
});

const discussionModel = mongoose.model('Discussion', discussionSchema);
module.exports = discussionModel;