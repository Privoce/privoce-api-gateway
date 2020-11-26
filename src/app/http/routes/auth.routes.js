const express = require("express");
const passport = require("passport");

const {
  postSignIn,
  postSignInGoogle,
} = require("../controllers/authController");

/***********************************************
// Auth routes go here, including social auth
//
***********************************************/
const route = express.Router();

route.post("/auth/signin", postSignIn);
route.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  })
);
route.get("/googleRedirect", passport.authenticate("google"), postSignInGoogle);

module.exports = route;
