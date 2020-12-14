const express = require('express');

const { signupValidator } = require('../validators/auth');
const authMiddleware = require('../middleware/jwtMiddleware');
const {
  getMe,
  getVerifyEmail,
  postSignUp,
} = require('../controllers/userController');

/**
 * User routes go here
 */

const route = express.Router();

route.post('/auth/signup', signupValidator(), postSignUp);
route.get('/auth/verify-email', getVerifyEmail);
route.get('/auth/me', authMiddleware, getMe);

route.get('/auth/me', authMiddleware, getMe);

module.exports = route;
