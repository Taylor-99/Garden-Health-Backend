
// Dependencies
const express = require('express');
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const morgan = require('morgan')
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

userCtrl = require('./contollers/userController');
profileCtrl = require('./contollers/profileController');
dashCtrl = require('./contollers/dashboardController');
gardenCtrl = require('./contollers/gardenController');
plantCtrl = require('./contollers/plantLibraryController');
moodCtrl = require('./contollers/moodController');
activityCtrl = require('./contollers/activityController');
socialCtrl = require('./contollers/postController');

const PORT = process.env.PORT||4000;

const app = express();

const liveReloadServer = livereload.createServer();

liveReloadServer.server.once("connection", () => {
    // wait for nodemon to fully restart before refreshing the page
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

// Indicates where our static files are located
app.use(cookieParser());
app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
app.use(express.static('public'));
// Use the connect-livereload package to connect nodemon and livereload
app.use(connectLiveReload());
// Body parser: used for POST/PUT/PATCH routes: 
// this will take incoming strings from the body that are URL encoded and parse them 
// into an object that can be accessed in the request parameter as a property called body (req.body).
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('tiny')); // morgan is just a logger

app.use('/auth', userCtrl);
app.use('/profile', profileCtrl);
app.use('/dash', dashCtrl);
app.use('/garden', gardenCtrl);
app.use('/plantlibrary', plantCtrl);
app.use('/mood', moodCtrl);
app.use('/activity', activityCtrl);
app.use('/social', socialCtrl);

// App Listen
app.listen(PORT, ()=> {
    console.log(`Listening to port ${PORT}`);
  });  