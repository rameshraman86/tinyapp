const express = require('express');
const app = express();
const PORT = 8080;
app.use(express.urlencoded({ extended: true }));

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

//GET METHODS
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//send the urldatabase to url_index.ejs file and then render it in the browser in /urls endpoint.
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//open the url when passed the ID
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send(`${req.params.id} is not created yet. `);
    return;
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Create a new tiny url
app.post("/urls", (req, res) => {
  const URLCode = generateRandomString();
  urlDatabase[URLCode] = req.body.longURL;
  res.redirect(`/urls/${URLCode}`);
});

//DELETE A TINYURL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//UPDATE a long url name
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURLUpdated;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app Listening to port: ${PORT}`);
});