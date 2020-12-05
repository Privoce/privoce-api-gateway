const express = require("express");

const authMiddleware = require("../middleware/jwtMiddleware");
const { getUserEvents, teste } = require("../controllers/calendarController");

/***********************************************
 // Calendar routes go here
 //
 ***********************************************/
const route = express.Router();

route.get("/user/calendar", authMiddleware, getUserEvents);

route.get("/teste", authMiddleware, teste);

module.exports = route;
