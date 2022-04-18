'use strict';

const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongo = require('mongodb').MongoClient
const passport = require('passport')
require('dotenv').config();

const auth = require('./routes/auth')
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))
app.use(helmet.noCache())


//For FCC testing purposes
fccTestingRoutes(app);


mongo.connect(process.env.DB, (err, db) => {
  db = db.db('library')

  if (err) {
    console.log('db err' + err)
  } else {
    console.log('success')

    auth(app, db)

    //Routing for API 
    apiRoutes(app, db);  

  }
})


module.exports = app;
