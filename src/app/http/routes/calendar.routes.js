const express = require('express');

const authMiddleware = require('../middleware/jwtMiddleware');
const {
  getUserEvents,
  newEventHandle,
} = require('../controllers/calendarController');

/**
 * Calendar routes go here
 */

const route = express.Router();

route.get('/user/calendar', authMiddleware, getUserEvents);

route.post('/new-event-handle', newEventHandle);
route.post('/cbe', newEventHandle);

module.exports = route;
