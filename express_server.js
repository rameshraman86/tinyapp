const cookieParser = require('cookie-parser');
const express = require('express');
const { findUserByEmail, generateRandomString } = require("./helperFunctions");
const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.set('view engine', 'ejs');

const PORT = 8080;


//URL Database
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
//   "4facas": "http://www.reddit.com"
// };

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "4facas": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "https://www.reddit.com",
    userID: "aJ48lW",
  },
  
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
  user3RandomID: {
    id: "user3RandomID",
    email: "r@r.com",
    password: "test",
  },
};


/*
REGISTRATION
*/
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect('/urls');
  }

  res.render("register", { currentPage: 'register' });
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Email or Password cannot be empty');
  }

  if (findUserByEmail(req.body.email, users) === null) { //user does not exist already, create user profile
    const generatedRandomUserID = generateRandomString(6);
    users[generatedRandomUserID] = {
      id: generatedRandomUserID,
      email: req.body.email.toLowerCase(),
      password: req.body.password
    };
    res.cookie("user_id", generatedRandomUserID);
    return res.redirect("/urls");
  } else { //if user already exists, return 400
    return res.status(400).send('User already exists.');
  }
});

/*
USER LOGIN
*/
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }

  return res.render("login", { currentPage: 'login' });
});

app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Email or Password cannot be empty');
  }

  const user = findUserByEmail(req.body.email.toLowerCase(), users);

  if (user !== null && req.body.password === user.password) {
    res.cookie("user_id", user.id);
    return res.redirect("/urls");
  }

  if (user !== null && req.body.password !== user.password) {
    return res.status(403).send("Incorrect password.");
  }

  if (user === null) {
    return res.status(403).send('You have not registered yet. Please register before logging in');
  }


});

/*
HOMEPAGE - SEE ALL URLS
*/
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    return res.redirect("/login");
  }
  const templateVars = {
    userID: req.cookies["user_id"],
    user: users,
    urls: urlDatabase,
    currentPage: 'URLIndex'
  };
  res.render("urls_index", templateVars);
});

/*
ADD NEW URL
*/
app.get('/urls/new', (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    return res.redirect("/login");
  }

  const templateVars = {
    userID: req.cookies["user_id"],
    user: users,
    currentPage: 'AddNewURL'
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    return res.send('<html><body><h1>Lost your way?</h1><h3>You must be signed in to create tiny URL. Please register if you have not already and sign in to continue.</h3></body></html>');
  }
  else {
    const tinyURLID = generateRandomString(6);
    const incominglongURL = req.body.longURL;
    const userID = req.cookies["user_id"];
    urlDatabase[tinyURLID] = { longURL: incominglongURL, userID };

    res.redirect(`/urls/${tinyURLID}`);
  }
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
    longURL: urlDatabase[req.params.id].longURL,
    currentPage: 'URLDetails'
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURLUpdated;
  res.redirect("/urls");
});



/*
OPEN THE URL
*/
app.get("/u/:id", (req, res) => {
  const templateVars = {
    currentPage: 'URLPage'
  };
  if (!urlDatabase[req.params.id]) {
    // res.status(404).send(`${req.params.id} is not created yet. `);
    res.status(404).send(`<html><body><h1>ID does not exist.</h1><h3>The ID you entered <i>\"${req.params.id}\" </i>does not exist.</h3></body></html>`);
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});



/*
DELETE A TINY URL
*/
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});



/*
LOGOUT AND CLEAR COOKIES
*/
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app Listening to port: ${PORT}`);
});