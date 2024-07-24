var mongoose =require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String, required: true, unique: true, index: true, dropDups: true,
  },
  password: { type: String, required: true },
  address: { type: String},
  bio:{type:String},
  expertise: { type: String },
  occupation:{type:String},
  token: { type: String },
});

const mentorModel = mongoose.model('Mentor', mentorSchema);
module.exports=mentorModel;