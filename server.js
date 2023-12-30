import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from 'express-session';
import fastcsv from "fast-csv";
import { bookCollection } from './database.js';
import fs from "fs";
// import multer from 'multer';
import multer from "multer";
import csv from 'csv-parser';
const app = express();
const port = 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());



mongoose.connect('mongodb://127.0.0.1:27017/ruklibrary');
app.set('view engine', 'ejs'); 

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  res.status(500).send('Internal server error');
});

db.once('open', () => {
  console.log('Connected to the "ruklibrary" database');
});

app.get('/add', (req , res)=>{
  res.render('admin-portal.ejs');
})

// ================LogOut Portal=============================================

app.use(session({
  secret: 'shaikbhasidh2005',
  resave: false,
  saveUninitialized: true,
}));

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
    }
    res.render('index.ejs'); // Render the login page
  });
});

// ================LogOut Portal=============================================

// =============Student Login credintials Portal=================================

const studentSchema = new mongoose.Schema({
  username: String,
  password: String,
  passwordChanged: { type: Boolean, default: false }
});

const studentModel = mongoose.model('studentslogin', studentSchema);

const studentsDocumentsToInsert = [
  {
    username: '22RU1A0548',
    password: '01012005',
    
  },
];

// =================Section to insert students login data after entering in above array==========

// studentModel.insertMany(studentsDocumentsToInsert)
//   .then((result) => {
//     console.log('Data inserted successfully:', result);
//   })
//   .catch((error) => {
//     console.error('Error inserting data:', error);
//   });

// =================Section to insert students login data after entering in above array==========


// =============Admin Login credintials Portal=================================

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const adminModel = mongoose.model('adminlogin', adminSchema);

const adminDocumentsToInsert = [
  {
    username: 'ruklibrary2008',
    password: '01012000',
    
  },
];

// =================Section to insert admin login data after entering in above array==========

// adminModel.insertMany(adminDocumentsToInsert)
//   .then((result) => {
//     console.log('Data inserted to adminlogin successfully:', result);
//   })
//   .catch((error) => {
//     console.error('Error admin data inserting data:', error);
//   });

  // =================Section to insert admin login data after entering in above array==========


// =========================Pages Navigation=============================

app.get("/library-staff-details" , (req , res)=>{
  res.render("library-staff-details.ejs")
})

app.get("/bookrequest" , (req , res)=>{
  res.render("booksreq.ejs",{ studentRollNo: '' });
})

app.get("/" , (req , res)=>{
    res.render("index.ejs");
});

app.get("/studentLogin" , (req , res)=>{
    res.render("login/student-login.ejs", { errorMessage: '' })
});

// =========================Pages Navigation=============================

app.get("/student-change-pass" , (req , res)=>{
  res.render("login/student-pass-change.ejs" , {passChangeError : ''});
})

app.get("/adminLogin" , (req , res)=>{
    res.render("login/admin-login.ejs" , {errorMessage:''});
});

// ===========================================

app.post("/student-pass-change" , async(req , res)=>{
  const userEnteredUsername = req.body["passChangeUsername"];
  const userEnteredOldPassword= req.body["oldPassword"];
  const userEnteredNewPassword= req.body["newPassword"];
  console.log(userEnteredUsername);
  console.log(userEnteredOldPassword);
  console.log(userEnteredNewPassword);
  try{
    const passChangeUser = await studentModel.findOne({
      username: userEnteredUsername,
      password: userEnteredOldPassword,
      passwordChanged: false,
    });

    // console.log(passChangeUser);
    if (!passChangeUser) {
      return res.render('login/student-pass-change.ejs', { passChangeError: 'Password already changed or user not found. If you forgot your updated password contact admin.'});
    }
    
    await studentModel.updateOne({ username:userEnteredUsername }, { $set: { password: userEnteredNewPassword, passwordChanged: true } });

    res.render('login/student-pass-change.ejs', { passChangeError: 'Password changed successfully. , Login again'});

  }

  catch (error) {
   console.log(error)
  }


})




// ===========================================

// ======================Student Login Process===================================

app.post("/student" , async (req , res)=>{
    const userEnteredUsername = req.body["username"];
    const userEnteredPassword= req.body["password"];
    // console.log(userEnteredPassword);
    // console.log(userEnteredUsername);
    try {
        const user = await studentModel.findOne({ username: userEnteredUsername });
        // console.log('user:', user);
        if (user) {
            if (user.password === userEnteredPassword) {
              res.render('books-info.ejs' , {showAlert:false , alertMessege : ' ' });
            } else {
              res.render('login/student-login.ejs', { errorMessage: 'Wrong Password or Username' });
            }
          } else {
            res.render('login/student-login.ejs', { errorMessage: 'Wrong Password or Username' });
          }
      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
      }

 
})
// ======================Student Login Process===================================


// ======================Admin Login Process===================================


app.post("/adminlogin" , async (req , res)=>{
  const userEnteredUsername = req.body["username"];
  const userEnteredPassword= req.body["password"];
  console.log(userEnteredPassword);
  console.log(userEnteredUsername);
  try {
      const user = await adminModel.findOne({ username: userEnteredUsername });
      // console.log('user:', user);
      if (user) {
          if (user.password === userEnteredPassword) {
            req.session.logged_in = true;
            // const dynamicMessage = "dynamicData";
            res.render('admin-portal.ejs' ,  {showAlert:false , alertMessege : ' ' });
          } else {
            res.render('login/admin-login.ejs', { errorMessage: 'Wrong Password or Username' });
          }
        } else {
          res.render('login/admin-login.ejs', { errorMessage: 'Wrong Password or Username' });
        }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Internal server error');
    }
})



