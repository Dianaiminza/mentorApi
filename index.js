const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
var admin = require('firebase-admin');
var serviceAccount = require("./secret/config.json");
var multer = require('multer');
var path = require('path');
const saltedMd5=require('salted-md5')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const bcrypt = require('bcryptjs');
const serverless = require("serverless-http");
const nodemailer = require('nodemailer');
var { getToken, isAuth } =require('./util');
app.use(cors());
app.use(bodyParser.json());
const upload=multer({storage: multer.memoryStorage()})

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

require('dotenv').config()
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'))
// app.use(express.static(path.join(__dirname, '//frontend/public')));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mentor-39067-default-rtdb.firebaseio.com",
    storageBucket: process.env.BUCKET_URL
});

const db = admin.firestore();
const userService = require("./user_service");
app.locals.bucket = admin.storage().bucket();

// Cloud storage
app.post('/upload',upload.single('file'),async(req,res)=>{
    try {
    const name = saltedMd5(req.file.originalname, 'SUPER-S@LT!') 
const fileName =(req.file.originalname)
await app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer);
res.json({fileName
})
} catch (error) {
    res.json({
success:false,
message:"file not uploaded"
    })
}
})

const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const sendNotificationEmail = (email) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to the Mentors Platform!',
    text: 'Thank you for signing up on the Mentors Platform. We are excited to have you!',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

async function storeUser(User) {
    const docRef = await db.collection('Users').add(User)
    console.log('Added user with ID: ', docRef.id);
}
async function storeMentor(Mentor) {
const docRef = await db.collection('Mentors').add(Mentor)
}
async function getMentors() {
const snapshot = await db.collection('Mentors').get()
const collection = [];
snapshot.forEach(doc => {
    let mentor=doc.data();
    mentor['id']=doc.id
    collection.push(mentor);
});
return collection;
}

async function getUsers() {
const snapshot = await db.collection('Users').get()
const collection = [];
snapshot.forEach(doc => {
    let user=doc.data();
    user['id']=doc.id
collection.push(user);
});
return collection;y
}

// Function to create a user with a role
const createUserWithRole = async (email, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRecord = await admin.auth().createUser({
    email: email,
    password: password,
  });

  await db.collection('Users').doc(userRecord.uid).set({
    email: userRecord.email,
    password: hashedPassword, // Store hashed password
    role: role, // Add user role
    token: getToken({ uid: userRecord.uid, email: userRecord.email, role: role })
  });

  return userRecord;
};

 /**
     * @swagger
     * /createAdmin:
     *   post:
     *     summary: Create an admin user
     *     description: Endpoint to create an admin user.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 description: Admin user's email
     *               password:
     *                 type: string
     *                 description: Admin user's password
     *     responses:
     *       201:
     *         description: Admin user created successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uid:
     *                   type: string
     *                   description: Admin user ID
     *                 email:
     *                   type: string
     *                   description: Admin user's email
     *                 role:
     *                   type: string
     *                   description: User role
     *       400:
     *         description: Bad request.
     *       500:
     *         description: Internal server error.
     */
// Endpoint to create an admin user
app.post('/createAdmin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {

     // Check if an admin already exists in the Users collection
     const existingAdminSnapshot = await db.collection('Users').where('role', '==', 'admin').get();
     if (!existingAdminSnapshot.empty) {
       return res.status(400).json({
         success: false,
         message: 'An admin already exists. Cannot create another admin.'
       });
     }
    const userRecord = await createUserWithRole(email, password, 'admin');
    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      role: 'admin',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: err.message,
    });
  }
});

// Endpoint to create a mentor user
const createMentors = async (email, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRecord = await admin.auth().createUser({
    email: email,
    password: password,
  });

  await db.collection('Mentors').doc(userRecord.uid).set({
    email: userRecord.email,
    password: hashedPassword, // Store hashed password
    role: role, // Add user role
    token: getToken({ uid: userRecord.uid, email: userRecord.email, role: role })
  });

  return userRecord;
};

