"use strict";

const express = require('express');
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var urlExists = require('url-exists');
const request = require('request');
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

var users = {};


/*
*
*
*
*
------------------------ GETS ------------------------------
*/

app.get("/", (req, res) => {
  console.log("--> inside get(/)");
  let templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("home/index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  console.log("--> inside get(/urls)");
  let templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("urls/index", templateVars);
});


app.get("/urls/new", (req, res) => {
  console.log("--> inside get(/urls/new)");
  let templateVars = { user_id: req.cookies["user_id"] };
  res.render("urls/new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log("--> inside get(/urls/:id)");
  if (urlDatabase[req.params.id] !== undefined) {
    let templateVars = {
      user_id: req.cookies["user_id"],
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]
    };
    res.render("urls/show", templateVars);
  } else {
    let templateVars = {
      user_id: req.cookies["user_id"],
      urls: urlDatabase
    };
    res.render("urls/index", templateVars);
  }
});


app.get("/u/:shortURL", (req, res) => {
  console.log("--> inside get(/u/:shortURL)");
  if (urlDatabase[req.params.shortURL] !== undefined) {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  }
  else {
    let templateVars = {
      user_id: req.cookies["user_id"],
      urls: urlDatabase
    };
    res.render("urls/index", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("login/register", templateVars);
});


app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("login/login", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b> </body> </html> \n");
});


app.get("*", function(req, res){
  res.send('what???', 404);
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
  checkNewUrlAndAdd(tempUrl, rndmStr, "/urls", res);
});



app.post("/urls/*/delete", (req,res) => {
  console.log("--> inside post(/urls/*/delete");
  delete urlDatabase[req.params['0']];
  res.redirect("/urls");
});


app.post("/urls/*/edit", (req,res) => {
  console.log("--> inside post(/urls/*/edit");
  checkNewUrlAndAdd(req.body.longURL, req.params['0'], "/urls", res);
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
    res.cookie("user_id",req.body.email,{maxAge: 300000});
    res.redirect("/");
  }
});

app.post("/registerPage", (req, res) => {
  res.redirect("/register");
});

app.post("/register", (req, res) => {
  console.log("--> inside post(/register)");
  let userID = randomString(10);
  res.statusCode = checkRegistrationInfo(req.body.email, req.body.password);
  if (res.statusCode['toString']()[0] === '4') {
    res.send("user name / password not accepted!");
    //res.redirect("/register")
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.redirect("/");
  }
});


app.post("/", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function checkNewUrlAndAdd (url, urlDataBaseKey, redirectUrl, res) {
  if (!url.includes("http://", 0) && !url.includes("https://")) {
    url = `http://${url}`;
  }
  // urlExists(url, (err, exists) => {
  //   if (exists) {
  //     urlDatabase[urlDataBaseKey] = url;
  //     res.redirect(redirectUrl);
  //   } else {
  //     res.redirect(redirectUrl);
  //   }
  // });
  request(url, (error, response, body) => {
    if (!error) {
      urlDatabase[urlDataBaseKey] = url;
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
      if (users[item].email === email && users[item].password === password) {
        statusCode = 200;
      }
    }
  }
  return statusCode;
}
