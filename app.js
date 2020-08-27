const express = require("express");
const session = require("express-session");
const bodyParser = require('body-parser');
const path = require("path");
const router = require("./routes/router");
const config = require("./config.json");

const port = process.env.PORT || config.port;

const app = express();

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use("/public", express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.listen(port, () => console.log(`- Active on port ${port} -`));

router(app);