//======================Admin Login Process===================================

//=======================Retrieving New Books Data From Admin=================

const bookDataSchema = new mongoose.Schema({
  booktitle: String,
  authorname: String,
  publishers: String,
  programme: String,
});

// Create a model based on the schema
const BookData = mongoose.model('BooksData', bookDataSchema);


app.post('/submitbooks', async (req, res) => {
  const bookData = req.body;

  if (Array.isArray(bookData.booktitle)) {
    // If there are multiple rows submitted
    const bookDataToInsert = bookData.booktitle.map((_, i) => ({
      booktitle: bookData.booktitle[i],
      authorname: bookData.authorname[i],
      publishers: bookData.publishers[i],
      programme: bookData.programme[i],
    }));

    try {
      await BookData.insertMany(bookDataToInsert);

      const jsonFilePath = 'public/json/data.json';
      BookData.find({})
        .exec()
        .then((documents) => {
          // Update the JSON file with the new data
          fs.writeFileSync(jsonFilePath, JSON.stringify(documents, null, 2));
          const booksAddSuccess = 'Successfully Data Added';
          res.render('admin-portal.ejs', { showAlert: true , alertMessege : booksAddSuccess });

        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error retrieving data.');
        });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error storing data.');
    }
  } else {
    // If there's only one row submitted
    const bookDataToInsert = new BookData({
      booktitle: bookData.booktitle,
      authorname: bookData.authorname,
      publishers: bookData.publishers,
      programme: bookData.programme,
    });

    try {
      await bookDataToInsert.save();

      const jsonFilePath = 'public/json/data.json';

      BookData.find({})
        .exec()
        .then((documents) => {
          fs.writeFileSync(jsonFilePath, JSON.stringify(documents, null, 2));
          const booksAddSuccess = 'Successfully Data Added';
          res.render('admin-portal.ejs', { showAlert: true , alertMessege : booksAddSuccess });
          // res.send('Data submitted successfully.');
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error retrieving data.');
        });
      } catch (err) {
      console.error(err);
      res.status(500).send('Error storing data.');
    }
  }
});



// =======================Retrieving New Books Data From Admin=================

// =====================Books Request====================


app.get("/showbookreq" , (req , res)=>{
  if (req.session.logged_in) {
    res.render("bookreqshow.ejs" , {errorMessage:''});
    console.log('User is logged in');
  } else {
    console.log('User Not  logged in');
    res.render("login/admin-login.ejs" , {errorMessage:""})
  }
})


const booksReqSchema = new mongoose.Schema({
  bookName: String,
  studentName: String,
  studentProgramme: String,
  studentRoll: String,
});

const bookReqModel = mongoose.model('booksrequest', booksReqSchema);


// app.get("/bookrequest" , (req , res)=>{
//   if (req.session.student_logged_in) {
//     res.render("booksreq.ejs");
//   } else {
//     res.render("login/student-login.ejs");
//   }
// })

app.post("/submitbookreq" ,  async(req , res)=>{
  const bookName = req.body["bookName"];
  const studentName = req.body["studentName"];
  const studentProgramme = req.body["programme"];
  const studentRoll = req.body["studentRoll"];

  try {
    const user = await studentModel.findOne({ username: studentRoll });
    // console.log('user:', user);
    if (user) {

       const bookRequest = new bookReqModel({
        bookName: bookName,
        studentName: studentName,
        studentProgramme: studentProgramme,
        studentRoll: studentRoll,
      });

      // Save the book request to the database
      await bookRequest.save();

      // After inserting data into MongoDB, update the JSON file
      const jsonFilePath = 'public/json/reqbooks.json';

      // Retrieve the latest data from the MongoDB collection using Mongoose
      bookReqModel.find({})
        .exec()
        .then((documents) => {
          // Update the JSON file with the new data
          fs.writeFileSync(jsonFilePath, JSON.stringify(documents, null, 2));
          // res.send('Data submitted successfully.');
          const booksAddSuccess = 'Request Sent Successfully';
          res.render('books-info.ejs', { showAlert: true , alertMessege : booksAddSuccess });
          // res.send("Response Sent Successfully. Book request has been added.");
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error retrieving data.');
        });
      

      } else {
        res.render('booksreq.ejs', { errorRollMessage: 'Please Enter Valid Roll Number' });
      }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal server error');
  }
})

// =====================Books Request====================

// =================To See Book Request (Admin)=======

// ...

const storage = multer.memoryStorage(); // Use memory storage to hold the file temporarily
const upload = multer({ storage: storage });

// ...

app.post('/upload-csv', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const csvData = req.file.buffer.toString();
    const results = [];

    fastcsv.parseString(csvData, { headers: true })
      .on('data', (row) => results.push(row))
      .on('end', async () => {
        try {
          // Insert the CSV data into MongoDB using the promise-based `insertMany`
          await BookData.insertMany(results);
          const jsonFilePath = 'public/json/data.json';
      BookData.find({})
        .exec()
        .then((documents) => {
          // Update the JSON file with the new data
          fs.writeFileSync(jsonFilePath, JSON.stringify(documents, null, 2));
          // res.send('Data submitted successfully.');
          const booksAddSuccess = 'Successfully Data Added';
          res.render('admin-portal.ejs', { showAlert: true , alertMessege : booksAddSuccess });
        })

        } catch (err) {
          console.error(err);
          res.status(500).send('Error inserting data.');
        }
      });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading CSV data.');
  }
});




// =================To See Book Request (Admin)=======


app.listen(port , (req , res)=>{
    console.log(`Server Is Successfully Running On Port ${port}`);
});


