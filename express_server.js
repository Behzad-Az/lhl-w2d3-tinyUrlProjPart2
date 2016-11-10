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


/*
*
*
*
*
------------------------ GETS ------------------------------
*/

app.get("/", (req, res) => {
  console.log("--> inside get(/)");
  res.render("home/index");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  console.log("--> inside get(/urls)");
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls/index", templateVars);
});


app.get("/urls/new", (req, res) => {
  console.log("--> inside get(/urls/new)");
  let templateVars = { username: req.cookies["username"] };
  res.render("urls/new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log("--> inside get(/urls/:id)");
  if (urlDatabase[req.params.id] !== undefined) {
    let templateVars = {
      username: req.cookies["username"],
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]
    };
    res.render("urls/show", templateVars);
  } else {
    let templateVars = {
      username: req.cookies["username"],
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
      username: req.cookies["username"],
      urls: urlDatabase
    };
    res.render("urls/index", templateVars);
  }
});

// app.get("/register", (req, res) => {
//   res.
// });


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


app.post("/login", (req, res) => {
  console.log("--> inside post(/login)");
  console.log(req.body.username);
  res.cookie("username",req.body.username,{maxAge: 300000});
  console.log(req.cookies);
  res.redirect("/");
});

app.post("/", (req, res) => {
  res.clearCookie('username');
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

