require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const routes = require("./routes");
const mongooseService = require("./app/services/mongoose");
const { addUser, findOneUser, findUser } = require("./app/repositories/user");

const app = express();
const port = process.env.PORT;

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

var opts = {};
opts.jwtFromRequest = function (req) {
  // tell passport to read JWT from cookies
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};
opts.secretOrKey = process.env.JWT_SECRET;

// main authentication, our app will rely on it
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    const result = await findOneUser(
      {
        password: encryptPassword(password),
        nickname: nickname.toLowerCase(),
      },
      {
        password: 0,
        contacts: 0,
      }
    );
    if (result) {
      return done(null, jwt_payload.data);
    } else {
      // user account doesnt exists in the DATA
      return done(null, false);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      //console.log(accessToken, refreshToken, profile)
      console.log("GOOGLE BASED OAUTH VALIDATION GETTING CALLED");
      return done(null, profile);
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
      console.log(profile);
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
