"use strict";

const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const request = require('request');
const bcrypt = require('bcrypt');
//const cookieParser = require('cookie-parser')

app.set('trust proxy', 1);
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'));
//app.use(cookieParser());

// app.use(function (req, res, next) {
//   req.sessionOptions.maxAge = req.session.maxAge || req.sessionOptions.maxAge
// })

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

var users = {};

function checkIfLoggedIn (req, res) {
  if (req.session.user_id === undefined) {
    res.render("home/index", { user_id: undefined });
  }
}

function checkForUrlData (req, res) {
  if (urlDatabase[req.session.user_id] === undefined) {
    res.render("home/index", { user_id: req.session.user_id });
  }
}

/*
*
*
*
*
------------------------ GETS ------------------------------
*/

// This is good, don't touch it.
app.get("/", (req, res) => {
  console.log("--> inside get(/)");
  checkIfLoggedIn(req, res);
  let templateVars = {
    user_id: req.session.user_id,
    urls: urlDatabase
  };
  res.render("home/index", templateVars);
});


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// This is good, don't touch it.
app.get("/urls", (req, res) => {
  console.log("--> inside get(/urls)");
  checkIfLoggedIn(req, res);
  let templateVars = {
    user_id: req.session.user_id,
    urls: urlDatabase[req.session.user_id]
  };
  res.render("urls/index", templateVars);
});

//This is good, don't touch it.
app.get("/urls/new", (req, res) => {
  console.log("--> inside get(/urls/new)");
  checkIfLoggedIn(req, res);
  let templateVars = { user_id: req.session.user_id };
  res.render("urls/new",templateVars);
});

//This is good, don't touch it.
app.get("/urls/:id", (req, res) => {
  console.log("--> inside get(/urls/:id)");
  checkIfLoggedIn(req, res);
  checkForUrlData(req, res);

  if (urlDatabase[req.session.user_id][req.params.id] !== undefined) {
    let templateVars = {
      user_id: req.session.user_id,
      shortURL: req.params.id,
      longURL: urlDatabase[req.session.user_id][req.params.id]
    };
    res.render("urls/show", templateVars);
  } else {
    let templateVars = {
      user_id: req.session.user_id,
      urls: urlDatabase[req.session.user_id]
    };
    res.render("urls/index", templateVars);
  }
});

// This is good. don't touch it.
app.get("/u/:shortURL", (req, res) => {
  console.log("--> inside get(/u/:shortURL)");
  checkIfLoggedIn(req, res);
  checkForUrlData(req, res);

  if (urlDatabase[req.session.user_id][req.params.shortURL] !== undefined) {
    let longURL = urlDatabase[req.session.user_id][req.params.shortURL];
    res.redirect(longURL);
  }
  else {
    let templateVars = {
      user_id: req.session.user_id,
      urls: urlDatabase[req.session.user_id]
    };
    res.render("urls/index", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
  };
  res.render("login/register", templateVars);
});


app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
  };
  res.render("login/login", templateVars);
});


// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b> </body> </html> \n");
// });


app.get("*", function(req, res){
  //res.send('what???', 404);
  res.render("home/index", { user_id: req.session.user_id });
});


/*
*
*
*
*
------------------------ POSTS ------------------------------
*/

app.post("/urls", (req, res) => {
  console.log("--> inside post(/urls)");
  let rndmStr = randomString(6);
  let tempUrl = req.body.longURL;
  checkNewUrlAndAdd(tempUrl, req.session.user_id, rndmStr, "/urls", res);
});


app.post("/urls/*/delete", (req,res) => {
  console.log("--> inside post(/urls/*/delete");
  delete urlDatabase[req.session.user_id][req.params['0']];
  res.redirect("/urls");
});


app.post("/urls/*/edit", (req,res) => {
  console.log("--> inside post(/urls/*/edit");
  checkNewUrlAndAdd(req.body.longURL, req.session.user_id, req.params['0'], "/urls", res);
});

app.post("/loginPage", (req, res) => {
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  console.log("--> inside post(/login)");
  console.log(req.body);
  res.statusCode = checkLoginCredentials(req.body.email, req.body.password);
  if (res.statusCode === 403) {
    res.send("invalid login credentials");
  } else {
    req.session.user_id = req.body.email;
    //res.cookie("user_id",req.body.email,{maxAge: 300000});
    res.redirect("/");
  }
});


// move to registr page - works
app.post("/registerPage", (req, res) => {
  res.redirect("/register");
});


//register works
app.post("/register", (req, res) => {
  console.log("--> inside post(/register)");
  let userID = randomString(10);


  res.statusCode = checkRegistrationInfo(req.body.email, req.body.password);
  if (res.statusCode['toString']()[0] === '4') {
    res.send("user name / password not accepted!");
  } else {
    const hashed_password = bcrypt.hashSync(req.body.password, 10);

    console.log(hashed_password);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashed_password
    };
    res.redirect("/");
  }
});


// logout works
app.post("/", (req, res) => {
  req.session.user_id = undefined;
  //res.clearCookie('user_id');
  res.redirect('/');
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// This is good. don't touch
function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


// This is good. Don't touch.
function checkNewUrlAndAdd (url, user, urlDataBaseKey, redirectUrl, res) {
  if (!url.includes("http://", 0) && !url.includes("https://")) {
    url = `http://${url}`;
  }
  request(url, (error, response, body) => {
    if (urlDatabase[user] === undefined) urlDatabase[user] = {};
    if (!error) {
      urlDatabase[user][urlDataBaseKey] = url;
      res.redirect(redirectUrl);
    } else {
      res.redirect(redirectUrl);
    }
  });
}


function checkRegistrationInfo (email, password) {
  let statusCode = 200;
  if (email === '' || password === '') statusCode = 400;
  else {
    for (var item in users) {
      if (users.hasOwnProperty(item)) {
        if (users[item].email === email) statusCode = 400;
      }
    }
  }
  return statusCode;
}

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