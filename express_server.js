const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = 8080;
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const { findUserByEmail } = require("./helperFunctions");

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

//URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "4facas": "http://www.reddit.com"
};
//Users Database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


/*
REGISTRATION
*/
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Email or Password cannot be empty');
  }

  if (findUserByEmail(req.body.email, users) === null) { //user does not exist already, create user profile
    const generatedRandomUserID = generateRandomString();
    users[generatedRandomUserID] = {
      id: generatedRandomUserID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", generatedRandomUserID);
    return res.redirect("/urls");
  } else { //if user already exists, return 400
    return res.status(400).send('User already exists.');
  }
});

/*
HOMEPAGE - SEE ALL URLS
*/
// app.get('/', (req, res) => {
//   res.redirect('/urls');
// });

app.get('/urls', (req, res) => {
  const templateVars = {
    userID: req.cookies["user_id"],
    user: users,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});



/*
ADD NEW URL
*/
app.get('/urls/new', (req, res) => {
  const templateVars = {
    userID: req.cookies["user_id"],
    user: users
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const URLCode = generateRandomString();
  urlDatabase[URLCode] = req.body.longURL;
  res.redirect(`/urls/${URLCode}`);
});



/*
VIEW DETAILS AND EDIT URL
*/
//page that opens the details page of a tinyURL.
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    userID: req.cookies["user_id"],
    user: users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURLUpdated;
  res.redirect("/urls");
});



/*
OPEN THE URL
*/
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send(`${req.params.id} is not created yet. `);
    return;
  }
  const longURL = urlDatabase[req.params.id];
  console.log(typeof (longURL));
  res.redirect(longURL);
});



/*
DELETE A TINY URL
*/
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//Login POST: should set a cookie named username to the value submitted in the request body via the login form. After our server has set the cookie it should redirect the browser back to the /urls page.
// app.post("/login", (req, res) => {
//   res.cookie("user_id", req.body.email);
//   res.redirect("/urls");
// });

/*
LOGOUT AND CLEAR COOKIES
*/
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/register");
});


app.listen(PORT, () => {
  console.log(`Example app Listening to port: ${PORT}`);
});