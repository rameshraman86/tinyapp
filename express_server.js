const express = require('express');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieSession = require('cookie-session');

const { getUserByEmail, generateRandomString, urlsOfUser } = require('./helperFunctions');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  secret: 'xyZAbC',
  maxAge: 24 * 60 * 60 * 1000,
})
);

app.set('view engine', 'ejs');

const PORT = 8080;

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "4facas": {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "https://www.reddit.com",
    userID: "user2RandomID",
  },
  "203raw": {
    longURL: "https://www.mug.com",
    userID: "user3RandomID",
  },
  "hgk5g": {
    longURL: "https://www.sweet.com",
    userID: "user3RandomID",
  },
};

//Users Database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$.f2m2OwlcFBe1lxI.lMOMO5Wem9crv74pZoc.TuNIWNPHI80Ce6yu"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$oOMCCuMlb/ZcbMBiIC0CbuAW8ByZCt0RKEgrmJcxqgR.JEomWjw/2",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "r@r.com",
    password: "$2a$10$iYluqKNueyZZAMeWBxK2fe0y3.hyM3kNwybVKjgEHUAdHJLTadeem",
  },
};


/*
REGISTRATION
*/
app.get('/register', (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    return res.redirect('/urls');
  }
  res.render('register', { currentPage: 'register' });
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);

  if (email === '' || password === '') {
    return res.status(400).send('Email or Password cannot be empty');
  }

  if (getUserByEmail(email, users) === null) {
    const generatedRandomUserID = generateRandomString(6);
    users[generatedRandomUserID] = {
      id: generatedRandomUserID,
      email: email.toLowerCase(),
      password: password,
    };
    req.session.user_id = generatedRandomUserID;
    return res.redirect('/urls');
  }

  return res.status(400).send('User already exists.');
});

/*
USER LOGIN
*/
app.get('/login', (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    return res.redirect('/urls');
  }
  return res.render('login', { currentPage: 'login' });
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const userEnteredPassword = req.body.password;

  if (email === '' || userEnteredPassword === '') {
    return res.status(400).send('Email or Password cannot be empty');
  }

  const userRecordInDatabase = getUserByEmail(email.toLowerCase(), users);

  if (
    userRecordInDatabase !== null &&
    bcrypt.compareSync(userEnteredPassword, userRecordInDatabase.password)
  ) {
    req.session.user_id = userRecordInDatabase.id;
    return res.redirect('/urls');
  }

  return res.status(403).send('Login Failed. Incorrect Username or Password.');
});

/*
HOMEPAGE - SEE ALL URLS
*/
app.get('/', (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect('/urls');
  }
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;

  if (userID === undefined) {
    return res.send(
      '<html><h1>Lost your way?</h1><h3>You must be signed in to view your URLs. Please register if you have not already and sign in to continue.</h3><a href ="/login">Back to login page</a></body></html>'
    );
  }

  const templateVars = {
    userID: userID,
    user: users,
    urls: urlsOfUser(userID, urlDatabase),
    currentPage: 'URLIndex',
  };

  res.render('urls_index', templateVars);
});

/*
ADD NEW URL
*/
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;

  if (userID === undefined) {
    return res.send(
      '<html><body><h1>Lost your way?</h1><h3>You must be signed in to create tiny URL. Please register if you have not already and sign in to continue.</h3> <a href ="/login">Back to login page</a</body></html>'
    );
  }

  const templateVars = {
    userID: userID,
    user: users,
    currentPage: 'AddNewURL',
  };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const userID = req.session.user_id;

  if (userID === undefined) {
    return res.send(
      '<html><body><h1>Lost your way?</h1><h3>You must be signed in to create tiny URL. Please register if you have not already and sign in to continue.</h3></body></html>'
    );
  } else {
    const tinyURLID = generateRandomString(6);
    const incominglongURL = req.body.longURL;
    urlDatabase[tinyURLID] = { longURL: incominglongURL, userID };

    res.redirect(`/urls/${tinyURLID}`);
  }
});

/*
VIEW DETAILS AND EDIT URL
*/
app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {
    return res.send(
      '<html><h1>Lost your way?</h1><h3>You must be signed in to view URL details. <a href ="/login">Back to login page</a></body></html>'
    );
  }

  if (!urlDatabase[urlID]) {
    return res.status(400).send(
      `<html><h3>The TinyURL you entered does not exist.</h3><a href ="/login">Back to login page</a></body></html>'`
    );
  }

  if (urlDatabase[urlID].userID !== userID) {
    return res.send(
      '<html><h1>Invalid Request</h1><h3>You do not have access to the TinyURL details.</h3></body></html>'
    );
  }

  const templateVars = {
    userID: userID,
    user: users,
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    currentPage: 'URLDetails',
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {
    return res.send('Error. You must be signed in to view or edit URL details.');
  }

  if (!urlDatabase[urlID]) {
    return res.status(400).send(`The requested TinyURL does not exist.`);
  }

  if (urlDatabase[urlID].userID !== userID) {
    return res.send('Invalid Request. You do not have access to the TinyURL details.');
  }

  urlDatabase[urlID].longURL = req.body.longURLUpdated;
  res.redirect('/urls');
});

/*
OPEN THE full URL using tinyURL
*/
app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send(
      `<html><body><h1>ID does not exist.</h1><h3>The ID you entered <i>"${req.params.id}" </i>does not exist.</h3></body></html>`
    );
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

/*
DELETE A TINY URL
*/
app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  const urlObj = urlDatabase[req.params.id];

  if (!userID) {
    return res.status(400).send('You must be signed in to delete URL.');
  }

  if (!urlObj) {
    return res.status(400).send('The requested ID does not exist.');
  }

  if (urlObj.userID !== userID) {
    return res.send('Invalid Request. You do not have access to this TinyURL.');
  }

  delete urlDatabase[req.params.id];
  return res.redirect('/urls');
});

/*
LOGOUT AND CLEAR COOKIES
*/
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app Listening to port: ${PORT}`);
});
