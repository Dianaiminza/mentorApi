var mongoose = require('mongoose');
const tagSchema = new mongoose.Schema(
  {
    title: { type: String },
    content: { type: String },
  },
  {
    timestamps: true,
  }
);
const questionSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  tags: [tagSchema],
});

const questionModel = mongoose.model('Question', questionSchema);
module.exports = questionModel;