/**
 * @swagger
 * /createMentor:
 *   post:
 *     summary: Create a mentor user
 *     description: Endpoint to create a mentor user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 description: Mentor's email
 *               password:
 *                 type: string
 *                 description: Mentor's password
 *               firstName:
 *                 type: string
 *                 description: Mentor's first name
 *               lastName:
 *                 type: string
 *                 description: Mentor's last name
 *               address:
 *                 type: string
 *                 description: Mentor's address
 *               bio:
 *                 type: string
 *                 description: Mentor's bio
 *               expertise:
 *                 type: string
 *                 description: Mentor's expertise
 *               occupation:
 *                 type: string
 *                 description: Mentor's occupation
 *     responses:
 *       201:
 *         description: Mentor created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   description: Mentor ID
 *                 email:
 *                   type: string
 *                   description: Mentor's email
 *                 firstName:
 *                   type: string
 *                   description: Mentor's first name
 *                 lastName:
 *                   type: string
 *                   description: Mentor's last name
 *                 address:
 *                   type: string
 *                   description: Mentor's address
 *                 bio:
 *                   type: string
 *                   description: Mentor's bio
 *                 expertise:
 *                   type: string
 *                   description: Mentor's expertise
 *                 occupation:
 *                   type: string
 *                   description: Mentor's occupation
 *                 success:
 *                   type: boolean
 *                   description: Request success status
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
app.post('/createMentor', async (req, res) => {
  const { email,firstName,lastName, password,address,bio,expertise,occupation } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  try {
    // Check if a mentor already exists in the database
    const existingMentor = await db.collection('Mentors').where('email', '==', email).get();
    if (!existingMentor.empty) {
      return res.status(400).json({
        success: false,
        message: 'A mentor with this email already exists. Cannot create another mentor.'
      });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Mentor
    const userRecord = await createMentors(email, password, 'mentor');

    // Save mentor details to Firestore
    const userRef = db.collection('Mentors').doc(userRecord.uid);
    await userRef.set({
      email: userRecord.email,
      firstName: firstName,
      lastName: lastName,
      address: address,
      bio: bio,
      expertise: expertise,
      occupation: occupation,
      password: hashedPassword, // Store hashed password
      token: getToken(userRecord)
    });

    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      firstName: firstName,
      lastName: lastName,
      address: address,
      bio: bio,
      expertise: expertise,
      occupation: occupation,
      success:true,
      message:'Mentor Created Successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating mentor',
      error: err.message,
    });
  }
});
 

const isValidEmail = (email) => {
  // Improved regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.match(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i);
};

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User Sign up
 *     description: Users sign up.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               address:
 *                 type: string
 *                 description: User's address
 *               bio:
 *                 type: string
 *                 description: User's bio
 *               expertise:
 *                 type: string
 *                 description: User's expertise
 *               occupation:
 *                 type: string
 *                 description: User's occupation
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 firstName:
 *                   type: string
 *                   description: User's first name
 *                 lastName:
 *                   type: string
 *                   description: User's last name
 *                 address:
 *                   type: string
 *                   description: User's address
 *                 bio:
 *                   type: string
 *                   description: User's bio
 *                 expertise:
 *                   type: string
 *                   description: User's expertise
 *                 occupation:
 *                   type: string
 *                   description: User's occupation
 *                 success:
 *                   type: boolean
 *                   description: Request success status
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
app.post('/signup', async (req, res) => {
  const { email,firstName,lastName, password,address,bio,expertise,occupation } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email address is improperly formatted. It must end with .com',
    });
  }
  try {

    // Check if a user already exists in the database
    const existingMentor = await db.collection('Users').where('email', '==', email).get();
    if (!existingMentor.empty) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists. Cannot create another user.'
      });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });


    // Save user details to Firestore
    const userRef = db.collection('Users').doc(userRecord.uid);
    await userRef.set({
      email: userRecord.email,
      firstName: firstName,
      lastName: lastName,
      address: address,
      bio: bio,
      expertise: expertise,
      occupation: occupation,
      password: hashedPassword, // Store hashed password
      token: getToken(userRecord)
    });

    // Send notification email
    sendNotificationEmail(email);
    
    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      firstName: firstName,
      lastName: lastName,
      address: address,
      bio: bio,
      expertise: expertise,
      occupation: occupation,
      success:true,
      message:'User Created Successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: err.message,
    });
  }
});

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Sign in a user
 *     description: Sign in a user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User signed in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 firstName:
 *                   type: string
 *                   description: User's first name
 *                 lastName:
 *                   type: string
 *                   description: User's last name
 *                 address:
 *                   type: string
 *                   description: User's address
 *                 bio:
 *                   type: string
 *                   description: User's bio
 *                 expertise:
 *                   type: string
 *                   description: User's expertise
 *                 occupation:
 *                   type: string
 *                   description: User's occupation
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *                 success:
 *                   type: boolean
 *                   description: Request success status
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request.
 *       404:
 *         description: User not found or incorrect password.
 *       500:
 *         description: Internal server error.
 */
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
      const userRef = db.collection('Users').where('email', '==', email);
      const snapshot = await userRef.get();
      if (snapshot.empty) {
          throw new Error("No user found");
      }

      let user;
      snapshot.forEach(doc => {
          user = doc.data();
          user.uid = doc.id;
      });

      // Check if password matches
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          throw new Error("Incorrect password");
      }

      // If everything is correct, respond with the user data
      delete user.password; // Remove password from the response
      res.json(user);
  } catch (err) {
      res.status(404).json({ 
          success: false,
          message: err.message
      });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a specific user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 firstName:
 *                   type: string
 *                   description: User's first name
 *                 lastName:
 *                   type: string
 *                   description: User's last name
 *                 address:
 *                   type: string
 *                   description: User's address
 *                 bio:
 *                   type: string
 *                   description: User's bio
 *                 expertise:
 *                   type: string
 *                   description: User's expertise
 *                 occupation:
 *                   type: string
 *                   description: User's occupation
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

app.get('/users/:id', cors(),async (req,res) =>{
  const snapshot = await db.collection("Users").get();
  snapshot.forEach((doc) => {
   console.log(doc.id, '=>', doc.data());
    user=doc.data();
   user['id']=doc.id
     
    })
 console.log(user)
 if(user){
  res.json({
    user
  })
 }else
 {
   res.json({
     success:false,
     message:"no user found"
   })
 }   
});

/**
 * @swagger
 * /mentors/{id}:
 *   get:
 *     summary: Get a mentor by ID
 *     description: Retrieve a specific mentor by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     responses:
 *       200:
 *         description: Mentor retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Mentor ID
 *                 email:
 *                   type: string
 *                   description: Mentor's email
 *                 firstName:
 *                   type: string
 *                   description: Mentor's first name
 *                 lastName:
 *                   type: string
 *                   description: Mentor's last name
 *                 address:
 *                   type: string
 *                   description: Mentor's address
 *                 bio:
 *                   type: string
 *                   description: Mentor's bio
 *                 expertise:
 *                   type: string
 *                   description: Mentor's expertise
 *                 occupation:
 *                   type: string
 *                   description: Mentor's occupation
 *       404:
 *         description: Mentor not found.
 *       500:
 *         description: Internal server error.
 */

app.get('/mentors/:id', cors(),async (req,res) =>{
  const snapshot = await db.collection("Mentors").get();
  snapshot.forEach((doc) => {
   console.log(doc.id, '=>', doc.data());
    user=doc.data();
   user['id']=doc.id
     
    })
 console.log(user)
 if(user){
  res.json({
    user
  })
 }else
 {
   res.json({
     success:false,
     message:"no mentor found"
   })
 }   
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieve a list of users from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 */
app.get("/users",cors(), async (req,res)=>{
 
 var generatedUser = await getUsers();
 if (generatedUser != null)
 res.json(generatedUser)
 else
 res.json({
   success:false,
   message:"no users available"
 })
})

/**
 * @swagger
 * /mentors:
 *   get:
 *     summary: Get a list of mentors
 *     description: Retrieve a list of mentors from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of mentors.
 */
app.get("/mentors",cors(), async (req,res)=>{
 
  var generatedUser = await getMentors();
  if (generatedUser != null)
  res.json(generatedUser)
  else
  res.json({
    success:false,
    message:"no mentors available"
  })
 })
/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update user details
 *     description: Update the details of a specific user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User details updated successfully.
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
 *       400:
 *         description: Bad request.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
app.put('/user/:id', isAuth, async (req, res) => {
    const userId = req.params.id;
    var usersRef = db.collection('Users');
 var name   = req.body.name || user.name;
 var email = req.body.email || user.email;
 var password = req.body.password || user.password;
 var query = usersRef.where('userId', '==', req.params.id).get()
 .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
      var updateUser = db.collection('Users').doc(doc.id).update({
        name,
        email,
        password,
        }).then(() => {
          res.json({
            success:true,
            message:"successfully updated user details"
          })
        } 
        );
    });
  })
});

