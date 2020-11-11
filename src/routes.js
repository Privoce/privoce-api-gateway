const express = require("express");
const passport = require("passport");

const { papoProxy, watchPartyProxy } = require("./config/proxyServices");
const { signupValidator } = require("./app/http/validators/auth");
const {
  postSignUp,
  postSignIn,
  getVerifyEmail,
  postSignInGoogle,
  getMe,
} = require("./app/http/controllers/authController");

const authMiddleware = require("./app/http/middleware/jwtMiddleware");

const route = express.Router();

// auth and user register url
route.post("/auth/signup", signupValidator(), postSignUp);

route.post("/auth/signin", postSignIn);

route.get("/auth/verify-nickname", getVerifyEmail);

route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get("/auth/me", authMiddleware, getMe);

// Oauth user data comes to these redirectURLs
route.get("/googleRedirect", passport.authenticate("google"), postSignInGoogle);

//other services url
route.all("/papo", authMiddleware, (req, res, next) => {
  papoProxy(req, res, next);
});

route.all("/watch-party", (req, res, next) => {
  watchPartyProxy(req, res, next);
});

module.exports = route;
