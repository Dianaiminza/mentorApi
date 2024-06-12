const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
var admin = require('firebase-admin');
var serviceAccount = require("./secret/config.json");
var multer = require('multer');
var path = require('path');
const saltedMd5=require('salted-md5')
const bcrypt = require('bcrypt');
var { getToken, isAuth } =require('./util');
app.use(cors());
const upload=multer({storage: multer.memoryStorage()})

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

app.post('/createMentor', async (req, res) => {
  const { email,firstName,lastName, password,address,bio,expertise,occupation } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  try {
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
 

app.post('/signup', async (req, res) => {
  const { email,firstName,lastName, password,address,bio,expertise,occupation } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
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

app.delete('/user/delete/:id', async (req, res) => {
 var postsRef = db.collection('Users');
 var query = postsRef.where('userId', '==', req.params.id).get()
     .then(snapshot => {
       snapshot.forEach(doc => {
         console.log(doc.id, '=>', doc.data());
         var deleteDoc = db.collection('Users').doc(doc.id).delete();
       });
     })
     res.json({
       success:true,
       message:"user successfully deleted"
     })
     .catch(err => {
       console.log('Error getting users', err);
     });
});

app.delete('/mentor/delete/:id', async (req, res) => {
  var postsRef = db.collection('Mentors');
  var query = postsRef.where('mentorId', '==', req.params.id).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          var deleteDoc = db.collection('Mentors').doc(doc.id).delete();
        });
      })
      res.json({
        success:true,
        message:"mentor successfully deleted"
      })
      .catch(err => {
        console.log('Error getting mentors', err);
      });
 });

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

app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
  