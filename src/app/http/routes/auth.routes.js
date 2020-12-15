const express = require('express');
const passport = require('passport');

// TODO:: ver erro no tokeen quando da get no calendario

const {
  postSignIn,
  postSignInGoogle,
} = require('../controllers/authController');

/**
 * Auth routes go here, including social auth
 */

const route = express.Router();

route.post('/auth/signin', postSignIn);

/**
 * Route to make the google auth,
 * you can pass one callback redirect url (optional).
 * like: https://api.privoce/auth/google?redirect=https://www.google.com
 * the result will be like: https://www.google.com/{token here}
 * If not povide, i will use the .env frontend url.
 * @param {string} redirect - Callback redirect url.
 */
route.get('/auth/google', (req, res, next) => {
  const returnTo = req.query.redirect;

  const state = returnTo
    ? Buffer.from(JSON.stringify({ returnTo })).toString('base64')
    : undefined;

  return passport.authenticate('google', {
    state,
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
    accessType: 'offline',
    approvalPrompt: 'force',
  })(req, res, next);
});
route.get('/googleRedirect', passport.authenticate('google'), postSignInGoogle);

module.exports = route;