/**
 * @swagger
 * /mentor/{id}:
 *   put:
 *     summary: Update mentor details
 *     description: Update the details of a specific mentor by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Mentor's name
 *               email:
 *                 type: string
 *                 description: Mentor's email
 *               password:
 *                 type: string
 *                 description: Mentor's password
 *     responses:
 *       200:
 *         description: Mentor details updated successfully.
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
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Mentor not found.
 *       500:
 *         description: Internal server error.
 */

app.put('/mentor/:id', isAuth, async (req, res) => {
  const mentorId = req.params.id;
  var mentorsRef = db.collection('Mentors');
var name   = req.body.name || mentor.name;
var email = req.body.email || mentor.email;
var password = req.body.password || mentor.password;
var query = mentorsRef.where('mentorId', '==', req.params.id).get()
.then(snapshot => {
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
    var updateMentor = db.collection('Mentors').doc(doc.id).update({
      name,
      email,
      password,
      }).then(() => {
        res.json({
          success:true,
          message:"successfully updated mentor details"
        })
      } 
      );
  });
})
});

/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully.
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
 *       400:
 *         description: Bad request.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
app.delete('/user/delete/:id', async (req, res) => {
  const { uid } = req.params;

  // Check if the UID is a valid string and has exactly 32 characters
  if (typeof uid == 'string' || uid.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Invalid UID provided.',
    });
  }

  try {
    console.log(`Attempting to delete user with UID: ${uid}`); // Debugging line

    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(uid);
    console.log(`Deleted user from Firebase Authentication with ID: ${uid}`); // Debugging line

    // Optionally, delete the user from Firestore
    await db.collection('Users').doc(uid).delete();
    console.log(`Deleted user from Firestore with ID: ${uid}`); // Debugging line

    res.status(200).json({
      success: true,
      message: `User with UID: ${uid} deleted successfully`,
    });
  } catch (err) {
    console.error(`Error deleting user with ID: ${uid}`, err); // Debugging line
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: err.message,
    });
  }
});

