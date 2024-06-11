
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
var admin = require('firebase-admin');
var serviceAccount = require("./secret/config.json");
var multer = require('multer');
var path = require('path');
const saltedMd5=require('salted-md5')
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


app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    try {

        const userRecord = await userService.addUser({
            email,
            password,
    });
          const userRef = admin.firestore().collection("Users").doc(userRecord.uid);
          await userRef.set({
            email: userRecord.email,
            password: userRecord.password,
            token: getToken(userRecord)
          });
      
          res.status(201).json({
            uid: userRecord.uid,
            email: userRecord.email,
          });
    } catch (err) {
      res.json({
        success:false,
        message:"Error creating user"
       });
    }
  });
  
  app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await userService.authenticate(email, password);
      res.json(user);
    } catch (err) {
      res.status(404).json({ 
        success:false,
        message:"no user found"
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
      var updateUser = db.collection('User').doc(doc.id).update({
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

app.delete('/user/delete/:id', async (req, res) => {
 var postsRef = db.collection('Users');
 var query = postsRef.where('userId', '==', req.params.id).get()
     .then(snapshot => {
       snapshot.forEach(doc => {
         console.log(doc.id, '=>', doc.data());
         var deleteDoc = db.collection('User').doc(doc.id).delete();
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
app.post("/users", cors(),async (req,res)=>{
 var title     = req.body.title;
 var description = req.body.description;
 var url   = req.body.url;
 var blogid = req.body.blogid;
  var blogimg=req.body.blogimg; 
   var blog = {
       title: title,
       description: description,
       blogid: blogid,
       url: url,
       blogimg:blogimg
     };
     res.json({
       blog
     }) 
       await storeBlog(blog);
       return blog
})

app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
  