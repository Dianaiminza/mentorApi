var dotenv =require('dotenv');

dotenv.config();

module.exports={
PORT: process.env.PORT || 5000,
JWT_SECRET: process.env.JWT_SECRET || 'Zqc7mJMrGdEiIk&zF2C4K03Chk3TXwKH',


};