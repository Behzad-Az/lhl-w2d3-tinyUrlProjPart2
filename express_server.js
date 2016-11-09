"use strict";

const express = require('express');
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
//app.use(app.router);


// app.use(function(req, res, next){
//   res.status(404);

//   // respond with html page
//   if (req.accepts('html')) {
//     res.render('404', { url: req.url });
//     return;
//   }

//   // respond with json
//   if (req.accepts('json')) {
//     res.send({ error: 'Not found' });
//     return;
//   }

//   // default to plain-text. send()
//   res.type('txt').send('Not found');
// });




var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}



app.get("/", (req, res) => {
  //res.end("Hello");
  //res.send("index");
  res.render("home/index");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


// app.get("/urls", (req, res) => {
//   let templateVars = { urls: urlDatabase }
//   res.render("urls_index", templateVars);
// });

// app.get("/urls/new", (req, res) => {
//   res.render("urls_new");

// });

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
//   console.log(urlDatabase[req.params.id]);
//   res.render("urls_show", templateVars);
// });

// app.get("/test", (req, res) => {
//   res.render("urls");
// });

// app.post("/urls", (req, res) => {
//   //res.send("Ok");         // Respond with 'Ok' (we will replace this)
//   let rndmStr = randomString(6);
//   let tempUrl = req.body.longURL;
//   if (!tempUrl.includes("http://",0) && !tempUrl.includes("https://")) {
//     tempUrl = `http://${tempUrl}`;
//   }
//   urlDatabase[rndmStr] = tempUrl;
//   res.redirect("/urls/new?success=true");
// });

// app.get("/u/:shortURL", (req, res) => {
//   if (urlDatabase[req.params.shortURL] !== undefined) {
//     let longURL = urlDatabase[req.params.shortURL];
//     res.redirect(longURL);
//   }
//   else res.redirect('/urls');
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b> </body> </html> \n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("*", function(req, res){
//   res.send('what???', 404);
// });

function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// function generateRandomString() {
//   //rndmStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
//   var length = 6;
//   //var rndmStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
//   var rndmStr = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
//   console.log(rndmStr);
//   return rndmStr;
// }