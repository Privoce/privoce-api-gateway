const express = require("express");

const authMiddleware = require("../middleware/jwtMiddleware");
const { getUserEvents } = require("../controllers/calendarController");

/***********************************************
 // Calendar routes go here
 //
 ***********************************************/
const route = express.Router();

route.get("/user/calendar", authMiddleware, getUserEvents);

module.exports = route;
