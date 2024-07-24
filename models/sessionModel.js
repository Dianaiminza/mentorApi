var mongoose =require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      rating: { type: Number, default: 0 },
      comment: { type: String, required: true },
      reviewDate: { type: Date, default: Date.now }
    },
    {
      timestamps: true,
    }
  );
  const sessionSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  menteeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  questions: { type: [String], required: true },
  menteeEmail: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, default: 0, required: true },
  numReviews: { type: Number, default: 0, required: true },
  review: [reviewSchema],
  });
  
  const sessionModel = mongoose.model('Session', sessionSchema);
  module.exports=sessionModel;