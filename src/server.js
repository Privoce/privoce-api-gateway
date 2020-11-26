require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const routes = require("./app/http/routes");
const mongooseService = require("./app/services/mongoose");
const { findOneUser } = require("./app/repositories/user");
const corsOptions = require("./config/cors");

const app = express();
const port = process.env.PORT;

app.use(compression());
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(
        "GOOGLE BASED OAUTH VALIDATION GETTING CALLED",
        accessToken,
        refreshToken
      );
      return done(null, {
        ...profile,
        googleToken: accessToken,
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: "378915159425595", //process.env['FACEBOOK_CLIENT_ID'],
      clientSecret: "7bd791932eaf12fbb75d0166721c0e02", //process.env['FACEBOOK_CLIENT_SECRET'],
      callbackURL: "http://localhost:5000/facebookRedirect", // relative or absolute path
      profileFields: ["id", "displayName", "email", "picture"],
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("FACEBOOK BASED OAUTH VALIDATION GETTING CALLED");
      return done(null, profile);
    }
  )
);

// These functions are required for getting data To/from JSON returned from Providers
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.use(routes);

mongooseService();

app.listen(port, () => {
  console.log(`Auth gateway running on  ${process.env.APP_URL}:${port}`);
});
