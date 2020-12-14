const express = require('express');

const AuthRoutes = require('./auth.routes');
const CalendarRoutes = require('./calendar.routes');
const UserRoutes = require('./user.routes');

const route = express.Router();

route.use(AuthRoutes);
route.use(UserRoutes);
route.use(CalendarRoutes);

module.exports = route;
