var dotenv =require('dotenv');

dotenv.config();

module.exports={
PORT: process.env.PORT || 5000,
MONGODB_URL: process.env.MONGODB_URL || 'mongodb+srv://Captain:Captain224@cluster0.ojw4zwx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
JWT_SECRET: process.env.JWT_SECRET || 'Zqc7mJMrGdEiIk&zF2C4K03Chk3TXwKH',
BASE_URL:process.env.BASE_URL || 'https://mentorapi-tawz.onrender.com',
Email:process.env.EMAIL ||'dianaiminza.99@gmail.com',
Password:process.env.EMAIL_PASSWORD || ''
};