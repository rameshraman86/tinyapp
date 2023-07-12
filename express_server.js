const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = 8080;
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set('view engine', 'ejs');

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "4facas": "http://www.reddit.com"
};

//homepage. Redirects to the /urls to show all urls of logged in user.
app.get('/', (req, res) => {
  res.redirect('/urls');
});

//send the urldatabase to url_index.ejs file and then render it in the browser in /urls endpoint.
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//page to add new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//page that opens the details page of a tinyURL.
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//Will get the actual url when passed the tinyURL ID.
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send(`${req.params.id} is not created yet. `);
    return;
  }
  const longURL = urlDatabase[req.params.id];
  console.log(typeof(longURL));
  res.redirect(longURL);
});


//Add a new tinyURL
app.post("/urls", (req, res) => {
  const URLCode = generateRandomString();
  urlDatabase[URLCode] = req.body.longURL;
  res.redirect(`/urls/${URLCode}`);
});

//Delete a TinyURL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//Update a tinyURL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURLUpdated;
  res.redirect("/urls");
});


//Login POST: should set a cookie named username to the value submitted in the request body via the login form. After our server has set the cookie it should redirect the browser back to the /urls page.
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//Logout and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app Listening to port: ${PORT}`);
});