"use strict";

const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.PORT || 8080;
const request = require('request');
const bcrypt = require('bcrypt');

app.set('trust proxy', 1);
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'));

// Server does not respond when I used this... Ask mentor why??
// app.use(function (req, res, next) {
//   req.sessionOptions.maxAge = req.session.maxAge || req.sessionOptions.maxAge
// })

// cookie parser was replaced session cookies.
// const cookieParser = require('cookie-parser')
// app.use(cookieParser());

// declare global variables used in this code.
// urlDatabase object contains short and long url data for a given user.
// users object contains the user credentials.
let urlDatabase = {};
let users = {};

// -------------------- Global Functions ----------------------
// fcn renders home page if user has not logged in.
function checkIfLoggedIn (req, res) {
  if (req.session.userID === undefined) {
    res.render("home/index", { userID: undefined });
  }
}

// fcn renders home page if user has no urls saved yet.
function checkForUrlData (req, res) {
  if (urlDatabase[req.session.userID] === undefined) {
    res.render("home/index", { userID: req.session.userID });
  }
}

// fcn checks for valid http/https url when adding or editting a url
function checkNewUrlAndAdd (url, user, urlDataBaseKey, redirectUrl, res) {
  let tempUrl = url;
  if (!tempUrl.includes("http://", 0) && !tempUrl.includes("https://")) {
    tempUrl = `http://${tempUrl}`;
  }
  request(tempUrl, (error, response, body) => {
    if (urlDatabase[user] === undefined) { urlDatabase[user] = {}; }
    if (!error) { urlDatabase[user][urlDataBaseKey] = tempUrl; }
    res.redirect(redirectUrl);
  });
}

// fcn checks for valid and available email / password during registration.
function checkRegistrationInfo (email, password) {
  let statusCode = 200;
  if (email === '' || password === '') {
    statusCode = 400;
  } else {
    for (var item in users) {
      if (users.hasOwnProperty(item)) {
        if (users[item].email === email) { statusCode = 400; }
      }
    }
  }
  return statusCode;
}

// fcn checks for valid user credentials during login.
function checkLoginCredentials(email, password) {
  let statusCode = 403;
  for (var item in users) {
    if (users.hasOwnProperty(item)) {
      if (users[item].email === email &&
          bcrypt.compareSync(password, users[item].password)) {
        statusCode = 200;
      }
    }
  }
  return statusCode;
}

// Returns a random string of length given in the argument from a selection of chars.
function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}


//------------------------ GETS ------------------------------
// go to home page when root url is entered.
app.get("/", (req, res) => {
  console.log("--> inside get(/)");
  checkIfLoggedIn(req, res);
  res.render("home/index", { userID: req.session.userID });
});

// if logged in, go to urls/index (list of urls) when /urls is entered
app.get("/urls", (req, res) => {
  console.log("--> inside get(/urls)");
  checkIfLoggedIn(req, res);
  let templateVars = {
    userID: req.session.userID,
    urls: urlDatabase[req.session.userID]
  };
  res.render("urls/index", templateVars);
});

// if logged in, go to urls/new (new url) when /urls/new is entered.
app.get("/urls/new", (req, res) => {
  console.log("--> inside get(/urls/new)");
  checkIfLoggedIn(req, res);
  res.render("urls/new", { userID: req.session.userID });
});

// if logged in, go to urls/:id (specific short url view / edit).
app.get("/urls/:id", (req, res) => {
  console.log("--> inside get(/urls/:id)");
  checkIfLoggedIn(req, res);
  checkForUrlData(req, res);
  if (urlDatabase[req.session.userID][req.params.id] !== undefined) {
    let templateVars = {
      userID: req.session.userID,
      shortURL: req.params.id,
      longURL: urlDatabase[req.session.userID][req.params.id]
    };
    res.render("urls/show", templateVars);
  } else {
    let templateVars = {
      userID: req.session.userID,
      urls: urlDatabase[req.session.userID]
    };
    res.render("urls/index", templateVars);
  }
});

// if logged in, go to specific webpage corresponding to short url.
app.get("/u/:shortURL", (req, res) => {
  console.log("--> inside get(/u/:shortURL)");
  checkIfLoggedIn(req, res);
  checkForUrlData(req, res);

  if (urlDatabase[req.session.userID][req.params.shortURL] !== undefined) {
    let longURL = urlDatabase[req.session.userID][req.params.shortURL];
    res.redirect(longURL);
  } else {
    let templateVars = {
      userID: req.session.userID,
      urls: urlDatabase[req.session.userID]
    };
    res.render("urls/index", templateVars);
  }
});

// go to register page.
app.get("/register", (req, res) => {
  res.render("login/register", { userID: req.session.userID });
});

// go to login page.
app.get("/login", (req, res) => {
  res.render("login/login", { userID: req.session.userID });
});

// go to home page for all other misc urls
app.get("*", (req, res) => {
  res.render("home/index", { userID: req.session.userID });
});


// ------------------------ POSTS ------------------------------
// post a new url for the user.
app.post("/urls", (req, res) => {
  console.log("--> inside post(/urls)");
  let rndmStr = randomString(6);
  let tempUrl = req.body.longURL;
  checkNewUrlAndAdd(tempUrl, req.session.userID, rndmStr, "/urls", res);
});

// delete a specific url by the user.
app.post("/urls/*/delete", (req, res) => {
  console.log("--> inside post(/urls/*/delete");
  delete urlDatabase[req.session.userID][req.params['0']];
  res.redirect("/urls");
});

// edit a specific url by the user.
app.post("/urls/*/edit", (req, res) => {
  console.log("--> inside post(/urls/*/edit");
  checkNewUrlAndAdd(req.body.longURL, req.session.userID, req.params['0'], "/urls", res);
});

// redirect to login page when button is clicked.
app.post("/loginPage", (req, res) => {
  res.redirect("/login");
});

// login the user
app.post("/login", (req, res) => {
  console.log("--> inside post(/login)");
  res.statusCode = checkLoginCredentials(req.body.email, req.body.password);
  if (res.statusCode === 403) {
    res.send("invalid login credentials");
  } else {
    req.session.userID = req.body.email;
    //res.cookie("userID",req.body.email,{maxAge: 300000});
    res.redirect("/");
  }
});

// redirect to register page when button is clicked.
app.post("/registerPage", (req, res) => {
  res.redirect("/register");
});

// register new user.
app.post("/register", (req, res) => {
  console.log("--> inside post(/register)");
  let userID = randomString(10);
  res.statusCode = checkRegistrationInfo(req.body.email, req.body.password);
  if (res.statusCode['toString']()[0] === '4') {
    res.send("user name / password not accepted!");
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    console.log(hashedPassword);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    res.redirect("/");
  }
});

// logout current user.
app.post("/", (req, res) => {
  req.session.userID = undefined;
  //res.clearCookie('userID');
  res.redirect('/');
});

// listen on port.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});