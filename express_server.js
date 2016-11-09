"use strict";

const express = require('express');
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var urlExists = require('url-exists');


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
  console.log("--> inside get(/)");
  res.render("home/index");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


app.get("/urls", (req, res) => {
  console.log("--> inside get(/urls)");
  let templateVars = { urls: urlDatabase, statusMessage: "" }
  res.render("urls/index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log("--> inside get(/urls/new)");
  res.render("urls/new");

});

app.get("/urls/:id", (req, res) => {
  console.log("--> inside get(/urls/:id)");
  if (urlDatabase[req.params.id] !== undefined) {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls/show", templateVars);
  } else {
    let templateVars = { urls: urlDatabase, msg: "No matching short URL found.", statusMessage: ""};
    res.render("urls/index", templateVars);
  }
});

// app.get("/test", (req, res) => {
//   res.render("urls");
// });

app.post("/urls", (req, res) => {
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  console.log("--> inside post(/urls)");
  let rndmStr = randomString(6);
  let tempUrl = req.body.longURL;
  let statusMessage = "";
  // if (!tempUrl.includes("http://",0) && !tempUrl.includes("https://")) {
  //   tempUrl = `http://${tempUrl}`;
  // }

  // urlExists(tempUrl, (err, exists) => {
  //   statusMessage = exists ? "Short url added, page exists." : "Short url added, page does not exist.";
  //   urlDatabase[rndmStr] = tempUrl;
  //   res.redirect(`/urls?${statusMessage}`);
  // });
  checkNewUrlAndAdd(tempUrl,rndmStr,"/urls",res);
});


app.post("/urls/*/delete", (req,res) => {
  console.log("--> inside post(/urls/*/delete");
  delete urlDatabase[req.params['0']];
  res.redirect("/urls");
});

app.post("/urls/*/edit", (req,res) => {
  console.log("--> inside post(/urls/*/edit");
  // urlDatabase[req.params['0']] = req.body.longURL;
  // res.redirect("/urls");

  checkNewUrlAndAdd(req.body.longURL,req.params['0'],"/urls",res);
});



app.get("/u/:shortURL", (req, res) => {
  console.log("--> inside get(/u/:shortURL)");
  if (urlDatabase[req.params.shortURL] !== undefined) {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  }
  else res.redirect('/urls/index');
});

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b> </body> </html> \n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("*", function(req, res){
  res.send('what???', 404);
});

function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


function checkNewUrlAndAdd (url, urlDataBaseKey, redirectUrl, res) {
  if (!url.includes("http://",0) && !url.includes("https://")) {
    url = `http://${url}`;
  }

  urlExists(url, (err, exists) => {
    // statusMessage = exists ? "Short url added, page exists." : "Short url added, page does not exist.";
    if (exists) {
      urlDatabase[urlDataBaseKey] = url;
      //res.redirect(`/urls?${statusMessage}`);
      res.redirect(redirectUrl);
    } else res.redirect(redirectUrl);

  });
}


// function generateRandomString() {
//   //rndmStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
//   var length = 6;
//   //var rndmStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
//   var rndmStr = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
//   console.log(rndmStr);
//   return rndmStr;
// }