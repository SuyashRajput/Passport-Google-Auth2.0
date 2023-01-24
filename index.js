if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const passport = require("passport");
require("./GoogleOAuth2.0")(passport);
const session = require("express-session");
const { isLoggedIn, alreadyLoggedIn } = require("./middleware");
const User = require("./models/User");

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const MongoStore = require("connect-mongo");
const dbUrl = `mongodb+srv://${process.env.MONGO_key}.mongodb.net/GoogleOAuth2?retryWrites=true&w=majority`;
mongoose.connect(dbUrl, () => {
  console.log("Database Connected");
});
const store = new MongoStore({
  mongoUrl: dbUrl,
  secret: process.env.Store_secret,
  touchAfter: 24 * 3600,
});
store.on("error", (e) => {
  console.log("Session Store Error", e);
});
const sessionConfig = {
  store,
  secret: process.env.Session_secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.get("/", (req, res) => {
  res.send("Welcome Home ( Go to /auth/google to Login )");
});

app.get("/failed", alreadyLoggedIn, (req, res) => {
  res.send("Login Failed try again by going to /auth/google");
});

app.get("/protected", isLoggedIn, (req, res) => {
  res.send("You are authenticated :) ( Go to /logout to logout )");
});

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get(
  "/auth/google",
  alreadyLoggedIn,
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/protected");
  }
);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