/**
 * @swagger
 * /mentor/delete/{id}:
 *   delete:
 *     summary: Delete a mentor
 *     description: Deletes a mentor by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mentor ID
 *     responses:
 *       200:
 *         description: Mentor deleted successfully.
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
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Mentor not found.
 *       500:
 *         description: Internal server error.
 */
app.delete('/mentor/delete/:id', async (req, res) => {
  const { uid } = req.params;

  // Check if the UID is a valid string and has exactly 32 characters
  if (typeof uid == 'string' || uid.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Invalid UID provided.',
    });
  }

  try {
    console.log(`Attempting to delete mentor with UID: ${uid}`); // Debugging line

    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(uid);
    console.log(`Deleted mentor from Firebase Authentication with ID: ${uid}`); // Debugging line
    
    // Optionally, delete the user from Firestore
    await db.collection('Mentors').doc(uid).delete();
    console.log(`Deleted mentor from Firestore with ID: ${uid}`); // Debugging line

    res.status(200).json({
      success: true,
      message: `Mentor with UID: ${uid} deleted successfully`,
    });
  } catch (err) {
    console.error(`Error deleting mentor with ID: ${uid}`, err); // Debugging line
    res.status(500).json({
      success: false,
      message: 'Error deleting mentor',
      error: err.message,
    });
  }
});
 /**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a mentorship session
 *     description: Creates a new mentorship session.
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
 *     responses:
 *       201:
 *         description: Mentorship session created successfully.
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
 *                     sessionId:
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
 *                     status:
 *                       type: string
 *                       description: The status of the session
 *                     createdAt:
 *                       type: string
 *                       description: The timestamp of when the session was created
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Mentee user not found.
 *       500:
 *         description: Internal server error.
 */
 app.post('/sessions', async (req, res) => {
  const { mentorId, questions, menteeEmail } = req.body;

  if (!mentorId || !menteeEmail) {
    return res.status(400).json({
      success: false,
      message: 'mentorId and menteeEmail are required'
    });
  }

  try {
    // Retrieve the mentee user record using email
    const menteeSnapshot = await db.collection('Users').where('email', '==', menteeEmail).get();
    if (menteeSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Mentee user not found'
      });
    }

    let mentee;
    menteeSnapshot.forEach(doc => {
      mentee = { uid: doc.id, ...doc.data() };
    });

    // Create a new mentorship session
    const sessionData = {
      mentorId,
      menteeId: mentee.uid,
      questions,
      menteeEmail,
      status: 'pending', // Default status is pending
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const sessionRef = await db.collection('MentorshipSessions').add(sessionData);
    const sessionId = sessionRef.id;

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        ...sessionData
      }
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
 * /sessions/{sessionId}/accept:
 *   put:
 *     summary: Accept a mentorship session
 *     description: Updates the status of a mentorship session to 'accepted'.
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
app.put('/sessions/:sessionId/accept', async (req, res) => {
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
    const sessionRef = db.collection('MentorshipSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship session not found'
      });
    }

    const sessionData = sessionDoc.data();

    if (sessionData.mentorId !== mentorId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this session'
      });
    }

    // Update the status of the session to 'accepted'
    await sessionRef.update({
      status: 'accepted',
      acceptedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedSessionDoc = await sessionRef.get();
    const updatedSessionData = updatedSessionDoc.data();

    res.status(200).json({
      success: true,
      message: 'Mentorship session accepted',
      data: {
        sessionId: sessionId,
        ...updatedSessionData,
      }
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
 * /sessions/{sessionId}/reject:
 *   put:
 *     summary: Reject a mentorship session
 *     description: Updates the status of a mentorship session to 'rejected'.
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

app.put('/sessions/:sessionId/reject', async (req, res) => {
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
    const sessionRef = db.collection('MentorshipSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship session not found'
      });
    }

    const sessionData = sessionDoc.data();

    if (sessionData.mentorId !== mentorId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this session'
      });
    }

    // Update the status of the session to 'rejected'
    await sessionRef.update({
      status: 'rejected',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedSessionDoc = await sessionRef.get();
    const updatedSessionData = updatedSessionDoc.data();

    res.status(200).json({
      success: true,
      message: 'Mentorship session rejected',
      data: {
        sessionId: sessionId,
        ...updatedSessionData,
      }
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
 * /sessions:
 *   get:
 *     summary: Fetch mentorship sessions
 *     description: Fetches mentorship sessions based on the user ID and role.
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
app.get('/sessions', async (req, res) => {
  const { userId, role } = req.query;

  if (!userId || !role) {
    return res.status(400).json({
      success: false,
      message: 'userId and role are required'
    });
  }

  try {
    let sessions = [];

    if (role === 'mentee') {
      // Fetch sessions created by the user as a mentee
      const menteeSessionsSnapshot = await db.collection('MentorshipSessions').where('menteeId', '==', userId).get();
      menteeSessionsSnapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
    } else if (role === 'mentor') {
      // Fetch sessions assigned to the user as a mentor
      const mentorSessionsSnapshot = await db.collection('MentorshipSessions').where('mentorId', '==', userId).get();
      mentorSessionsSnapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
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
 * /sessions/{sessionId}/review:
 *   post:
 *     summary: Review a mentorship session
 *     description: Review a mentorship session after the session is completed.
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

app.post('/sessions/:sessionId/review', async (req, res) => {
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
    const sessionRef = db.collection('MentorshipSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship session not found'
      });
    }

    const sessionData = sessionDoc.data();

    if (sessionData.menteeId !== menteeId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this session'
      });
    }

    // Add the review to the MentorshipSessions document
    await sessionRef.update({
      review: {
        rating,
        comments,
        reviewDate: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        sessionId,
        menteeId,
        rating,
        comments,
        reviewDate: new Date().toISOString() // Use server timestamp in production
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
 * /sessions/{sessionId}/review:
 *   delete:
 *     summary: Delete a mentorship session review
 *     description: Delete a review for a mentorship session.
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

// DELETE endpoint to remove a review
app.delete('/sessions/:sessionId/review', async (req, res) => {
  const { sessionId } = req.params;

  try {
      // Retrieve the mentorship session
      const sessionRef = db.collection('MentorshipSessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
          return res.status(404).json({
              success: false,
              message: 'Mentorship session not found'
          });
      }

      const sessionData = sessionDoc.data();

      if (!sessionData.review) {
          return res.status(404).json({
              success: false,
              message: 'No review found for this session'
          });
      }

      // Delete the review from the MentorshipSessions document
      await sessionRef.update({
          review: admin.firestore.FieldValue.delete()
      });

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

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Your application routes go here...
app.listen(process.env.PORT || 5000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  console.log(`Express server listening on port ${PORT}`);
  console.log(`Base URL is ${BASE_URL}`);
});


