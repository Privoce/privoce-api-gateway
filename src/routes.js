const express = require("express");

const { papoProxy, watchPartyProxy } = require("./config/proxyServices");
const { signupValidator } = require("./app/http/validators/auth");
const {
  postSignUp,
  postSignIn,
  getVerifyNickname,
} = require("./app/http/controllers/authController");

const route = express.Router();

// auth and user register url
route.post("/auth/signup", signupValidator(), postSignUp);
route.post("/auth/signin", postSignIn);
route.get("/auth/verify-nickname", getVerifyNickname);

//other services url
route.all("/papo", (req, res, next) => {
  papoProxy(req, res, next);
});

route.all("/watch-party", (req, res, next) => {
  watchPartyProxy(req, res, next);
});

module.exports = route;
