const express = require("express");
const passport = require("passport");

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

route.post("/auth/signup", signupValidator(), postSignUp);

route.post("/auth/signin", postSignIn);

route.get("/auth/verify-email", getVerifyEmail);

route.get("/auth/me", authMiddleware, getMe);

route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Oauth user data comes to these redirectURLs
route.get("/googleRedirect", passport.authenticate("google"), postSignInGoogle);

module.exports = route;
